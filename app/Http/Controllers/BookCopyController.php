<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;

class BookCopyController extends Controller
{
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
            'book_id' => 'integer|required',
            'unique_code' => 'string|max:10',
            'book_status' => 'required|in:AVAILABLE, BORROWED, DAMAGED, LOST'
        ]);

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
