<?php

namespace App\Http\Controllers;

use App\Models\Reviews;
use App\Models\Customer;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewsRequest;
use App\Http\Requests\UpdateReviewsRequest;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
            'product_id' => 'required|uuid|exists:products,id',
        ]);

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'       => 'required|uuid|exists:products,id',
            'order_detail_id'  => 'required|uuid|exists:order_details,id',
            'rating'           => 'required|integer|min:1|max:5',
            'comment'          => 'nullable|string',
            'is_edited'        => 'nullable|boolean',
        ]);
        
        $validated['is_edited'] = false;

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $validated['customer_id'] = $customer->id;

        $review = Reviews::create($validated);

        return response()->json(['message' => 'Review created successfully.', 'data' => $review], 201);
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

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $review = Reviews::findOrFail($id);

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
    public function destroy(string $id)
    {
        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $review = Reviews::findOrFail($id);

        // Authorization: only the owner can delete
        if ($review->customer_id !== $customer->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }

    // public function destroy(Reviews $reviews)
    // {
    //     $reviews->delete();

    //     return response()->json(['message' => 'Review deleted successfully.']);
    // }
}
