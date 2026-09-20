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
        Schema::create('analytics_sessions', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('ip_address', 45)->nullable();
            $table->string('country', 100)->nullable()->default('Indonesia');
            $table->string('region', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('device_type', 30)->default('desktop')->index();
            $table->string('browser', 60)->nullable()->index();
            $table->string('browser_version', 30)->nullable();
            $table->string('os', 60)->nullable()->index();
            $table->string('referrer_domain', 150)->nullable()->index();
            $table->text('referrer_url')->nullable();
            $table->string('utm_source', 100)->nullable()->index();
            $table->string('utm_medium', 100)->nullable()->index();
            $table->string('utm_campaign', 150)->nullable()->index();
            $table->string('utm_term', 150)->nullable();
            $table->string('utm_content', 150)->nullable();
            $table->string('landing_page', 255)->nullable();
            $table->timestamp('last_activity_at')->nullable()->index();
            $table->timestamps();

            $table->index(['created_at', 'last_activity_at']);
        });

        Schema::create('analytics_page_views', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->index();
            $table->string('url', 255);
            $table->string('path', 255)->index();
            $table->string('title', 255)->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamp('created_at')->nullable()->index();

            $table->foreign('session_id')->references('id')->on('analytics_sessions')->cascadeOnDelete();
            $table->index(['path', 'created_at']);
        });

        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->index();
            $table->string('event_name', 60)->index();
            $table->string('url', 255)->nullable();
            $table->string('meta_status', 30)->default('dispatched');
            $table->string('ga4_status', 30)->default('dispatched');
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->nullable()->index();

            $table->foreign('session_id')->references('id')->on('analytics_sessions')->cascadeOnDelete();
            $table->index(['event_name', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('analytics_page_views');
        Schema::dropIfExists('analytics_sessions');
    }
};
