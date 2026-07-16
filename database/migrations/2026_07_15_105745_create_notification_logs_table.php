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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('notifiable_type', 100);
            $table->unsignedBigInteger('notifiable_id');
            $table->enum('channel', ['whatsapp', 'email']);
            $table->string('recipient', 100);
            $table->text('message');
            $table->enum('status', ['queued', 'sent', 'failed']);
            $table->string('provider', 30);
            $table->text('provider_response')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id'], 'idx_notifiable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
