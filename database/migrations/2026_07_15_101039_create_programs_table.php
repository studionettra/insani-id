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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('program_code', 30)->unique();
            $table->json('title');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->enum('campaigner_type', ['individu', 'lembaga', 'internal']);
            $table->foreignId('campaigner_profile_id')->nullable()->constrained('campaigner_profiles')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('target_amount', 15, 2)->nullable();
            $table->decimal('collected_amount', 15, 2)->default(0.00);
            $table->date('deadline')->nullable();
            $table->json('story');
            $table->string('cover_image');
            $table->string('video_url')->nullable();
            $table->enum('status', ['draft', 'pending_verification', 'published', 'rejected', 'completed', 'closed_manual'])->default('draft');
            $table->text('rejection_notes')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('category_id');
            $table->index(['status', 'category_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
