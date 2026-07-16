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
        Schema::dropIfExists('blog_post_caches');
        Schema::create('blog_post_caches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wp_post_id')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content_html');
            $table->string('featured_image_url')->nullable();
            $table->string('wp_category', 100)->nullable();
            $table->dateTime('published_at')->index();
            $table->dateTime('synced_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_post_caches');
    }
};
