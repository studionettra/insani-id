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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('donation_code', 30)->unique();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->foreignId('donor_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('donor_name');
            $table->string('donor_email');
            $table->string('donor_phone', 30);
            $table->boolean('is_anonymous')->default(false);
            $table->text('message')->nullable();
            $table->decimal('amount', 15, 2);
            $table->unsignedSmallInteger('unique_code')->nullable();
            $table->enum('channel', ['online', 'offline'])->default('online');
            $table->enum('status', ['pending', 'paid', 'expired', 'failed', 'refunded'])->default('pending');
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->index(['program_id', 'status'], 'idx_donations_program_status');
            $table->index(['program_id', 'unique_code', 'created_at'], 'idx_donations_unique_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
