<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends BaseController
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request): JsonResponse
    {
//        return response()->json([
//            'message' => 'Products retrieved successfully.',
//            'data' => $request->all(),
//        ], 200);

        // Get the number of items to fetch, defaulting to 10
        $pageSize = $request->input('page_size', 10);

        // Initialize the query builder for products
        $query = Product::select('products.id as product_id',
            'products.name as product_name',
            'products.description as product_description',
            'products.price as product_price',
            'products.image as product_image',
            'products.is_topping as is_topping',
            'categories.id as category_id',
            'categories.name as category_name',
            'categories.priority as category_priority',
            'categories.description as category_description')
            ->join('category_product', 'category_product.product_id', '=', 'products.id') // Join with the pivot table
            ->join('categories', 'categories.id', '=', 'category_product.category_id')  // Join with the categories table
        ;  // Assuming ascending priority

//        $query->orderBy('products.id', 'asc');  // Order products within the category

//        if ($request->input('last_product_id') !== 'undefined') {
//            $query->where('product_id', '>', $request->input('last_product_id'));
//                    return response()->json([
//            'message' => 'Products retrieved successfully.',
//            'data' => $request->all(),
//        ], 200);
//        }

        // Fetch the products
        $products = $query->get();
        $products_count = $query->count();

        $return_data = [];
        $topping_data = [];
        $prev_category_id = null;
        foreach ($products as $product) {
            if ($product->is_topping === 1) {
                if ($prev_category_id != $product->category_id) {
                    $topping_data[$product->category_id] = [
                        'category_name' => $product->category_name,
                        'category_id' => $product->category_id,
                    ];
                    $prev_category_id = $product->category_id;
                }
                $topping_data[$product->category_id]['topping_list'][] = [
                    'product_id' => $product->product_id,
                    'product_name' => $product->product_name,
                    'product_description' => $product->product_description,
                    'product_price' => $product->product_price,
                ];
            } else {
                if ($prev_category_id != $product->category_id) {
                    $return_data[$product->category_id] = [
                        'category_name' => $product->category_name,
                        'category_id' => $product->category_id,
                        'category_priority' => $product->priority,
                        'category_description' => $product->category_description,
                    ];
                    $prev_category_id = $product->category_id;
                }
                $return_data[$product->category_id]['product_list'][] = [
                    'product_id' => $product->product_id,
                    'product_name' => $product->product_name,
                    'product_description' => $product->product_description,
                    'product_price' => $product->product_price,
                ];
            }
        }

        // Determine if there are more products to load
        $hasMore = $products_count !== $pageSize;

        // Get the last product's ID to use as a cursor for the next request
        $lastProductId = $products->isNotEmpty() ? $products->last()->product_id : null;
        $firstProductId = $products->isNotEmpty() ? $products->first()->product_id : null;

        return response()->json([
            'message' => 'Products retrieved successfully.',
            'data' => $this->toArray($return_data),
            'products_count' => $products_count,
            'topping_data' => $this->toArray($topping_data),
            'pagination' => [
                'last_product_id' => $lastProductId,  // Provide the ID of the last fetched product for cursor-based pagination
                'first_product_id' => $firstProductId,
                'has_more' => $hasMore,               // Indicate if there are more products to load
            ],
        ], 200);
    }


    public function getProducts(Request $request, $category = null): JsonResponse
    {
//        return response()->json([
//            'message' => 'Products retrieved successfully.',
//            'data' => $request->all(),
//        ], 200);

        // Initialize the query builder for products
        $query = Product::select('products.id as product_id',
            'products.name as product_name',
            'products.description as product_description',
            'products.price as product_price',
            'products.image as product_image',
            'categories.id as category_id',
            'categories.name as category_name',
            'categories.priority as category_priority',
            'categories.description as category_description')
            ->join('category_product', 'category_product.product_id', '=', 'products.id') // Join with the pivot table
            ->join('categories', 'categories.id', '=', 'category_product.category_id')  // Join with the categories table
            ->where('products.status', 'active')
            ->where('products.is_topping', 0);

//        $query = Product::All();

        $limit = $request->input('limit');

        $keyword = $request->query('q');

        if ($keyword) {
            $query->where('name', 'LIKE', "%$keyword%")
                ->orWhereHas('categories', function ($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%$keyword%");
                });
        }

        if ($category != null) {
            $query = $query->where('categories.name', $category);
        }

        // Apply name filter if present
        if ($request->has('searchText') && $request->input('searchText') !== null) {
            $keyword = $request->input('searchText');
            $query->where('products.name', 'LIKE', "%$keyword%")
                ->orWhereHas('categories', function ($q) use ($keyword) {
                    $q->where('categories.name', 'LIKE', "%$keyword%");
                });
        }

        // Apply price range filters if present
        if ($request->has('min_price')) {
            $query->where('products.price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('products.price', '<=', $request->input('max_price'));
        }

        //Apply created_at filter if present
        if ($request->has('from_date')) {
            $query->whereDate('products.created_at', '>=', $request->input('created_at'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('products.created_at', '<=', $request->input('created_at'));
        }

        // Apply category filter if present
        if ($request->has('category_id') && $request->input('category_id') !== 'all') {
            $query->where('category_product.category_id', $request->input('category_id'));
        }

        // Apply cursor-based pagination if the 'last_product_id' parameter is present
        if ($request->has('last_product_id')) {
            $query->where('products.id', '>', $request->input('last_product_id'));
        }

        // Apply order sort
        if ($request->has('order') && in_array($request->input('order'), ['asc', 'desc'])) {
            $sort = $request->input('order');
            if ($sort == 'asc') {
                $query->orderBy('products.price', 'asc');
            } else {
                $query->orderBy('products.price', 'desc');
            }
        } else {
            // Order by category priority
            $query->orderBy('categories.priority', 'desc');

//            if ($limit && $limit !== 'undefined') {
//                // Order by category priority
//                $query->orderBy('products.priority', 'desc');  // Assuming ascending priority
//            }
        }
        // Thêm orderBy
        $query->orderBy('categories.priority', 'desc')
            ->orderBy('categories.id', 'asc')
            ->orderBy('products.priority', 'desc');

        // Get the number of items to fetch, defaulting to 10
        $pageSize = $request->input('page_size', 10);

        // Fetch the products
        if ($request->input('category_id') === 'all')
            $products = $query->get();
        else
            $products = $query->limit($limit === 'undefined' || is_null($limit) ? $pageSize : $limit)->get();

//        $return_data = [];
//        $prev_category_id = null;
//        foreach ($products as $product) {
//            if ($prev_category_id != $product->category_id) {
//                $return_data[$product->category_id] = [
//                    'category_name' => $product->category_name,
//                    'category_id' => $product->category_id,
//                    'category_priority' => $product->category_priority,
//                    'category_description' => $product->category_description,
//                ];
//                $prev_category_id = $product->category_id;
//            }
//            $return_data[$product->category_id]['product_list'][] = [
//                'product_id' => $product->product_id,
//                'product_name' => $product->product_name,
//                'product_description' => $product->product_description,
//                'product_price' => $product->product_price,
//                'product_image' => $product->product_image ? asset('storage/build/assets/Product/' . $product->product_image) : null,
//            ];
//        }
        $return_data = [];
        foreach ($products as $product) {
            $category_id = $product->category_id;
            if (!isset($return_data[$category_id])) {
                $return_data[$category_id] = [
                    'category_name' => $product->category_name,
                    'category_id' => $product->category_id,
                    'category_priority' => $product->category_priority,
                    'category_description' => $product->category_description,
                    'product_list' => [],
                ];
            }
            $return_data[$category_id]['product_list'][] = [
                'product_id' => $product->product_id,
                'product_name' => $product->product_name,
                'product_description' => $product->product_description,
                'product_price' => $product->product_price,
                'product_image' => $product->product_image ? asset('storage/build/assets/Product/' . $product->product_image) : null,
            ];
        }
        $return_data = array_values($return_data); // Chuyển mảng key bằng category_id thành mảng số

        // Determine if there are more products to load
        $hasMore = $products->count() < $query->count();

        // Get the last product's ID to use as a cursor for the next request
        $lastProductId = $products->isNotEmpty() ? $products->last()->product_id : null;

        return response()->json([
            'message' => 'Products retrieved successfully.',
            'data' => $this->toArray($return_data),
            'products_count' => $products->count(),
            'pagination' => [
                'last_product_id' => $lastProductId,  // Provide the ID of the last fetched product for cursor-based pagination
                'has_more' => $hasMore,               // Indicate if there are more products to load
            ],
        ], 200);
    }

    public function getProductDetail(string $id)
    {
        $product = Product::findOrFail($id);

        $toppingList = $product->toppings()
            ->select('id', 'name', 'extra_price') // Select only the columns you need
            ->get()
            ->map(function ($topping) {
                return [
                    'id' => $topping->id,
                    'name' => $topping->name,
                    'price' => $topping->extra_price,
                    'is_selected' => false
                ];
            });

        $return_data = [
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'topping_list' => $toppingList,
            'image_url' => $product->image ? asset('storage/build/assets/Product/' . $product->image) : null,
            'productDetailImages' => $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_url' => asset('storage/build/assets/Product/' . $image->image_path),
                ];
            }),

            // array_filter() removes null values from the array
            'size_list' => array_filter([
                ['name' => 'S', 'price' => 0],
                $product->up_m_price !== '0.00' ? ['name' => 'M', 'price' => $product->up_m_price] : null,
                $product->up_l_price !== '0.00' ? ['name' => 'L', 'price' => $product->up_l_price] : null,
            ])
        ];

        return response()->json([
            'success' => true,
            'data' => $return_data
        ], 200);
    }

    public function toArray($data)
    {
        $returned_data = [];
        foreach ($data as $row) {
            $returned_data[] = $row;
        }
        return $returned_data;
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
//        return response()->json([
//            'message' => 'Products validated successfully.',
//            'data' => $request->get('toppings_id'),
//        ], 200);

        // Validate incoming data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnailImage' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',  // The thumbnail must be a valid image file
            'productDetailImages' => 'nullable|array',  // images must be an array
            'productDetailImages.*' => 'required|image|mimes:jpg,jpeg,png|max:2048',  // Each image must be a valid image file
            'status' => 'required|in:active,inactive',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'up_m_price' => 'nullable|numeric|min:0',
            'up_l_price' => 'nullable|numeric|min:0',
            'is_topping' => 'boolean',
            'priority' => 'nullable|min:0',

            'categories_id' => 'required|array',  // Categories must be an array
            'categories_id.*' => 'required|string|exists:categories,id',  // Each category must exist in the database
            'toppings_id' => 'nullable|array',
        ]);

        try {
            // Create the product with validated data
            $product = Product::create($validated);

            if ($request->hasFile('thumbnailImage')) {
                $image = $request->file('thumbnailImage');
                // Chỉ lưu tên file vào cột image
                $filename = $image->hashName();
                $image->storeAs('build/assets/Product', $filename, 'public');
                $product->update(['image' => $filename]);
            }

            // Attach categories to the product
            $product->categories()->attach($validated['categories_id']);

            // If the product is not a topping and toppings are provided, attach toppings
            if (!$validated['is_topping'] && $request->has('toppings_id')) {
                $toppings = $request->get('toppings_id');

                // Ensure toppings is an array
                $toppingsArray = [];

                foreach ($toppings as $toppingJson) {
                    $topping = json_decode($toppingJson, true); // Convert JSON string to an array
                    if (isset($topping['toppingId']['extra_price']) && isset($topping['toppingId']['topping_id'])) {
                        $toppingsArray[$topping['toppingId']['topping_id']] = [
                            'extra_price' => $topping['toppingId']['extra_price'],
                        ];
                    }
                }

                $product->toppings()->attach($toppingsArray);
            }

            // Handle image uploads
            if ($request->hasFile('productDetailImages')) {
                $productDetailImages = $request->file('productDetailImages');

                if (is_array($productDetailImages)) {
                    foreach ($productDetailImages as $image) {
                        if ($image->isValid()) {
                            // Store each image in 'build/assets/product_image' directory
                            $path = $image->store('build/assets/Product', 'public');

                            // Create a record for each image in the product's images table
                            $product->images()->create(['image_path' => $path]);
                        } else {
                            Log::error('Invalid image file', ['file' => $image]);
                        }
                    }
                } else {
                    Log::error('productDetailImages is not an array', ['productDetailImages' => $productDetailImages]);
                }
            }

            // Return the response with the newly created product, including its images
            return response()->json(['message' => 'Product created successfully.', 'data' => $product], 201);

        } catch (\Exception $e) {
            Log::error('Error creating product', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error creating product', 'error' => $e->getMessage()], 500);
        }
    }

    public function getToppingOptions(Request $request): JsonResponse
    {
        $topping_name = $request->input('topping_name');
        if ($topping_name != null) {
            // Retrieve all teams with only id and name fields
            $products = Product::where('is_topping', true)->where('name', 'like', '%' . $topping_name . '%')->get(['id', 'name', 'image']);
        } else {
            // Retrieve all teams with only id and name fields
            $products = Product::where('is_topping', true)->get(['id', 'name', 'image']);
        }
        // Add the total number of employees to each team
        $products = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $product->image ? 'https://weevil-exotic-thankfully.ngrok-free.app/storage/' . $product->image : 'https://weevil-exotic-thankfully.ngrok-free.app/resources/assets/images/empty-image.jpg',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ], 200);
    }

    public function getProductOptions(Request $request): JsonResponse
    {
        $product_name = $request->input('product_name');
        // Retrieve all teams with only id and name fields
        if ($product_name != null) {
            $products = Product::where('name', 'like', '%' . $product_name . '%')->get();
        } else {
            $products = Product::all();
        }

        // Add the total number of employees to each team
        $products = $products->map(function ($product) {
            $toppingList = $product->toppings()
                ->select('id', 'name', 'price') // Select only the columns you need
                ->get()
                ->map(function ($topping) {
                    return [
                        'id' => $topping->id,
                        'name' => $topping->name,
                        'price' => $topping->price,
                        'is_selected' => false
                    ];
                });

            return [
                'id' => $product->id,
                'name' => $product->name,
                'image_url' => $product->image ? 'https://weevil-exotic-thankfully.ngrok-free.app/storage/' . $product->image : 'https://weevil-exotic-thankfully.ngrok-free.app/resources/assets/images/empty-image.jpg',
                'price' => $product->price,
                'toppings' => $toppingList,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ], 200);
    }

    /**
     * Display the specified product.
     */
    public function show(string $id)
    {
        $product = Product::with(['images', 'categories', 'toppings'])->findOrFail($id);

        // Map image paths to full URLs
        $product['categories_id'] = $product->categories()->pluck('id');
        $product['toppings_id'] = $product->toppings()->pluck('id');
        $product['images_list'] = $product->images->map(function ($image) {
            return [
                'id' => $image->id,
                'image_url' => asset('storage/' . $image->image_path),  // Generate the full URL
                'image_path' => $image->image_path,  // Original image path
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $product
        ], 200);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, string $id)
    {
//        return response()->json([
//            'message' => 'Products validated successfully.',
//            'data' => $request->all(),
//        ], 200);
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'up_m_price' => 'nullable|numeric|min:0',
            'up_l_price' => 'nullable|numeric|min:0',
            'is_topping' => 'nullable|boolean',
            'priority' => 'nullable|min:0',

            'categories_id' => 'nullable|array',
            'categories_id.*' => 'nullable|string|exists:categories,id',
            'productDetailImages' => 'nullable|array',  // images must be an array
            'thumbnailImage' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',  // The thumbnail must be a valid image file
            'toppings_id' => 'nullable|array',
        ]);

        $product = Product::findOrFail($id);
        $product->update($validated);

        // Attach categories to the product
        if (isset($validated['categories_id'])) {
            $product->categories()->sync($validated['categories_id']);
        }

        $product->toppings()->detach();
        // If not a topping, attach toppings
        if (!$validated['is_topping'] && $request->has('toppings_id')) {
            $toppings = $request->get('toppings_id');

            // Ensure toppings is an array
            $toppingsArray = [];

            foreach ($toppings as $toppingJson) {
                $topping = json_decode($toppingJson, true); // Convert JSON string to an array
                if (isset($topping['toppingId']['extra_price']) && isset($topping['toppingId']['topping_id'])) {
                    $toppingsArray[$topping['toppingId']['topping_id']] = [
                        'extra_price' => $topping['toppingId']['extra_price'],
                    ];
                }
            }

            // Use sync instead of attach to update the pivot table
            $product->toppings()->attach($toppingsArray);
        }

        if ($request->hasFile('thumbnailImage')) {
            $image = $request->file('thumbnailImage');
            // Chỉ lưu tên file vào cột image
            $filename = $image->hashName();
            $image->storeAs('build/assets/Product', $filename, 'public');
            $product->update(['image' => $filename]);
        }

        // Handle Base64 images
//        if (isset($validated['productDetailImages'])) {
//            // Delete old images if necessary
//            foreach ($product->images as $image) {
//                Storage::disk('public_fail')->delete($image->image_path);
//                $image->delete();
//            }
//            $index = 0;
//            // Save new images from Base64
//            foreach ($validated['productDetailImages'] as $base64Image) {
//                $image_parts = explode(";base64,", $base64Image);
//                $image_type_aux = explode("image/", $image_parts[0]);
//                return response()->json([
//                    'message' => 'Products validated  2 successfully.',
//                    'data' => $image_parts,
//                ], 200);
//                $image_type = $image_type_aux[1];
//
//                $image_base64 = base64_decode($image_parts[1]);
//                $filename = uniqid('product_') . '.' . $image_type; // Generate a unique name
//                $directory = storage_path('app/public_fail/build/assets/product_image'); // Target directory
//                $path = "$directory/$filename";
//
//
//
//                // Ensure the directory exists
//                if (!file_exists($directory)) {
//                    mkdir($directory, 0755, true);
//                }
//
//                // Save the decoded content to the file
//                file_put_contents($path, $image_base64);
//
//                // Save the relative path in the database
//                $product->images()->create(['image_path' => "product_image/$filename"]);
//
////                // Set the first image as the main image (image attribute)
////                if ($index === 0) {
////                    $product->update(['image' => "products/$filename"]);
////                }
////                $index++;
//            }

        // Handle image uploads
        if ($request->hasFile('productDetailImages')) {
            $productDetailImages = $request->file('productDetailImages');
            if (is_array($productDetailImages)) {
                foreach ($productDetailImages as $image) {
                    if ($image->isValid()) {
                        // Chỉ lưu tên file vào cột image_path
                        $filename = $image->hashName();
                        $image->storeAs('build/assets/Product', $filename, 'public');
                        $product->images()->create(['image_path' => $filename]);
                    } else {
                        Log::error('Invalid image file', ['file' => $image]);
                    }
                }
            } else {
                Log::error('productDetailImages is not an array', ['productDetailImages' => $productDetailImages]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product->load('images', 'categories', 'toppings')
        ]);
    }

    /**
     * Remove the specified product from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    /**
     * Restore a soft-deleted product.
     */
    public function restore(string $id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return response()->json(['message' => 'Product restored successfully.']);
    }

    /**
     * Permanently delete a soft-deleted product.
     */
    public function forceDelete(string $id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        // Delete associated images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->forceDelete();

        return response()->json(['message' => 'Product permanently deleted.']);
    }

    public function adminGetProductDetail(Request $request, string $productId): JsonResponse
    {
//        $toppingList = $product->toppings()
//            ->select('id', 'name', 'price') // Select only the columns you need
//            ->get()
//            ->map(function ($topping) {
//                return [
//                    'id' => $topping->id,
//                    'name' => $topping->name,
//                    'price' => $topping->price,
//                    'is_selected' => false
//                ];
//            });

        $product = Product::with(['images', 'categories', 'toppings'])->findOrFail($productId);

        $return_data = null;

        if ($product) {
            $return_data = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'status' => $product->status,
                'is_topping' => $product->is_topping,
                'price' => $product->price,
                'cost' => $product->cost,
                'up_m_price' => $product->up_m_price,
                'up_l_price' => $product->up_l_price,
                'priority' => $product->priority,
                'categories_id' => $product->categories()->pluck('id'),
                'toppings_id' => $product->toppings->map(function ($topping) {
                    return [
                        'topping_id' => $topping->id,
                        'extra_price' => $topping->pivot->extra_price,
                    ];
                }),
                'thumbnailImage' => $product->image ? asset('storage/' . $product->image) : null,
                'productDetailImages' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => asset('storage/' . $image->image_path),
                    ];
                }),
            ];
        }
        return response()->json([
            'success' => true,
            'data' => $return_data
        ], 200);
    }

    public function searchProducts(Request $request)
    {
//        return response()->json([
//            'message' => 'Products searched successfully.',
//            'data' => $request->query('q'),
//        ], 200);

        $query = Product::query();
        $keyword = $request->query('q');

        if ($keyword) {
            $query->where('name', 'LIKE', "%$keyword%")
                ->orWhereHas('categories', function ($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%$keyword%");
                });
        }

        return response()->json(['data' => $query->get()]);
    }


}

