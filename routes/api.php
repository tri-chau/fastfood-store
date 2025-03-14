<?php

use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GHNController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\PayOSWebhookController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRolePermissionController;
use App\Http\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//Route::middleware(['firebase.auth'])->get('/user', function (Request $request) {
//    return $request->user();
//});

Route::middleware(['firebase.auth'])->get('/test-firebase', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'firebaseUser' => $request->attributes->get('firebaseUser'),
        'message' => 'Firebase auth route works!',
    ]);
});


Route::middleware(['firebase.auth'])->group(function () {
    //Auth
    Route::get('/auth/me', [AuthenticationController::class, 'me']);
    Route::post('/auth/logout', [AuthenticationController::class, 'logout']);

    //Role & Permission routes
    Route::get('/roles/options', [RoleController::class, 'getRoleOptions']);
    Route::get('/roles/{role}', [RoleController::class, 'getDetail']);
    Route::put('/roles/{role}', [RoleController::class, 'update']);
    Route::post('/roles/{role}/assign-permission', [RoleController::class, 'assignPermission']);
    Route::post('/roles/{role}/revoke-permission', [RoleController::class, 'revokePermission']);


    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{user}/assign-role', [UserController::class, 'assignRole']);
    Route::post('/users/{user}/remove-role', [UserController::class, 'removeRole']);
    Route::get('/users/{user}/roles', [UserController::class, 'getRoles']);

    //Products routes
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    //Employees routes
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);

    //Team routes
    Route::delete('/teams/{center}', [TeamController::class, 'destroy']);
    Route::get('/teams', [TeamController::class, 'index']);
    Route::get('/teams/options', [TeamController::class, 'getTeamOptions']);
    Route::get('/products/toppings', [\App\Http\Controllers\ProductController::class, 'getToppingOptions']);
    Route::get('/products/options', [\App\Http\Controllers\ProductController::class, 'getProductOptions']);
    Route::get('/customer/options', [\App\Http\Controllers\CustomerController::class, 'getCustomerOptions']);


    Route::post('/cart/addProductToCart', [\App\Http\Controllers\OrderController::class, 'addProductToCart']);
    Route::post('/cart/removeProductFromCart', [\App\Http\Controllers\OrderController::class, 'removeProductFromCart']);
    Route::post('/cart/removeToppingFromCart', [\App\Http\Controllers\OrderController::class, 'removeToppingFromCart']);
    Route::put('/cart/updateProductInCart', [\App\Http\Controllers\OrderController::class, 'updateProductInCart']);
    Route::get('/cart/fetchCart', [\App\Http\Controllers\OrderController::class, 'fetchCart']);
    Route::get('/cart/getExistedCart', [\App\Http\Controllers\OrderController::class, 'getExistedCart']);
    Route::get('/cart/loadCart/{id}', [\App\Http\Controllers\OrderController::class, 'loadCartDetail']);
    Route::delete('/cart/deleteCart/{id}', [\App\Http\Controllers\OrderController::class, 'deleteCart']);
    Route::post('/cart/createCart', [\App\Http\Controllers\OrderController::class, 'createCart']);
    Route::post('/customers/save-address/{id}', [\App\Http\Controllers\CustomerController::class, 'saveAddress']);
    Route::get('/ghn/provinces', [GHNController::class, 'getProvinces']);
    Route::get('/ghn/districts', [GHNController::class, 'getDistricts']);
    Route::get('/ghn/wards', [GHNController::class, 'getWards']);
    Route::get('/ghn/shipping-fee', [GHNController::class, 'getShippingFee']);
    Route::get('/vouchers/loadCustomerVoucher', [VoucherController::class, 'loadVouchersByDateAndTeam']);
    Route::get('/vouchers/loadEmployeeVoucher', [VoucherController::class, 'loadVouchersByDateAndUser']);
    Route::post('/orders/proceed', [\App\Http\Controllers\OrderController::class, 'proceedOrder']);
    Route::post('/orders/status/{id}', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
//    orders
    Route::get('/loadCustomerOrders', [\App\Http\Controllers\OrderController::class, 'loadCustomerOrders']);
    Route::get('/loadCustomerOrdersHistory', [\App\Http\Controllers\OrderController::class, 'loadCustomerOrdersHistory']);
    Route::get('/loadOrderDetail/{id}', [\App\Http\Controllers\OrderController::class, 'loadOrderDetail']);
    Route::post('/customer/cancelOrder', [\App\Http\Controllers\OrderController::class, 'cancelOrder']);
    Route::post('/customer/giveFeedback', [\App\Http\Controllers\OrderController::class, 'giveFeedback']);
    Route::post('/customer/markReceived', [\App\Http\Controllers\OrderController::class, 'markReceived']);

    //PayOs api
    Route::post('/payos/create-payment-link', [\App\Http\Controllers\PayOSController::class, 'createPayment']);

    //Module api
    Route::get('/{module}', [\App\Http\Controllers\ModuleController::class, 'index']);
    Route::get('/{module}/{id}', [\App\Http\Controllers\ModuleController::class, 'show']);
    Route::post('/{module}', [\App\Http\Controllers\ModuleController::class, 'save']);
    Route::put('/{module}/{id}', [\App\Http\Controllers\ModuleController::class, 'save']);
    Route::delete('/{module}', [\App\Http\Controllers\ModuleController::class, 'delete']);

    //Image api
    Route::get('/images/{imageName}', [ImageController::class, 'getImage']);
    Route::post('/upload-image', [ImageController::class, 'upload']);

    //Report
    Route::get('/reports/summary', [\App\Http\Controllers\ReportController::class, 'getSummaryReport']);
    Route::get('/reports/getOrdersByMonth', [\App\Http\Controllers\ReportController::class, 'getOrdersByMonth']);

    // update
    Route::prefix('/admin')->group(function () {
        // Category CRUD
        Route::get('/categories/all', [\App\Http\Controllers\CategoryController::class, 'adminGetCategories']);
        Route::post('/categories/add', [\App\Http\Controllers\CategoryController::class, 'store']);

        // Product CRUD
        Route::get('/products/all', [\App\Http\Controllers\ProductController::class, 'index']);
        Route::post('/products/add', [\App\Http\Controllers\ProductController::class, 'store']);
        Route::get('/products/{id}', [\App\Http\Controllers\ProductController::class, 'adminGetProductDetail']);
        Route::post('/products/update/{id}', [\App\Http\Controllers\ProductController::class, 'update']);
        Route::delete('/products/delete/{id}', [\App\Http\Controllers\ProductController::class, 'destroy']);

        // Order CRUD
        Route::get('/orders/all', [\App\Http\Controllers\OrderController::class, 'index']);
        Route::post('/orders/create', [\App\Http\Controllers\OrderController::class, 'adminCreateOrder']);
        Route::post('/orders/update/{id}', [\App\Http\Controllers\OrderController::class, 'update']);
        Route::delete('/orders/delete/{id}', [\App\Http\Controllers\OrderController::class, 'destroy']);
    });
});

