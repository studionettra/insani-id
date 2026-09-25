<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigner_profiles', function (Blueprint $table) {
            $table->unsignedInteger('max_campaign_slots')->default(1)->after('type');
        });

        // Set default 3 slots for existing lembaga profiles
        DB::table('campaigner_profiles')->where('type', 'lembaga')->update(['max_campaign_slots' => 3]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigner_profiles', function (Blueprint $table) {
            $table->dropColumn('max_campaign_slots');
        });
    }
};
