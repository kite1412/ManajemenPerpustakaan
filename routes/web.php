<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// System UI pages (render Inertia pages) - require auth
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/books', function () { return Inertia::render('Books/Index'); })->name('books');
    Route::get('/categories', function () { return Inertia::render('Categories/Index'); })->name('categories');
    Route::get('/transactions', function () { return Inertia::render('Transactions/Index'); })->name('transactions');
    Route::get('/book-losts', function () { return Inertia::render('BookLosts/Index'); })->name('book-losts');
    Route::get('/penalties', function () { return Inertia::render('Penalties/Index'); })->name('penalties');
    Route::get('/users', function () { return Inertia::render('Users/Index'); })->name('users');
});

require __DIR__.'/auth.php';
