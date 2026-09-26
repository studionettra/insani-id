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
        Schema::table('program_updates', function (Blueprint $table) {
            $table->text('title')->change();
        });

        // Convert existing plain string records to json format
        $updates = DB::table('program_updates')->get();
        foreach ($updates as $item) {
            $rowUpdates = [];
            if ($item->title && ! str_starts_with(trim($item->title), '{')) {
                $rowUpdates['title'] = json_encode(['id' => $item->title], JSON_UNESCAPED_UNICODE);
            }
            if ($item->content && ! str_starts_with(trim($item->content), '{')) {
                $rowUpdates['content'] = json_encode(['id' => $item->content], JSON_UNESCAPED_UNICODE);
            }
            if (! empty($rowUpdates)) {
                DB::table('program_updates')->where('id', $item->id)->update($rowUpdates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('program_updates', function (Blueprint $table) {
            $table->string('title', 255)->change();
        });
    }
};
