<?php

namespace App\Observers;

use App\Mail\ProgramCompletedNotification;
use App\Models\Program;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProgramObserver
{
    /**
     * Handle the Program "created" event.
     */
    public function created(Program $program): void
    {
        //
    }

    public function updating(Program $program): void
    {
        if ($program->status === 'published' && $program->isDirty('collected_amount') && $program->target_amount > 0) {
            if ($program->collected_amount >= $program->target_amount) {
                $program->status = 'completed';

                if ($program->creator) {
                    try {
                        Mail::to($program->creator->email)
                            ->send(new ProgramCompletedNotification($program));
                    } catch (\Exception $e) {
                        Log::error('Failed to send program completed notification in observer: '.$e->getMessage());
                    }
                }
            }
        }
    }

    /**
     * Handle the Program "deleted" event.
     */
    public function deleted(Program $program): void
    {
        //
    }

    /**
     * Handle the Program "restored" event.
     */
    public function restored(Program $program): void
    {
        //
    }

    /**
     * Handle the Program "force deleted" event.
     */
    public function forceDeleted(Program $program): void
    {
        //
    }
}
