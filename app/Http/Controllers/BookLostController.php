<?php

namespace App\Http\Controllers;

use App\Models\BookLost;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookLostController extends Controller
{
    public function index()
    {
        try {
            $reports = BookLost::with(['bookCopy', 'user', 'verifiedBy', 'penalty', 'transaction'])->get();

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
            $validated = $request->validate([
                'copy_id' => 'required|integer|exists:book_copies,id',
                'user_id' => 'required|integer|exists:users,id',
                'transaction_id' => 'nullable|integer|exists:borrow_transactions,id',
                'report_date' => 'required|date',
                'verified_by' => 'nullable|integer|exists:users,id',
                'penalty_id' => 'nullable|integer|exists:penalties,id',
                'status' => ['required', Rule::in(['REPORTED', 'PAID', 'VERIFIED'])],
            ]);

            $bookCopy = \App\Models\BookCopy::find($validated['copy_id']);

            if (!$bookCopy) {
            return response()->json([
                'success' => false,
                'statusCode' => 404,
                'message' => 'Book Copy Not Found',
                ]);
            }
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
