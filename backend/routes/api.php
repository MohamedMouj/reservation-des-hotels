<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'getHotelById']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/hotels', [HotelController::class, 'store']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
});


// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);