Route::get('/customer/product/{id}', [ProductController::class, 'getProductDetail']);
Route::get('/customer/products/all', [ProductController::class, 'getProducts']);
Route::get('/customer/products/search', [ProductController::class, 'searchProducts']);
Route::get('/customer/products/{category}', [ProductController::class, 'getProducts']);
Route::get('/categories/options/all', [\App\Http\Controllers\CategoryController::class, 'getCategoryJson']);

Route::post('/auth/login', [AuthenticationController::class, 'login']);
Route::post('/auth/refresh', [AuthenticationController::class, 'refresh']);
Route::post('/auth/auth-otp', [AuthenticationController::class, 'loginWithOtp']);
Route::post('/auth/register', [AuthenticationController::class, 'register']);
Route::post('/auth/gen-otp', [AuthenticationController::class, 'generate']);
Route::post('/webhook/payos', [PayOSWebhookController::class, 'handlePayOSWebhook']);
Route::post('/auth/check-firebase-user', [AuthenticationController::class, 'checkFirebaseUser']);
Route::post('/auth/setCustomTokenForAdmin', [AuthenticationController::class, 'setCustomTokenForAdmin']);
Route::post('/auth/addAdmin', [AuthenticationController::class, 'addAdmin']);
Route::post('/auth/getCustomToken', [AuthenticationController::class, 'getCustomTokenForAdmin']);



