<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookCopy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'book_id',
        'unique_code',
        'status',
    ];

    public function borrow_transactions(){
        return $this->hasMany(BorrowTransaction::class, 'transaction_id');
    }

    public function book_losts(){
        return $this->hasOne(BookLost::class, 'copy_id');
    }

    public function books(){
        return $this->belongsTo(Book::class, 'book_id');
    }
}
