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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_channel', 50)->nullable()->after('payment_method');
            $table->string('payment_destination', 100)->nullable()->after('payment_channel');
            $table->text('checkout_url')->nullable()->after('payment_destination');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_channel', 'payment_destination', 'checkout_url']);
        });
    }
};
