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
        Schema::table('categories', function (Blueprint $table) {
            $table->json('reality_title')->nullable()->after('pillar_image');
            $table->json('reality_description')->nullable()->after('reality_title');
            $table->string('reality_source')->nullable()->after('reality_description');
            $table->json('stats_metrics')->nullable()->after('reality_source');
            $table->string('video_url')->nullable()->after('stats_metrics');
            $table->json('distribution_gallery')->nullable()->after('video_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'reality_title',
                'reality_description',
                'reality_source',
                'stats_metrics',
                'video_url',
                'distribution_gallery',
            ]);
        });
    }
};
