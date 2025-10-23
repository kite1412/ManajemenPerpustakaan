<?php

namespace App\Http\Controllers;

use App\Models\Penalty;
use App\Models\BorrowTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenaltyController extends Controller
{
    /**
     * GET all penalties
     */
    public function index()
    {
        try {
            $penalties = Penalty::with(['transaction.bookCopy', 'transaction.user'])->get();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'All Penalties Retrieved Successfully',
                'payload' => $penalties
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Get Penalties',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * POST create new penalty
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'transaction_id' => 'required|integer|exists:borrow_transactions,id',
                'amount' => 'required|numeric|min:0',
            ]);

            $penalty = Penalty::create([
                'transaction_id' => $validated['transaction_id'],
                'amount' => $validated['amount'],
                'paid_status' => 0, // default belum dibayar
            ]);

            return response()->json([
                'success' => true,
                'statusCode' => 201,
                'message' => 'Penalty Created Successfully',
                'payload' => $penalty
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Create Penalty',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * PATCH update paid status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $penalty = Penalty::find($id);

            if (! $penalty) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Penalty Not Found'
                ]);
            }

            $validated = $request->validate([
                'paid_status' => 'required|boolean',
            ]);

            DB::beginTransaction();

            // Update status pembayaran
            $penalty->update($validated);

            // Jika sudah dibayar, ubah status buku kembali jadi AVAILABLE
            if ($validated['paid_status'] == 1) {
                $transaction = BorrowTransaction::with('bookCopy')->find($penalty->transaction_id);

                if ($transaction && $transaction->bookCopy) {
                    $transaction->bookCopy->update([
                        'book_status' => 'AVAILABLE'
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Penalty Status Updated Successfully',
                'payload' => $penalty
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Update Penalty Status',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET single penalty
     */
    public function show($id)
    {
        try {
            $penalty = Penalty::with(['transaction.bookCopy', 'transaction.user'])->find($id);

            if (! $penalty) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Penalty Not Found'
                ]);
            }

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Penalty Retrieved Successfully',
                'payload' => $penalty
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Retrieve Penalty',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE penalty
     */
    public function destroy($id)
    {
        try {
            $penalty = Penalty::find($id);

            if (! $penalty) {
                return response()->json([
                    'success' => false,
                    'statusCode' => 404,
                    'message' => 'Penalty Not Found'
                ]);
            }

            $penalty->delete();

            return response()->json([
                'success' => true,
                'statusCode' => 200,
                'message' => 'Penalty Deleted Successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'statusCode' => 500,
                'message' => 'Failed to Delete Penalty',
                'error' => $e->getMessage()
            ]);
        }
    }
}
