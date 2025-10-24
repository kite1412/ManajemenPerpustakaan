<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;

class BookCopyController extends Controller
{
    /**
     * List all book copies, optionally filtered by status via ?status=AVAILABLE
     */
    public function index(Request $request)
    {
        $status = strtoupper($request->query('status'));

        $query = BookCopy::with('books');

        if ($status) {
            // simple validation of allowed statuses to avoid invalid queries
            $allowed = ['AVAILABLE', 'BORROWED', 'DAMAGED', 'LOST'];
            if (in_array($status, $allowed, true)) {
                $query->where('book_status', $status);
            }
        }

        $bookCopies = $query->get();

        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'payload' => $bookCopies,
        ]);
    }

    public function updateStatus(Request $request, $id){
    try{
        $book_copy = BookCopy::find($id);

        if(!$book_copy){
            return response()->json([
                'success' => false,
                'statusCode' => '404',
                'message' => 'Book Not Found',
            ]);
        }

        $validated = $request->validate([
            'unique_code' => 'string|max:10',
            'book_status' => 'required|in:AVAILABLE, BORROWED, DAMAGED, LOST'
        ]);
        $validated['id'] = $book_copy->id; 

        $book_copy->update($validated);

    }catch(\Exception $e){
        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Data Updated Successfully',
            'payload' => $book_copy
            ]);
        }
    }

}
