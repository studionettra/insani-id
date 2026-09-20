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
        Schema::table('blog_post_caches', function (Blueprint $table) {
            $table->unsignedBigInteger('wp_post_id')->nullable()->change();
            $table->dateTime('synced_at')->nullable()->change();
            $table->foreignId('author_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('published')->after('wp_category')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_post_caches', function (Blueprint $table) {
            $table->dropForeign(['author_id']);
            $table->dropColumn(['author_id', 'status']);
            $table->unsignedBigInteger('wp_post_id')->nullable(false)->change();
            $table->dateTime('synced_at')->nullable(false)->change();
        });
    }
};
