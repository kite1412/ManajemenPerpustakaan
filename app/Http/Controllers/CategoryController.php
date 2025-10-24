<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{

    public function index(){
       try{
         $categories = Category::all();

        if($categories->isEmpty()){
           return response()->json([
            'success' => false,
            'statusCode' => '404',
            'message' => 'Category Not Found',
        ],404);
        }

        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Data GET Successfully',
            'payload' => $categories
        ],200);
       }catch(\Exception $e){
        return response()->json([
            'success' => false,
            'statusCode' => '500',
            'message' => 'Failed GET Data',
            'error' => $e->getMessage()
        ], 500);
       }
    }

    public function store(Request $request){
       try{
         $validated = $request->validate([
            'name' => 'string|max:100|required'
        ]);
        $category = Category::create($validated);
        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Category Created Successfully',
            'payload' => $category
        ]);
       } catch(\Exception $e){
        return response()->json([
            'success' => false,
            'statusCode' => '500',
            'message' => 'Failed Create Category',
            'error' => $e->getMessage()
        ], 500);
       }
    }

    public function update(Request $request, $id){
       try{

        $category = Category::find($id);
        if($category->isEmpty()){
                return response()->json([
                    'success' => false,
                    'statusCode' => '404',
                    'message' => 'Category Not Found'
                ]);
            }
         $validated = $request->validate([
            'name' => 'string|max:100|required'
        ]);
        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'statusCode' => '200',
            'message' => 'Category Updated Successfully',
            'payload' => $category
        ]);
       } catch(\Exception $e){
        return response()->json([
            'success' => false,
            'statusCode' => '500',
            'message' => 'Failed Update Category',
            'error' => $e->getMessage()
        ], 500);
       }
    }
}
