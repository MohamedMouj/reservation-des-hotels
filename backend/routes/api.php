<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminAnalyticsController;
use App\Http\Controllers\Api\AdminReservationController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'getHotelById']);
Route::get('/rooms/availability', [RoomController::class, 'availability']);
Route::get('/hotels/{hotel}/rooms', [RoomController::class, 'index']);
Route::get('/hotels/{hotel}/avis', [AvisController::class, 'index']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/hotels', [HotelController::class, 'store']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
    Route::post('/hotels/{hotel}/rooms', [RoomController::class, 'store']);
    Route::put('/hotels/{hotel}/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/hotels/{hotel}/rooms/{room}', [RoomController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    Route::post('/hotels/{hotel}/avis', [AvisController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::patch('/reservations/{reservation}', [AdminReservationController::class, 'update']);
    Route::post('/reservations/{reservation}/payment/cash-confirmation', [AdminReservationController::class, 'confirmerPaiementEspeces']);
    Route::post('/reservations/{reservation}/payment/cash-refund-confirmation', [AdminReservationController::class, 'confirmerRemboursementEspeces']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/analytics', [AdminAnalyticsController::class, 'index']);
});


// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);