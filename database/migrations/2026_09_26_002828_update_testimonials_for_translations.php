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
        Schema::table('testimonials', function (Blueprint $table) {
            $table->text('role')->nullable()->change();
            $table->text('content')->change();
        });

        // Convert existing plain string records to json format
        $testimonials = DB::table('testimonials')->get();
        foreach ($testimonials as $item) {
            $updates = [];
            if ($item->role && ! str_starts_with(trim($item->role), '{')) {
                $updates['role'] = json_encode(['id' => $item->role], JSON_UNESCAPED_UNICODE);
            }
            if ($item->content && ! str_starts_with(trim($item->content), '{')) {
                $updates['content'] = json_encode(['id' => $item->content], JSON_UNESCAPED_UNICODE);
            }
            if (! empty($updates)) {
                DB::table('testimonials')->where('id', $item->id)->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->string('role', 255)->nullable()->change();
        });
    }
};
