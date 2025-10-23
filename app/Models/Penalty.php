<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penalty extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'amount',
        'paid_status'
    ];

    public function borrow_transactions(){
        return $this->belongsTo(BorrowTransaction::class, 'transaction_id');
    }

    public function book_losts(){
        return $this->hasMany(BookLost::class, 'penalty_id');
    }
}
