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
        Schema::table('donations', function (Blueprint $table) {
            $table->foreignId('fundraiser_id')->nullable()->after('donor_user_id')->constrained('fundraisers')->nullOnDelete();
            $table->foreignId('fundraiser_user_id')->nullable()->after('fundraiser_id')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['fundraiser_id']);
            $table->dropForeign(['fundraiser_user_id']);
            $table->dropColumn(['fundraiser_id', 'fundraiser_user_id']);
        });
    }
};
