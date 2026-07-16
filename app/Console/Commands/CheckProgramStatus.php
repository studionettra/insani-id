<?php

namespace App\Console\Commands;

use App\Mail\ProgramCompletedNotification;
use App\Models\Program;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CheckProgramStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'programs:check-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for published programs that have reached their target or deadline and mark them as completed.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting program status check...');

        $now = now();

        // Find programs that are published and either:
        // 1. Reached their target_amount (handled here assuming collected_amount >= target_amount)
        // 2. Passed their deadline
        $programs = Program::where('status', 'published')
            ->where(function ($query) use ($now) {
                $query->whereNotNull('deadline')->where('deadline', '<', $now)
                    ->orWhereRaw('collected_amount >= target_amount AND target_amount IS NOT NULL AND target_amount > 0');
            })
            ->get();

        $count = 0;

        foreach ($programs as $program) {
            $program->update(['status' => 'completed']);
            $count++;

            $this->line("Marked program ID {$program->id} as completed.");

            // Notify creator
            if ($program->creator) {
                try {
                    Mail::to($program->creator->email)->send(new ProgramCompletedNotification($program));
                    Log::info("Program completed notification sent to {$program->creator->email} for program ID {$program->id}");
                } catch (\Exception $e) {
                    Log::error("Failed to send program completed notification to {$program->creator->email} for program ID {$program->id}: ".$e->getMessage());
                }
            }
        }

        $this->info("Completed. {$count} programs updated.");
    }
}
