<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'author',
        'publisher',
        'year_publish',
        'stock',
        'img',
    ];

    public function book_copies(){
        return $this->hasMany(BookCopy::class, 'book_id');
    }

    public function book_categories(){
        return $this->hasMany(BookCategory::class, 'book_id');
    }
}
