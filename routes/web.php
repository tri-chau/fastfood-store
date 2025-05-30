<?php

use App\Http\Controllers\BroadcastController;
use Illuminate\Support\Facades\Route;

//// Route cho xác thực Pusher
//Route::middleware(['firebase.auth'])->group(function () {
//    Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);
//});
Route::get('/{any}', function() {
    return view('welcome');
})->where('any', '^(?!broadcasting/auth).*$');
