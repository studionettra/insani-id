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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained('donations')->onDelete('cascade');
            $table->enum('payment_method', ['virtual_account', 'ewallet', 'qris', 'credit_card', 'bank_transfer_manual']);
            $table->string('gateway', 30);
            $table->string('gateway_reference_id', 100)->nullable();
            $table->string('gateway_status', 50)->nullable();
            $table->decimal('paid_amount', 15, 2)->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('gateway_reference_id', 'idx_payments_gateway_ref');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
