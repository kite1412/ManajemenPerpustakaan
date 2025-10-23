<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_losts', function(Blueprint $table){
            $table->id();
            $table->foreignId('copy_id')->constrained('book_copies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transaction_id')->constrained('borrow_transactions')->onDelete('cascade');
            $table->date('report_date');
            $table->foreignId('verified_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('penalty_id')->constrained('penalties')->onDelete('cascade');
            $table->enum('report_status', ['REPORTED', 'PAID', 'VERIFIED']);
            $table->timestamps();
            $table->softDeletes();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_losts');
    }
};
