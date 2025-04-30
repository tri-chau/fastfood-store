<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Customer;
use App\Models\CustomerOrder;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Twilio\TwiML\Voice\Pay;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index()
    {
        $orders = Order::with(['customers', 'creator'])->get();
        return response()->json(['message' => 'Orders fetched successfully.', 'data' => $orders]);
    }
    public function deleteCart($orderId)
    {
        try {
            // Find the order by ID
            $order = Order::findOrFail($orderId);

            // Fetch all related pivot records (customers_orders) for this order
            $customerOrders = CustomerOrder::where('order_id', $orderId)->get();

            // Loop through each pivot record and delete the associated order details
            foreach ($customerOrders as $customerOrder) {
                // Delete toppings first (if any)
                foreach ($customerOrder->orderDetails()->where('parent_id', null)->get() as $orderDetail) {
                    // Delete toppings associated with this order detail
                    OrderDetail::where('parent_id', $orderDetail->id)->delete();
                }

                // Delete the order details
                $customerOrder->orderDetails()->delete();
            }

            // Detach all customers from the order (this will remove the pivot records)
            $order->customers()->detach();

            // Then delete the main order
            $order->delete();

            return response()->json(['message' => 'Order deleted successfully.'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Order not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    public function createCart(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required',
        ]);

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Create a new order
        $order = Order::create([
            'order_number' => 'ORD' . time(),
            'receiver_name' => $customer->full_name,
            'receiver_address' => '',
            'payment_method' => 'Cash',
            'order_status' => 'Draft',
            'type' => $validated['type'],
            'custom_name' => $request->get('custom_name'),
            'source' => 'Online',
            'customer_feedback' => '',
            'order_total' => 0,
            'host_id' => $customer->id,
        ]);

        // Attach the customer to the order using the pivot table
        $order->customers()->attach($customer->id);

        return response()->json(['message' => 'Cart created successfully.', 'data' => $order]);
    }

    public function loadCustomerOrders(Request $request)
    {
//        $currentUser = auth()->user();
//        if($currentUser->user_type == 'user') {
//            $customer = Customer::find($_GET["customerId"]);
//        } else {
//            $customer = Customer::where('user_id', $currentUser->id)->first();
//        }

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch all orders that belong to the customer
        $orders = Order::where('order_status', '<>', 'Draft')
            ->whereHas('customers', function ($query) use ($customer) {
                $query->where('customer_id', $customer->id);
            })
            ->orderBy('updated_at', 'DESC')
            ->get();

        $return_data = [];
        foreach ($orders as $order) {
            $orderCustomer = $order->customers()->where('customer_id', $customer->id)->first();

            $orderDetails = $orderCustomer->pivot->orderDetails()
                ->where('parent_id', null)
                ->with('toppings.product') // Include topping product details
                ->get();

            $data = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'date_created' => $order->created_at,
                'host_id' => $order->host_id,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'receiver_name' => $order->receiver_name,
                'status' => $order->order_status,
                'count_product' => $orderDetails->count(),
                'total_price' => $order->order_total,
                'order_date' => $order->updated_at,
                'rate' => $order->rate,
                'feedback' => $order->customer_feedback,
                'note' => $order->note,
            ];
            foreach ($orderDetails as $orderDetail) {
                $data['order_detail'][] = [
                    'id' => $orderDetail->id,
                    'order_detail_number' => $orderDetail->order_detail_number,
                    'product_id' => $orderDetail->product->id,
                    'product_name' => $orderDetail->product->name,
                    'product_price' => $orderDetail->product->price,
                    'size' => $orderDetail->size,
                    'quantity' => $orderDetail->quantity,
                    'image' => $orderDetail->product->image ? asset('storage_fail/build/assets/' . $orderDetail->product->image) : null,
                    'note' => $orderDetail->note,
                    'total_price' => $orderDetail->total_price,
                    'count_topping' => $orderDetail->toppings->count(),
                ];
            }
            $return_data[$order->order_status][] = $data;
        }

        return response()->json([
            'message' => 'Orders fetched successfully.',
            'data' => $return_data,
        ]);
    }
    public function loadCustomerOrdersHistory(Request $request)
    {
//        return response()->json([
//            'message' => 'Orders fetched successfully.',
//            'data' => Auth::user()->customer,
//        ]);
        $customer = Auth::user()->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch all orders that belong to the customer
        $orders = Order::where('order_status', '<>', 'Draft')
            ->whereHas('customers', function ($query) use ($customer) {
                $query->where('customer_id', $customer->id);
            })
            ->orderBy('updated_at', 'DESC')
            ->get();

        $return_data = [];
        foreach($orders as $order) {
            $orderCustomer = $order->customers()->where('customer_id', $customer->id)->first();

            $orderDetails = $orderCustomer->pivot->orderDetails()
                ->where('parent_id', null)
                ->with('toppings.product') // Include topping product details
                ->get();

            $data = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'date_created' => $order->created_at,
                'host_id' => $order->host_id,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'receiver_name' => $order->receiver_name,
                'status' => $order->order_status,
                'count_product' => $orderDetails->count(),
                'total_price' => $order->order_total,
                'order_date' => $order->updated_at,
                'rate' => $order->rate,
                'feedback' => $order->customer_feedback,
            ];
            $return_data[] = $data;
        }

        return response()->json([
            'message' => 'Orders fetched successfully.',
            'data' => $return_data,
        ]);
    }

    public function loadOrderDetail(Request $request, $orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            $currentUser = auth()->user();

            if($currentUser->user_type == 'user') {
                $customer_id = $order->host_id;
            } else {
                $customer_id = Customer::where('user_id', $currentUser->id)->first()->id;

                if (!$customer_id) {
                    return response()->json(['message' => 'Customer not found.'], 404);
                }
            }

            // Fetch the order
            $orderCustomer = $order->customers()->where('customer_id', $customer_id)->first();

            if ($orderCustomer) {
                // Get order details if the relationship exists
                $orderDetails = $orderCustomer->pivot->orderDetails()
                    ->where('parent_id', null)
                    ->with('toppings.product') // Include topping product details
                    ->get();

                $team = Team::find($order->team_id);
                $customer = Customer::find($order->host_id);
                $data = [
                    'type' => $order->type,
                    'order_number' => !empty($order->custom_name) ? $order->custom_name : $order->order_number,
                    'order_id' => $order->id,
                    'date_created' => $order->created_at,
                    'host_id' => $order->host_id,
                    'status' => $order->order_status,
                    'order_total' => $order->order_total - $this->calculateDiscount($order),
                    'count_product' => $orderDetails->count() ?? 0,
                    'order_detail' => [],
                    'customer_name' => $order->receiver_name,
                    'customer_phone' => $customer->phone_number,
                    'customer_level' => $customer->rank,
                    'from_name' => $team->name,
                    'from_address' => $team->address,
                    'to_name' => $order->receiver_name,
                    'to_address' => $order->receiver_address,
                    'shipping_fee' => $order->shipping_fee,
                    'discount' => $this->calculateDiscount($order),
                    'payment_method' => $order->payment_method,
                    'feedback' => [
                        'rating' => $order->rate ?? 0,
                        'content' => $order->customer_feedback,
                        'feedback_time' => $order->updated_at,
                    ],
                    'vouchers' => $order->vouchers->map(function ($voucher) {
                        return [
                            'id' => $voucher->id,
                            'voucher_code' => $voucher->vourcher_code,
                            'discount_amount' => $voucher->discount_amount,
                            'discount_percent' => $voucher->discount_percent,
                            'discount_type' => $voucher->discount_type,
                            'apply_type' => $voucher->apply_type,
                        ];
                    }),
                ];
                $total_price = 0;
                foreach ($orderDetails as $orderDetail) {
                    $total_price += $orderDetail->total_price;
                    $data['order_detail'][] = [
                        'order_detail_number' => $orderDetail->order_detail_number,
                        'product_id' => $orderDetail->product->id,
                        'product_name' => $orderDetail->product->name,
                        'product_price' => $orderDetail->product->price,
                        'size' => $orderDetail->size,
                        'quantity' => $orderDetail->quantity,
                        'image' => $orderDetail->product->image ? 'https://weevil-exotic-thankfully.ngrok-free.app/storage_fail/' .$orderDetail->product->image : 'https://weevil-exotic-thankfully.ngrok-free.app/resources/assets/images/empty-image.jpg',
                        'note' => $orderDetail->note,
                        'total_price' => $orderDetail->total_price,
                        'count_topping' => $orderDetail->toppings->count(),
                        'toppings' => $orderDetail->toppings->map(function ($topping) {
                            return [
                                'topping_id' => $topping->id,
                                'name' => $topping->product->name,
                                'price' => $topping->product->price,
                            ];
                        }),
                    ];
                }
                $data['total_price'] = $total_price;
                $return_data[] = $data;
            }

            return response()->json([
                'message' => 'Cart details fetched successfully.',
                'data' => $return_data
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Order not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

    }
    public function proceedOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'receiver_name' => 'required|string|max:255',
            'receiver_address' => 'required|string|max:255',
            'payment_method' => 'required|in:Cash,Banking',
//            'branch' => 'required|uuid|exists:teams,id',
            'voucher' => 'nullable|string',
            'voucher_shipping' => 'nullable|string',
            'note' => 'nullable|string',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'street' => 'required|string',
            'phone_number' => 'required|string',
            'shipping_fee' => 'required|numeric',
            'discount_number' => 'nullable|numeric',
            'order_total' => 'nullable|numeric',
        ]);

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($validated['order_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Update the order with the new details
        $order->update([
            'receiver_name' => $validated['receiver_name'],
            'receiver_address' => $validated['receiver_address'],
            'receiver_phone' => $validated['phone_number'],
            'payment_method' => $validated['payment_method'],
            'order_status' => 'Wait For Approval', // Update the status to 'Pending'
            'order_total' => $validated['order_total'],
            'note' => $validated['note'],
            'province' => $validated['province'],
            'district' => $validated['district'],
            'ward' => $validated['ward'],
            'street' => $validated['street'],
            'phone_number' => $validated['phone_number'],
//            'team_id' => $validated['branch'],
            'shipping_fee' => $validated['shipping_fee'],
        ]);

        // Apply vouchers if provided
        if (!empty($validated['voucher'])) {
            $order->vouchers()->attach($validated['voucher']);
        }

        if (!empty($validated['voucher_shipping'])) {
            $order->vouchers()->attach($validated['voucher_shipping']);
        }

        // Save the updated order
        $order->save();

        return response()->json([
            'message' => 'Order proceeded successfully.',
            'data' => $order,
        ]);
    }

    function markReceived(Request $request) {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($validated['order_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Update the order status to 'Delivered'
        $order->update([
            'order_status' => 'Completed',
        ]);

        return response()->json([
            'message' => 'Order marked as delivered successfully.',
            'data' => $order,
        ]);
    }
    function giveFeedback(Request $request) {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rate' => 'required|integer|min:1|max:5',
            'feedback' => 'required|string|max:255',
        ]);

        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($validated['order_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Update the order with the feedback
        $order->update([
            'rate' => $validated['rate'],
            'customer_feedback' => $validated['feedback'],
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'data' => $order,
        ]);
    }

    public function getCustomFields($data)
    {
        $customFields = [];
        try {
            foreach ($data as $item) {
                $customFields[$item->id] = [
                    'count_product' => 0,
                ];
                $orderCustomer = $item->customers()->where('customer_id', $item->host_id)->first();
                if($orderCustomer) {
                    $oderDetail = $orderCustomer->pivot->orderDetails()
                        ->where('parent_id', null)
                        ->with('toppings.product') // Include topping product details
                        ->get();
                    if($oderDetail) {
                        $customFields[$item->id] = [
                            'count_product' => $oderDetail->count(),
                        ];
                    }
                }
            }
            return $customFields;
        } catch (\Exception $e) {
            return $customFields;
        }

    }

    function calculateDiscount($order) {
        $totalDiscount = 0;
        foreach ($order->vouchers as $voucher) {
            if($voucher->apply_type == 'shipping_fee') continue;
            if ($voucher->discount_type == 'percent') {
                $totalDiscount += $order->order_total * $voucher->discount_percent / 100;
            } else {
                $totalDiscount += $voucher->discount_amount;
            }
        }
        return $totalDiscount;
    }
    public function addProductToCart(Request $request)
    {
//        return response()->json([
//            'message' => 'Cart added successfully.',
//            'data' => $request->all(),
//        ]);

        $validated = $request->validate([
            'product' => 'required',
            'product.product_id' => 'required',
            'product.size' => 'required',
            'product.quantity' => 'required',
            'product.toppings_id' => 'nullable|array', // Ensure toppings_id is an array
            'product.note' => 'nullable',
            'product.total_price' => 'required',
            'order_ids' => 'array', // Ensure order_ids is an array
        ]);

        // Check if product exists
        $product = Product::findOrFail($validated['product']['product_id']);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

//        $currentUser = auth()->user();
//        $customer = Customer::where('user_id', $currentUser->id)->first();

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        // Check if customer exists
        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        if(empty($validated['order_ids'])) {
            //Create order
            $order = Order::create([
                'order_number' => 'ORD' . time(),
                'receiver_name' => $customer->full_name,
                'receiver_address' => '',
                'payment_method' => 'Cash',
                'order_status' => 'Draft',
//                'type' => 'Personal', // team order
//                'custom_name' => '', // team order
                'source' => 'Online',
                'customer_feedback' => '',
                'order_total' => $validated['product']['total_price'],
                'host_id' => $customer->id,
            ]);
            $order->customers()->attach($customer->id);
            $validated['order_ids'] = [$order->id];
        }
        $orderIds = $validated['order_ids']; // Array of order IDs
        $addedProducts = []; // To store the added products for each cart

        foreach ($orderIds as $orderId) {
            // Fetch the order
            $order = Order::find($orderId);

            // If the order doesn't exist, skip it
            if (!$order) {
                continue;
            }

            // Ensure the order belongs to the current customer
            $customerOrder = CustomerOrder::where('customer_id', $customer->id)
                ->where('order_id', $order->id)
                ->first();

            if (!$customerOrder) {
                continue; // Skip if the customer doesn't have access to this order
            }

            // Update the order total
            $order->order_total += $validated['product']['total_price'];
//            $order->save();

            // Add order detail using the CustomerOrder pivot
            $orderDetail = $customerOrder->orderDetails()->create([
                'order_detail_number' => 'OD' . time(),
                'customer_order_id' => $customerOrder->id,
                'product_id' => $product->id,
                'parent_id' => null,
                'size' => $validated['product']['size'],
                'quantity' => $validated['product']['quantity'],
                'note' => $validated['product']['note'] ?? '',
                'total_price' => $validated['product']['total_price'],
            ]);

            // Add toppings if provided
            if (isset($validated['product']['toppings_id'])) {
                foreach ($validated['product']['toppings_id'] as $toppingId) {
                    $topping = Product::findOrFail($toppingId);

                    $extra_price = $topping->productsToppingThis()
                        ->where('product_id', $product->id)
                        ->first()->pivot->extra_price;

                    $orderDetail->toppings()->create([
                        'order_detail_number' => 'ODTP' . time(),
                        'customer_order_id' => $customerOrder->id,
                        'product_id' => $topping->id,
                        'size' => 'S',
                        'quantity' => $validated['product']['quantity'],
                        'total_price' => $extra_price * $validated['product']['quantity'],
                        'note' => '',
                        'parent_id' => $orderDetail->id,
                    ]);
                }
            }

            // Prepare the response data for this cart
            $addedProducts[] = [
                'order_id' => $order->id,
                'order_detail' => [
                    'id' => $orderDetail->id,
                    'order_detail_number' => $orderDetail->order_detail_number,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                    ],
                    'size' => $orderDetail->size,
                    'quantity' => $orderDetail->quantity,
                    'note' => $orderDetail->note,
                    'total_price' => $orderDetail->total_price,
                    'toppings' => $orderDetail->toppings,
                ],
            ];
        }

        return response()->json([
            'message' => 'Product added to multiple carts successfully.',
            'data' => $addedProducts,
        ]);
    }
    public function getExistedCart(Request $request) {
        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Get the latest order with status 'Draft' for the customer
        $orders = Order::where('host_id', $customer->id)
            ->where('order_status', 'Draft')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 404);
        }

        $return_data = [];

        foreach($orders as $order) {
            $return_data[] = [
                'order_id' => $order->id,
                'name' => $order->custom_name ? $order->custom_name : $order->order_number,
                'created_at' => $order->created_at,
                'host_id' => $order->host_id,
                'type' => $order->customers()->where('customer_id', $customer->id)->count() >= 2 ? 'Group' : 'Personal',
            ];
        }

        return response()->json([
            'message' => 'Cart fetched successfully.',
            'data' => $return_data
        ]);
    }
    public function loadCartDetail(Request $request, $id) {
        $currentUser = auth()->user();
        $customer = Customer::where('user_id', $currentUser->id)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($id);

        // Ensure the order belongs to the current customer and is in 'Draft' status
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('id', $order->host_id)
            ->whereHas('order', function ($query) {
                $query->where('order_status', 'Draft');
            })
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        $orderDetails = $customerOrder->orderDetails()
            ->where('parent_id', null)
            ->with('toppings.product') // Include topping product details
            ->get();

        $return_data = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'host_id' => $order->host_id,
            'order_detail' => []
        ];

        foreach ($orderDetails as $orderDetail) {
            $return_data['order_detail'][] = [
                'id' => $orderDetail->id,
                'order_detail_number' => $orderDetail->order_detail_number,
                'product_name' => $orderDetail->product->name,
                'product_price' => $orderDetail->product->price,
                'size' => $orderDetail->size,
                'quantity' => $orderDetail->quantity,
                'note' => $orderDetail->note,
                'total_price' => $orderDetail->total_price,
                'toppings' => $orderDetail->toppings->map(function ($topping) {
                    return [
                        'id' => $topping->id,
                        'name' => $topping->product->name,
                        'price' => $topping->product->price,
                    ];
                }),
            ];
        }

        return response()->json([
            'message' => 'Cart details fetched successfully.',
            'data' => $return_data
        ]);
    }

    public function checkFirebaseUser(Request $request)
    {
        \Log::debug('Checking Firebase user');
        $firebaseUser = $request->attributes->get('firebaseUser');
        if (!$firebaseUser) {
           // \Log::info('cant find user firebase id'); // Ghi log
            return null;
        }
        // Tìm user trong database dựa vào Firebase UID
        return User::where('firebase_uid', $firebaseUser['sub'])->first();
    }


    public function fetchCart(Request $request)
    {
//        // Lấy thông tin user từ Firebase Token
//        $firebaseUser = $request->attributes->get('firebaseUser');
//
//        if (!$firebaseUser) {
//            return response()->json(['message' => 'Unauthorized.'], 401);
//        }
//
//        // Tìm user trong database dựa vào Firebase UID
//        $user = User::where('firebase_uid', $firebaseUser['sub'])->first();

        $user = $this->checkFirebaseUser($request);
        if (!$user) {
            \Log::info('fail to find user'); // Ghi log
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }
        $customer = $user->customer;
        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }
        // Get the latest order with status 'Draft' for the customer
        $orders = Order::where('host_id', $customer->id)
            ->where('order_status', 'Draft')
            ->orderBy('updated_at', 'DESC')
            ->get();
        $return_data = [];

        foreach($orders as $order) {
            $total_price = 0;
            // Fetch order details only if the relationship exists
            $orderCustomer = $order->customers()->where('customer_id', $customer->id)->first();
            if ($orderCustomer) {
                // Get order details if the relationship exists
                $orderDetails = $orderCustomer->pivot->orderDetails()
                    ->where('parent_id', null)
                    ->with('toppings.product') // Include topping product details
                    ->get();
                $data = [
                    'type' => $order->type,
                    'name' => !empty($order->custom_name) ? $order->custom_name : $order->order_number,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'date_created' => $order->created_at,
                    'host_id' => $order->host_id,
                    'count_product' => $orderDetails->count() ?? 0,
                    'order_detail' => []
                ];
                foreach ($orderDetails as $orderDetail) {
                    $total_price += $orderDetail->total_price;
                    $data['order_detail'][] = [
                        'id' => $orderDetail->id,
                        'order_detail_number' => $orderDetail->order_detail_number,
                        'product_id' => $orderDetail->product->id,
                        'product_name' => $orderDetail->product->name,
                        'product_price' => $orderDetail->product->price,
                        'size' => $orderDetail->size,
                        'quantity' => $orderDetail->quantity,
                        'image' => $orderDetail->product->image ? asset('/storage_fail/build/assets/' . $orderDetail->product->image) : null,
                        'note' => $orderDetail->note,
                        'total_price' => $orderDetail->total_price,
                        'count_topping' => $orderDetail->toppings->count(),
                        'toppings' => $orderDetail->toppings->map(function ($topping) use ($orderDetail) {
                            return [
                                'id' => $topping->id,
                                'topping_id' => $topping->product->id,
                                'name' => $topping->product->name,
                                'price' => $topping->total_price,
                            ];
                        }),
                    ];
                }
                $data['total_price'] = $total_price;
                $return_data[] = $data;
            }
        }

        \Log::info('fetchCart method called'); // Ghi log
        return response()->json([
            'message' => 'Cart fetched successfully.',
            'data' => $return_data
        ]);
    }
    public function updateProductInCart(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'order_detail_id' => 'required|exists:order_details,id',
            'size' => 'required',
            'toppings_id' => 'nullable|array', // Ensure toppings_id is an array
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
            'total_price' => 'required|numeric|min:0',
        ]);

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($validated['order_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Fetch the order detail to update
        $orderDetail = OrderDetail::findOrFail($validated['order_detail_id']);

        // Ensure the order detail belongs to the specified order
        if ($orderDetail->customer_order_id !== $customerOrder->id) {
            return response()->json(['message' => 'Unauthorized or invalid order detail.'], 403);
        }

        // Calculate the difference in total price before and after update
        $previousTotalPrice = $orderDetail->total_price;
        $newTotalPrice = $validated['total_price'];
        $priceDifference = $newTotalPrice - $previousTotalPrice;

        // Update the order total
        $order->order_total += $priceDifference;
        $order->save();

        // Update the order detail
        $orderDetail->update([
            'size' => $validated['size'],
            'quantity' => $validated['quantity'],
            'note' => $validated['note'] ?? '',
            'total_price' => $validated['total_price'],
        ]);

        // Remove all existing toppings
        $orderDetail->toppings()->delete();


        // Add new toppings if provided
        if (isset($validated['toppings_id'])) {
            foreach ($validated['toppings_id'] as $toppingId) {
                $topping = Product::findOrFail($toppingId);

                $extra_price = $topping->productsToppingThis()
                    ->where('product_id', $orderDetail->product_id)
                    ->first()->pivot->extra_price;

                $orderDetail->toppings()->create([
                    'order_detail_number' => 'ODTP' . time(),
                    'customer_order_id' => $customerOrder->id,
                    'product_id' => $topping->id,
                    'size' => 'S',
                    'quantity' => $validated['quantity'],
                    'total_price' => $extra_price * $validated['quantity'],
                    'note' => '',
                    'parent_id' => $orderDetail->id,
                ]);
            }
        }

        // Prepare the response data
        $updatedProduct = [
            'order_id' => $order->id,
            'order_detail' => [
                'id' => $orderDetail->id,
                'order_detail_number' => $orderDetail->order_detail_number,
                'product' => [
                    'id' => $orderDetail->product->id,
                    'name' => $orderDetail->product->name,
                    'price' => $orderDetail->product->price,
                ],
                'size' => $orderDetail->size,
                'quantity' => $orderDetail->quantity,
                'note' => $orderDetail->note,
                'total_price' => $orderDetail->total_price,
                'toppings' => $orderDetail->toppings->map(function ($topping) use ($orderDetail) {
                    return [
                        'id' => $topping->id,
                        'name' => $topping->product->name,
                        'price' => $topping->product->productsToppingThis()
                        ->where('product_id', $orderDetail->product_id)
                        ->first()->pivot->extra_price,
                    ];
                }),
            ],
        ];

        return response()->json([
            'message' => 'Product updated in cart successfully.',
            'data' => $updatedProduct,
        ]);
    }
    public function removeProductFromCart(Request $request)
    {
        $validated = $request->validate([
            'cart_id' => 'required | exists:orders,id', // Ensure the cart_id (order_id) exists
            'order_detail_id' => 'required | exists:order_details,id',
        ]);

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order (cart)
        $order = Order::findOrFail($validated['cart_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Fetch the order detail to delete
        $orderDetail = OrderDetail::findOrFail($validated['order_detail_id']);

        // Ensure the order detail belongs to the specified order
        if ($orderDetail->customer_order_id !== $customerOrder->id) {
            return response()->json(['message' => 'Unauthorized or invalid order detail.'], 403);
        }

        // Delete related toppings (if any)
        $orderDetail->toppings()->delete();

        // Update the order total
        $order->order_total -= $orderDetail->total_price;
        $order->save();

        // Delete the order detail
        $orderDetail->delete();

        return response()->json(['message' => 'Product removed from cart successfully.']);
    }
    public function removeToppingFromCart(Request $request)
    {
        $validated = $request->validate([
            'cart_id' => 'required | exists:orders,id', // Ensure the cart_id (order_id) exists
            'order_detail_id' => 'required | exists:order_details,id',
            'topping_id' => 'required | exists:order_details,id',
        ]);

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order (cart)
        $order = Order::findOrFail($validated['cart_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Fetch the order detail
        $orderDetail = OrderDetail::findOrFail($validated['order_detail_id']);

        // Ensure the order detail belongs to the specified order
        if ($orderDetail->customer_order_id !== $customerOrder->id) {
            return response()->json(['message' => 'Unauthorized or invalid order detail.'], 403);
        }

        // Fetch the topping to delete
        $topping = OrderDetail::findOrFail($validated['topping_id']);

        // Ensure the topping belongs to the specified order detail
        if ($topping->parent_id !== $orderDetail->id) {
            return response()->json(['message' => 'Unauthorized or invalid topping.'], 403);
        }

        // Update the order total
        $order->order_total -= $topping->total_price;
        $order->save();

        // update the order detail total price
        $orderDetail->total_price -= $topping->total_price;
        $orderDetail->save();

        // Delete the topping
        $topping->delete();

        return response()->json(['message' => 'Topping removed from cart successfully.']);
    }
    public function cancelOrder(Request $request) {
        $validated = $request->validate([
            'order_id' => 'required | exists:orders,id',
        ]);

        $user = $this->checkFirebaseUser($request);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized or User not found.'], 401);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        // Fetch the order
        $order = Order::findOrFail($validated['order_id']);

        // Ensure the order belongs to the current customer
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        if (!$customerOrder) {
            return response()->json(['message' => 'Unauthorized or invalid order.'], 403);
        }

        // Update the order status to 'Cancelled'
        $order->update(['order_status' => 'Cancelled']);

        return response()->json(['message' => 'Order cancelled successfully.']);
    }
    /**
     * Store a newly created order in storage_fail.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required | string | unique:orders,order_number | max:255',
            'receiver_name' => 'required | string | max:255',
            'receiver_address' => 'required | string | max:255',
            'payment_method' => 'required | in:Banking,Cash',
            'payment_status' => 'required | in:pending,paid',
            'order_status' => 'required | in:Wait for Approval, In Progress, Delivering, Delivered, Completed, Cancelled',
            'date_created' => 'required | date',
            'order_total' => 'nullable | numeric | min:0',
            'rate' => 'nullable | integer | min:0 | max:5',
            'customer_feedback' => 'nullable | string | max:255',
            'host_id' => 'required | uuid | exists:customers,id',
            'manually_created_by' => 'nullable | uuid | exists:users,id',
            'source' => 'required | in:Offline,Online',
            'team_id' => 'required | uuid | exists:teams,id',
            'created_by' => 'required | uuid | exists:users,id',
        ]);

        $order = Order::create($validated);

        return response()->json(['message' => 'Order created successfully . ', 'data' => $order], 201);
    }

    /**
     * Display the specified order.
     */
    public function show(string $id)
    {
        $order = Order::with(['customer', 'createdBy', 'manuallyCreatedBy', 'team'])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update the specified order in storage_fail.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'order_number' => 'nullable | string | unique:orders,order_number,' . $id . ' | max:255',
            'receiver_name' => 'nullable | string | max:255',
            'receiver_address' => 'nullable | string | max:255',
            'payment_method' => 'nullable | in:Banking,Cash',
            'payment_status' => 'nullable | in:pending,paid',
            'order_status' => 'nullable',
            'date_created' => 'nullable | date',
            'order_total' => 'nullable | numeric | min:0',
            'rate' => 'nullable | integer | min:0 | max:5',
            'customer_feedback' => 'nullable | string | max:255',
            'host_id' => 'nullable | uuid | exists:customers,id',
            'manually_created_by' => 'nullable | uuid | exists:users,id',
            'source' => 'nullable | in:Offline,Online',
            'team_id' => 'nullable | uuid | exists:teams,id',
            'created_by' => 'nullable | uuid | exists:users,id',
            'toppings' => 'nullable | array',
        ]);

        $order = Order::findOrFail($id);
        $order->update($validated);



        return response()->json(['message' => 'Order updated successfully . ', 'data' => $order]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'order_status' => 'required',
        ]);

        $order = Order::findOrFail($id);
        $order->update($validated);

        return response()->json(['message' => 'Order updated successfully . ', 'data' => $order]);
    }

    /**
     * Remove the specified order from storage_fail (soft delete).
     */
    public function destroy(string $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->delete();

            return response()->json(['message' => 'Order deleted successfully . ']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Order not found . '], 404);
        }
    }

    /**
     * Restore a soft-deleted order.
     */
    public function restore(string $id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->restore();

        return response()->json(['message' => 'Order restored successfully . ']);
    }

    /**
     * Permanently delete a soft-deleted order.
     */
    public function forceDelete(string $id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->forceDelete();

        return response()->json(['message' => 'Order permanently deleted . ']);
    }

    /**
     * Create a new order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminCreateOrder(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'payment_method' => 'required|in:Cash,Banking',
            'customer_id' => 'required|exists:customers,id'
        ]);

        // Fetch the customer
        $customer = Customer::findOrFail($validated['customer_id']);

        // Get the current user
        $currentUser = auth()->user();

        // Create the order
        $order = Order::create([
            'order_number' => 'ORD' . time(),
            'receiver_name' => $customer->full_name,
            'receiver_address' => $customer->province . ', ' . $customer->district . ', ' . $customer->ward . ', ' . $customer->street,
            'payment_method' => $validated['payment_method'],
            'order_status' => 'In Progress',
            'type' => 'Personal',
            'custom_name' => '',
            'source' => 'Offline',
            'order_total' => 0,
            'host_id' => $customer->id,
//            'team_id' => $currentUser->team_id,
            'created_by' => $currentUser->id,
            'customer_feedback' => '',
        ]);

        // Attach the customer to the order using the pivot table
        $order->customers()->attach($customer->id);

        // Retrieve the customer_order_id from the pivot
        $customerOrder = CustomerOrder::where('customer_id', $customer->id)
            ->where('order_id', $order->id)
            ->first();

        $orderTotal = 0;

        // Add order details
        foreach ($request->get('order_details') as $detail) {
            // Add order detail using the CustomerOrder pivot
            $orderDetail = $customerOrder->orderDetails()->create([
                'order_detail_number' => 'OD' . time(),
                'customer_order_id' => $customerOrder->id,
                'product_id' => $detail['product_id'],
                'parent_id' => null,
                'size' => $detail['size'],
                'quantity' => $detail['quantity'],
                'note' => $detail['note'] ?? '',
                'total_price' => $detail['total_price'],
            ]);

            // Add toppings if provided
            if (isset($detail['toppings'])) {
                foreach ($detail['toppings'] as $toppingObject) {
                    $topping = Product::findOrFail($toppingObject['product_id']);
                    $orderDetail->toppings()->create([
                        'order_detail_number' => 'ODTP' . time(),
                        'customer_order_id' => $customerOrder->id,
                        'product_id' => $topping->id,
                        'size' => 'S',
                        'quantity' => 1,
                        'note' => '',
                        'parent_id' => $orderDetail->id,
                    ]);
                }
            }

            $orderTotal += $detail['total_price'];
        }

        // Update the order total
        if($request->get('voucher_id')) {
            $order->vouchers()->attach($request->get('voucher_id'));
        }
        $order->order_total = $orderTotal;
        $order->save();
        if($validated['payment_method'] == 'Banking') {
            $payos = new PayOSController();
            $result = $payos->genPayment($order->id);
            if($result['success']) $order['payment'] = $result['checkoutUrl'];
        }
        return response()->json([
            'message' => 'Order created successfully.',
            'data' => $order,
        ], 200);
    }
}
