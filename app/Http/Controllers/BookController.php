<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use App\Models\BookCopy;
use Illuminate\Support\Str;

class BookController extends Controller
{


    public function index(){
        try{
            $books = Book::with('book_copies', 'book_categories.categories')->get();

            return response()->json([
                'success' => true,
                'statusCode' => '200',
                'message' => 'Data GET Successfully',
                'payload' => $books
            ]);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'statusCode' => '404',
                'message' => 'Failed GET Data',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function show($title){
       try{
         $books = Book::with(['book_categories.category', 'book_copies'])
         ->where('title', 'ILIKE', $title)
         ->first();

        if(!$books){
            return response()->json([
                'success' => false,
                'statusCode' => '404',
                'message' => 'Book Not Found'
            ]);

            return response()->json([
                'success' => true,
                'statusCode' => '200',
                'message' => 'Data GET Successfully',
                'payload' => $books
            ]);
        }
       }catch(\Exception $e){
        return response()->json([
            'success' => false,
            'statusCode' => '500',
            'message' => 'Failed GET Book',
            'error' => $e->getMessage()
        ]);
       }
    }

    public function store(Request $request){
       try{
         $validated = $request->validate([
        'title' => 'required|string|max:100',
        'author' => 'required|string|max:100',
        'publisher' => 'required|string|max:100',
        'year_publish' => 'required|digits:4|integer',
        'stock' => 'required|integer|min:1',
        'img' => 'nullable|string|max:255',
        'category_id' => 'array',
        ]);

        $books = Book::create($validated);

        for($i = 0; $i < $books->stock; $i++){
            BookCopy::create([
                'book_id' => $books->id,
                'unique_code' => strtoupper(Str::random(10)),
            ]);
        }

        if (!empty($validated['category_id'])) {
            foreach ($validated['category_id'] as $categoryId) {
                \App\Models\BookCategory::create([
                    'book_id' => $books->id,
                    'category_id' => $categoryId,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Book and copies created successfully',
            'payload' => [
                'book' => $books,
                'copies_count' => $books->stock
            ]
        ], 201);
       } catch(\Exception $e){
        return response()->json([
            'success' => false,
            'statusCode' => '500',
            'message' => 'Failed Create Book',
            'error' => $e->getMessage()
        ], 500);
       }
    }

        public function updateData(Request $request, $id){
        try{
            $book = Book::find($id);
                if(!$book){
                    return response()->json([
                        'success' => false,
                        'statusCode' => '404',
                        'message' => 'Book Not Found'
                    ]);
                }

            // Allow partial updates: each field is optional for PATCH semantics
            $validated = $request->validate([
            'title' => 'sometimes|string|max:100',
            'author' => 'sometimes|string|max:100',
            'publisher' => 'sometimes|string|max:100',
            'year_publish' => 'sometimes|digits:4|integer',
            'img' => 'sometimes|nullable|string',
            ]);

        $book->update($validated);

        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Book Updated Successfully',
            'data' => $book
        ]);
        } catch(\Exception $e){
            return response()->json([
                'success' => true,
                'statusCode' => '500',
                'Message' => 'Failed Update Book',
                'Error' => $e->getMessage()
            ]);
        }
    }

    public function updateQuantity(Request $request, $id){
            try{
                $books = Book::find($id);
            if(!$books){
                return response()->json([
                    'success' => false,
                    'statusCode' => '404',
                    'message' => 'Book Not Found'
                ]);
            }

            $validated = $request->validate([
                'stock' => 'required|integer|min:1'
            ]);

            for($i = 0; $i < $books->stock; $i++){
            BookCopy::create([
                'book_id' => $books->id,
                'unique_code' => strtoupper(Str::random(10)),
            ]);

            $books->update($validated);

            return response()->json([
                'success' => true,
                'statusCode' => '200',
                'message' => 'Data Update Successfully',
                ]);

            }
            }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'statusCode' => '500',
                'message' => 'Failed Update Data',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function destroy($id){
    $book = Book::find($id);
    if(!$book){
        return response()->json([
            'success' => false,
            'statusCode' => '404',
            'message' => 'Book Not Found'
        ]);
    }
    $book->delete();

    return response()->json([
        'success' => true,
        'statusCode' => '200',
        'message' => 'Book Deleted Successfully'
    ]);
    }

}
