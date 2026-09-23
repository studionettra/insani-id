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
        Schema::create('financial_reports', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug')->unique();
            $table->unsignedSmallInteger('report_year');
            $table->string('category')->default('annual_report'); // annual_report, audited_financial, impact_report, interim
            $table->string('audit_status')->nullable(); // WTP (Wajar Tanpa Pengecualian), Proses Audit, Unaudited
            $table->string('auditor_name')->nullable(); // KAP Heliantono & Rekan
            $table->string('cover_image')->nullable();
            $table->string('file_path')->nullable();
            $table->string('external_url', 500)->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->json('summary')->nullable();
            $table->decimal('total_revenue', 15, 2)->nullable();
            $table->decimal('total_disbursement', 15, 2)->nullable();
            $table->unsignedInteger('beneficiaries_count')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['report_year', 'is_active']);
            $table->index(['category', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_reports');
    }
};
