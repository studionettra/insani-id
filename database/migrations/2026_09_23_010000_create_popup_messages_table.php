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
        Schema::create('popup_messages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('display_type', ['image_only', 'hybrid'])->default('image_only');
            $table->string('image_path')->nullable();
            $table->text('content')->nullable();
            $table->string('cta_text', 100)->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->boolean('open_in_new_tab')->default(false);
            $table->unsignedInteger('delay_seconds')->default(2);
            $table->unsignedInteger('auto_close_seconds')->default(0);
            $table->enum('frequency', ['once_per_day', 'once_per_session', 'always'])->default('once_per_day');
            $table->enum('target_page', ['all', 'home_only'])->default('home_only');
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('popup_messages');
    }
};
