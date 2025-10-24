<?php

namespace App\Http\Controllers;

use App\Models\BookLost;
use App\Models\BookCopy;
use App\Models\BorrowTransaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookLostController extends Controller
{
    public function index()
    {
        try {
            $reports = BookLost::with(['book_copies', 'user', 'penalty', 'transactions', "verified_by"])->get();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'All Book Lost Reports Retrieved Successfully',
                'payload' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Get Book Lost Reports',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            // transaction_id is required; copy_id and user_id will be derived from the transaction
            $validated = $request->validate([
                'transaction_id' => 'required|integer|exists:borrow_transactions,id',
                'report_date' => 'required|date',
                'verified_by' => 'nullable|integer|exists:users,id',
                'penalty_id' => 'required|integer|exists:penalties,id',
                'report_status' => ['required', Rule::in(['REPORTED', 'PAID', 'VERIFIED'])],
            ]);

            // derive copy_id and user_id from the borrow transaction
            $tx = BorrowTransaction::find($validated['transaction_id']);
            if (!$tx) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 422,
                    'message' => 'Invalid transaction_id; cannot derive copy_id/user_id',
                ]);
            }

            $copyId = $tx->book_id;
            $userId = $tx->user_id;

            if (!$copyId || !$userId) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 422,
                    'message' => 'Transaction does not contain book_id or user_id to derive required fields',
                ]);
            }

            $bookCopy = BookCopy::find($copyId);
            if (!$bookCopy) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Book Copy Not Found',
                ]);
            }

            // populate validated payload with derived fields
            $validated['copy_id'] = $copyId;
            $validated['user_id'] = $userId;

            $report = BookLost::create($validated);

            $bookCopy->update([
            'book_status' => 'LOST'
            ]);

            return response()->json([
                'success' => true,
                'statusCode' => 201,
                'message' => 'Book Lost Report Created Successfully',
                'payload' => $report
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Create Book Lost Report',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function show($id)
    {
        try {
            $report = BookLost::with(['bookCopy', 'user', 'verifiedBy', 'penalty', 'transaction'])->find($id);

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Book Lost Report Not Found'
                ]);
            }

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Book Lost Report Retrieved Successfully',
                'payload' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Retrieve Book Lost Report',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $report = BookLost::find($id);

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Book Lost Report Not Found'
                ]);
            }

            $validated = $request->validate([
                'status' => ['required', Rule::in(['PENDING', 'VERIFIED', 'REJECTED'])],
                'verified_by' => 'nullable|integer|exists:users,id'
            ]);

            $report->update($validated);

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Book Lost Status Updated Successfully',
                'payload' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Update Book Lost Status',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function destroy($id)
    {
        try {
            $report = BookLost::find($id);

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Book Lost Report Not Found'
                ]);
            }

            $report->delete();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Book Lost Report Deleted Successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Delete Book Lost Report',
                'error' => $e->getMessage()
            ]);
        }
    }
}
