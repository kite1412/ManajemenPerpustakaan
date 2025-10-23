<?php

namespace App\Http\Controllers;

use App\Models\BorrowTransaction;
use App\Models\BookCopy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowTransactionController extends Controller
{
    /**
     */
    public function index()
    {
        try {
            $transactions = BorrowTransaction::with(['user', 'bookCopy'])->get();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'All Borrow Transactions Retrieved Successfully',
                'payload' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Retrieve Borrow Transactions',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'book_id' => 'required|integer|exists:book_copies,id',
                'borrow_date' => 'required|date',
                'due_date' => 'required|date|after_or_equal:borrow_date',
                'return_date' => 'nullable|date|after_or_equal:borrow_date'
            ]);

            DB::beginTransaction();

            // Ambil data buku copy
            $bookCopy = BookCopy::find($validated['book_id']);

            // Cek apakah tersedia
            if (! $bookCopy || $bookCopy->book_status !== 'AVAILABLE') {
                return response()->json([
                    'success' => false,
                    'statusCode' => 400,
                    'message' => 'Book is not available for borrowing'
                ]);
            }

            // Buat transaksi
            $transaction = BorrowTransaction::create($validated);

            // Update status book copy menjadi BORROWED
            $bookCopy->update(['book_status' => 'BORROWED']);

            DB::commit();

            return response()->json([
                'success' => true,
                'statusCode' => 201,
                'message' => 'Borrow Transaction Created Successfully',
                'payload' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Create Borrow Transaction',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     */
    public function show($id)
    {
        try {
            $transaction = BorrowTransaction::with(['user', 'bookCopy'])->find($id);

            if (! $transaction) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Borrow Transaction Not Found'
                ]);
            }

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Borrow Transaction Retrieved Successfully',
                'payload' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Retrieve Borrow Transaction',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * PATCH update return date (pengembalian)
     */
    public function updateReturn(Request $request, $id)
    {
        try {
            $transaction = BorrowTransaction::find($id);

            if (! $transaction) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Borrow Transaction Not Found'
                ]);
            }

            $validated = $request->validate([
                'return_date' => 'required|date|after_or_equal:borrow_date'
            ]);

            DB::beginTransaction();

            $transaction->update($validated);

            // Kembalikan status buku menjadi AVAILABLE
            $bookCopy = BookCopy::find($transaction->book_id);
            if ($bookCopy) {
                $bookCopy->update(['book_status' => 'AVAILABLE']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Book Returned Successfully',
                'payload' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Update Return Status',
                'error' => $e->getMessage()
            ]);
        }
    }
}
