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
        Schema::table('disbursements', function (Blueprint $table) {
            $table->string('receipt_number', 50)->nullable()->unique()->after('id');
            $table->decimal('bank_fee', 15, 2)->default(2500)->after('platform_fee_amount');
            $table->text('distribution_plan')->nullable()->after('notes');
            $table->string('beneficiary_target', 150)->nullable()->after('distribution_plan');
            $table->string('location', 150)->nullable()->after('beneficiary_target');
            $table->date('estimated_distribution_date')->nullable()->after('location');
            $table->string('supporting_document')->nullable()->after('estimated_distribution_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disbursements', function (Blueprint $table) {
            $table->dropColumn([
                'receipt_number',
                'bank_fee',
                'distribution_plan',
                'beneficiary_target',
                'location',
                'estimated_distribution_date',
                'supporting_document',
            ]);
        });
    }
};
