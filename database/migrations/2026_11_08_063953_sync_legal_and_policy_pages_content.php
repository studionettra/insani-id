<?php

use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        (new PageSeeder)->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
