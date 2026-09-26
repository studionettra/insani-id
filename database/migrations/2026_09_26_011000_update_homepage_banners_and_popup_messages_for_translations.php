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
        Schema::table('homepage_banners', function (Blueprint $table) {
            $table->text('title')->nullable()->change();
        });

        // Convert existing plain string records in homepage_banners
        $banners = DB::table('homepage_banners')->get();
        foreach ($banners as $banner) {
            $updates = [];
            if ($banner->title && ! str_starts_with(trim($banner->title), '{')) {
                $updates['title'] = json_encode(['id' => $banner->title], JSON_UNESCAPED_UNICODE);
            }
            if ($banner->description && ! str_starts_with(trim($banner->description), '{')) {
                $updates['description'] = json_encode(['id' => $banner->description], JSON_UNESCAPED_UNICODE);
            }
            if (! empty($updates)) {
                DB::table('homepage_banners')->where('id', $banner->id)->update($updates);
            }
        }

        Schema::table('popup_messages', function (Blueprint $table) {
            $table->text('title')->change();
            $table->text('cta_text')->nullable()->change();
        });

        // Convert existing plain string records in popup_messages
        $popups = DB::table('popup_messages')->get();
        foreach ($popups as $popup) {
            $updates = [];
            if ($popup->title && ! str_starts_with(trim($popup->title), '{')) {
                $updates['title'] = json_encode(['id' => $popup->title], JSON_UNESCAPED_UNICODE);
            }
            if ($popup->content && ! str_starts_with(trim($popup->content), '{')) {
                $updates['content'] = json_encode(['id' => $popup->content], JSON_UNESCAPED_UNICODE);
            }
            if ($popup->cta_text && ! str_starts_with(trim($popup->cta_text), '{')) {
                $updates['cta_text'] = json_encode(['id' => $popup->cta_text], JSON_UNESCAPED_UNICODE);
            }
            if (! empty($updates)) {
                DB::table('popup_messages')->where('id', $popup->id)->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homepage_banners', function (Blueprint $table) {
            $table->string('title')->nullable()->change();
        });

        Schema::table('popup_messages', function (Blueprint $table) {
            $table->string('title', 255)->change();
            $table->string('cta_text', 100)->nullable()->change();
        });
    }
};
