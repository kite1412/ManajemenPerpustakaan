<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User;

class BookLost extends Model
{

    use HasFactory, SoftDeletes;

    protected $table = 'book_losts';

    protected $fillable = [
        'user_id',
        'book_id',
        'lost_date',
        'fine_amount',
        'report_status'
    ];

    /**
     * Get the user who lost the book
     */
    public function user()
    {
        return $this->belongsTo(UserModel::class, 'user_id');
    }

    /**
     * Get the book that was lost
     */
    public function book_copies()
    {
        return $this->belongsTo(BookCopy::class, 'book_id');
    }

    public function transactions()
    {
        return $this->belongsTo(BorrowTransaction::class, 'transaction_id');
    }

    public function verified_by(){
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function penalty_id(){
    return $this->belongsTo(Penalty::class, 'penalty_id');
    }



}
