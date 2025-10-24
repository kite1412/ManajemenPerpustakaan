<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

// class UserModel extends Authenticatable
// {
//     use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

//     protected $table = 'users';

//     protected $fillable = [
//         'username',
//         'password',
//         'email',
//         'name',
//         'phone_number',
//         'citizen_id',
//         'role'
//     ];

//     /**
//      * The attributes that should be hidden for serialization.
//      *
//      * @var array<int, string>
//      */
//     protected $hidden = [
//         'password',
//     ];

//     /**
//      * The attributes that should be cast.
//      *
//      * @var array<string,string>
//      */
//     protected $casts = [
//         'email_verified_at' => 'datetime',
//     ];

//     /**
//      * Check if user is admin
//      *
//      * @return bool
//      */
//     public function isAdmin(): bool
//     {
//         return $this->role === 'ADMIN';
//     }

//     /**
//      * Check if user is member
//      *
//      * @return bool
//      */
//     public function isMember(): bool
//     {
//         return $this->role === 'MEMBER';
//     }

//     /**
//      * Get user's borrowing transactions
//      */
//     public function borrowTransactions()
//     {
//          return $this->hasMany(BorrowTransaction::class, 'user_id');
//     }

//     // /**
//     //  * Get user's reported lost books
//     //  */
//     public function bookLosts()
//     {
//         return $this->hasMany(BookLost::class, 'user_id');
//     }

//     // /**
//     //  * Get books verified by this user (admin only)
//     //  */
//     public function verifiedBooks()
//     {
//         return $this->hasMany(BookLost::class, 'verified_by');
//     }
// }
