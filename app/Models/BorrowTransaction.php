<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BorrowTransaction extends Model
{

    use HasFactory, SoftDeletes;
    protected $table = 'borrow_transactions';

    protected $fillable = [
        'user_id',
        'book_id',
        'borrow_date',
        'due_date',
        'return_date'
    ];

    /**
     * Get the user that owns the transaction
     */
    public function users()
    {
        return $this->belongsTo(UserModel::class, 'user_id');
    }

    /**
     * Get the book that was borrowed
     */
    public function books()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function book_losts(){
        return $this->hasOne(BorrowTransaction::class, 'transaction_id');
    }

    public function penalties(){
        return $this->hasOne(Penalty::class, 'transaction_id');
    }
}
