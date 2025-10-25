<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BookCopyController;
use App\Http\Controllers\BorrowTransactionController;
use App\Http\Controllers\BookLostController;
use App\Http\Controllers\PenaltyController;

// Auth routes
// API registration is POST-only. Provide a safe GET redirect so visiting /api/register in a browser
// doesn't throw MethodNotAllowed — redirect to the web registration page.
Route::get('/register', function () {
	return redirect('/register');
});
Route::post('/register', [UserController::class, 'register']);
// Also accept POST /users for registration (RESTful)
Route::post('/users', [UserController::class, 'register']);
Route::get('/members', [UserController::class, 'getMember']);
Route::get('/admins', [UserController::class, 'getAdmin']);
Route::post('/login', [UserController::class, 'login']);
// Logout protected
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');

// All other API routes require authentication
Route::middleware('auth:sanctum')->group(function () {

	//route BookController
	Route::get('/books', [BookController::class, 'index']);
	Route::get('/books/{title}', [BookController::class, 'show']);
// write operations require authentication
Route::middleware('auth:sanctum')->group(function () {
	Route::post('/books', [BookController::class, 'store']);
	Route::put('/books/{id}', [BookController::class, 'updateData']);
	Route::patch('/books/{id}/stock', [BookController::class, 'updateQuantity']);
	Route::delete('/books/{id}', [BookController::class, 'destroy'])->middleware('role:ADMIN');

	// Category: only authenticated users can create
	Route::post('/categories', [CategoryController::class, 'store']);

	// Book copies: status updates by authenticated users (admins ideally)
	Route::patch('/book_copies/{id}', [BookCopyController::class, 'updateStatus'])->middleware('role:ADMIN');

	// Transactions: create and return are authenticated
	Route::post('/transactions', [BorrowTransactionController::class, 'store']);
	Route::patch('/transactions/{id}/return', [BorrowTransactionController::class, 'updateReturn']);

	// Book lost reporting by authenticated users; status update and delete by admin
	Route::post('/book_losts', [BookLostController::class, 'store']);
	Route::put('/book_losts/{id}/status', [BookLostController::class, 'updateStatus'])->middleware('role:ADMIN');
	Route::delete('/book_losts/{id}', [BookLostController::class, 'destroy'])->middleware('role:ADMIN');

	// Penalties: create/update/delete require auth; destructive ops require admin
	Route::post('/penalties', [PenaltyController::class, 'store']);
	Route::put('/penalties/{id}', [PenaltyController::class, 'update']);
	Route::delete('/penalties/{id}', [PenaltyController::class, 'destroy'])->middleware('role:ADMIN');
});

	//route CategoryController
	Route::get('/categories', [CategoryController::class, 'index']);

	//route BookCopyController
	Route::get('/book_copies', [BookCopyController::class, 'index']);

	//route BorrowTransactions
	Route::get('/transactions', [BorrowTransactionController::class, 'index']);
	Route::get('/transactions/{id}', [BorrowTransactionController::class, 'show']);

	//route BookLost
	Route::get('/book_losts', [BookLostController::class, 'index']);
	Route::get('/book_losts/{id}', [BookLostController::class, 'show']);


	//route Penalties
	Route::get('/penalties', [PenaltyController::class, 'index']);
	Route::get('/penalties/{id}', [PenaltyController::class, 'show']);

});
