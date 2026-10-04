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
        Schema::table('donations', function (Blueprint $table) {
            $table->index('status', 'idx_donations_status');
            $table->index('paid_at', 'idx_donations_paid_at');
            $table->index('donor_email', 'idx_donations_donor_email');
            $table->index('donor_user_id', 'idx_donations_donor_user_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('gateway_status', 'idx_payments_gateway_status');
        });

        Schema::table('disbursements', function (Blueprint $table) {
            $table->index('status', 'idx_disbursements_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex('idx_donations_status');
            $table->dropIndex('idx_donations_paid_at');
            $table->dropIndex('idx_donations_donor_email');
            $table->dropIndex('idx_donations_donor_user_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_gateway_status');
        });

        Schema::table('disbursements', function (Blueprint $table) {
            $table->dropIndex('idx_disbursements_status');
        });
    }
};
