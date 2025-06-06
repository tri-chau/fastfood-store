<?php

namespace App\Http\Controllers;

use App\Models\Reviews;
use App\Models\Customer;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewsRequest;
use App\Http\Requests\UpdateReviewsRequest;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReviewsController extends Controller
{
    // private $customerId = '';
    // private $useHardcodedId = 0;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }
    
    public function checkFirebaseUser(Request $request)
    {
        \Log::debug('Checking Firebase user');
        $firebaseUser = $request->attributes->get('firebaseUser');
        if (!$firebaseUser) {
           \Log::info('cant find user firebase id'); // Ghi log
            return null;
        }

        \Log::info('Firebase user attributes:', $firebaseUser);
        // Tìm user trong database dựa vào Firebase UID
        return User::where('firebase_uid', $firebaseUser['sub'])->first();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        //
    }
    
    public function getReviewDetail(string $id)
    {
        $review = Reviews::findOrFail($id);

        $return_data = [
            'id' => $review->id,
            'customer_id' => $review->customer_id,
            'product_id' => $review->product_id,
            'order_detail_id' => $review->order_detail_id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'is_edited' => $review->is_edited,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at
        ];

        return response()->json([
            'success' => true,
            'data' => $return_data
        ], 200);
    }

    public function getCustomerProductReview(Request $request)
    {
        $validated = $request->validate([
            'product_id'      => 'required|uuid|exists:products,id'
        ]);
        
        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Development code
        // if ($this->useHardcodedId === 1)
        //     $customerId = $this->customerId;
        // $review = Reviews::where('customer_id', $customerId)

        $review = Reviews::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    public function getAllReviewsByProduct($productId)
    {
        $reviews = \App\Models\Reviews::with('customer') // eager load customer
            ->where('product_id', $productId)
            ->orderBy('rating', 'desc')
            ->get();

        // Map to include customer name in each review
        $reviews = $reviews->map(function($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'created_at' => $review->created_at,
                'comment' => $review->comment,
                'is_edited' => $review->is_edited,
                'customer_name' => $review->customer ? $review->customer->full_name : 'Ẩn danh',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'product_id'      => 'required|uuid|exists:products,id',
                'order_detail_id' => 'required|uuid|exists:order_details,id',
                'rating'          => 'required|integer|min:1|max:5',
                'comment'         => 'nullable|string',
                'is_edited'       => 'nullable|boolean',
            ]);

            $user = $this->checkFirebaseUser($request);

            if (!$user) {
                return response()->json(['message' => 'Unauthorized or User not found.'], 401);
            }

            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['message' => 'Customer not found.'], 404);
            }

            // Development code
            // if ($this->useHardcodedId === 1)
            //     $customerId = $this->customerId;
            // $existingReview = Reviews::where('customer_id', $customerId)
            // $validated['customer_id'] = $customerId;

            // Prevent duplicate review for the same product/order_detail/customer
            $existingReview = Reviews::where('customer_id', $customer->id)
                ->where('product_id', $validated['product_id'])
                ->first();

            if ($existingReview) {
                return response()->json(['message' => 'You have already reviewed this product.'], 409);
            }

            $validated['customer_id'] = $customer->id;
            $validated['is_edited'] = $validated['is_edited'] ?? false;

            $review = Reviews::create($validated);

            return response()->json([
                'message' => 'Review created successfully.',
                'data' => $review
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create review.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Reviews $reviews)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reviews $reviews)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'product_id'       => 'required|uuid|exists:products,id',
            'order_detail_id'  => 'required|uuid|exists:order_details,id',
            'rating'           => 'required|integer|min:1|max:5',
            'comment'          => 'nullable|string',
            'is_edited'        => 'nullable|boolean',
        ]);
        
        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }
        
        $review = Reviews::findOrFail($id);
        
        // Development code
        // if ($this->useHardcodedId === 1)
        //     $customerId = $this->customerId;
        // if ($review->customer_id !== $customerId) {
        // $validated['customer_id'] = $customerId;
            
        // Authorization: only the owner can update
            if ($review->customer_id !== $customer->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated['customer_id'] = $customer->id;
        $validated['is_edited'] = true;

        $review->update($validated);

        return response()->json(['message' => 'Review updated successfully.', 'data' => $review]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $review = Reviews::findOrFail($id);

        // Development code
        // if ($this->useHardcodedId === 1)
        //     $customerId = $this->customerId;
        // if ($review->customer_id !== $customerId) {

        // Authorization: only the owner can delete
        if ($review->customer_id !== $customer->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }
}

