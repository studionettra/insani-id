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
        Schema::create('fundraisers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->string('referral_code', 64)->unique();
            $table->decimal('target_amount', 15, 2)->nullable();
            $table->text('personal_message')->nullable();
            $table->decimal('collected_amount', 15, 2)->default(0);
            $table->unsignedInteger('donors_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'program_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fundraisers');
    }
};
