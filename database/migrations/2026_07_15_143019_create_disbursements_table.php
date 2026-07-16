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
        Schema::create('disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->decimal('requested_amount', 15, 2);
            $table->string('bank_name', 50);
            $table->string('bank_account_number', 50);
            $table->string('bank_account_name', 100);
            $table->decimal('platform_fee_percent', 5, 2)->default(0);
            $table->decimal('platform_fee_amount', 15, 2)->default(0);
            $table->decimal('nett_amount', 15, 2);
            $table->enum('status', ['pending', 'approved', 'rejected', 'transferred'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('transfer_proof')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('transferred_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disbursements');
    }
};
