<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('comments')) {
            DB::table('comments')
                ->where('name', 'Hamba Allah')
                ->update(['name' => 'Inisiator Kebaikan']);
        }

        if (Schema::hasTable('notifications')) {
            DB::table('notifications')
                ->where('data', 'like', '%Hamba Allah%')
                ->update(['data' => DB::raw("REPLACE(data, 'Hamba Allah', 'Inisiator Kebaikan')")]);
        }

        if (Schema::hasTable('faqs')) {
            DB::table('faqs')
                ->where('answer_html', 'like', '%Hamba Allah%')
                ->update(['answer_html' => DB::raw("REPLACE(answer_html, 'Hamba Allah', 'Inisiator Kebaikan')")]);

            DB::table('faqs')
                ->where('keywords', 'like', '%hamba allah%')
                ->update(['keywords' => DB::raw("REPLACE(keywords, 'hamba allah', 'inisiator kebaikan')")]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('comments')) {
            DB::table('comments')
                ->where('name', 'Inisiator Kebaikan')
                ->update(['name' => 'Hamba Allah']);
        }

        if (Schema::hasTable('notifications')) {
            DB::table('notifications')
                ->where('data', 'like', '%Inisiator Kebaikan%')
                ->update(['data' => DB::raw("REPLACE(data, 'Inisiator Kebaikan', 'Hamba Allah')")]);
        }

        if (Schema::hasTable('faqs')) {
            DB::table('faqs')
                ->where('answer_html', 'like', '%Inisiator Kebaikan%')
                ->update(['answer_html' => DB::raw("REPLACE(answer_html, 'Inisiator Kebaikan', 'Hamba Allah')")]);

            DB::table('faqs')
                ->where('keywords', 'like', '%inisiator kebaikan%')
                ->update(['keywords' => DB::raw("REPLACE(keywords, 'inisiator kebaikan', 'hamba allah')")]);
        }
    }
};
