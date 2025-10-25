<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'book_id',
        'category_id'
    ];

    public function books(){
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function categories(){
        return $this->belongsTo(Category::class, 'category_id');
    }
}
