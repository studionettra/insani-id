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
        if (Schema::hasTable('programs') && ! Schema::hasColumn('programs', 'views_count')) {
            Schema::table('programs', function (Blueprint $table) {
                $table->unsignedBigInteger('views_count')->default(0)->index()->after('status');
            });
        }

        if (Schema::hasTable('blog_post_caches') && ! Schema::hasColumn('blog_post_caches', 'views_count')) {
            Schema::table('blog_post_caches', function (Blueprint $table) {
                $table->unsignedBigInteger('views_count')->default(0)->index()->after('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('programs') && Schema::hasColumn('programs', 'views_count')) {
            Schema::table('programs', function (Blueprint $table) {
                $table->dropColumn('views_count');
            });
        }

        if (Schema::hasTable('blog_post_caches') && Schema::hasColumn('blog_post_caches', 'views_count')) {
            Schema::table('blog_post_caches', function (Blueprint $table) {
                $table->dropColumn('views_count');
            });
        }
    }
};
