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
        Schema::table('program_updates', function (Blueprint $table) {
            $table->foreignId('disbursement_id')->nullable()->after('program_id')->constrained('disbursements')->nullOnDelete();
            $table->enum('moderation_status', ['pending', 'approved', 'rejected'])->default('approved')->after('is_published');
            $table->text('rejection_reason')->nullable()->after('moderation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('program_updates', function (Blueprint $table) {
            $table->dropForeign(['disbursement_id']);
            $table->dropColumn(['disbursement_id', 'moderation_status', 'rejection_reason']);
        });
    }
};
