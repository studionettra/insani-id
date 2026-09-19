<?php

namespace App\Console\Commands;

use App\Models\Disbursement;
use App\Services\NotificationGatewayService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendProgramUpdateReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'disbursements:send-update-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp and Email reminders to campaigners 7, 14, and 21 days after disbursement if no program update has been posted.';

    /**
     * Execute the console command.
     */
    public function handle(NotificationGatewayService $waService): void
    {
        $this->info('Checking for disbursements requiring update reminders...');

        $remindDays = [7, 14, 21];

        foreach ($remindDays as $days) {
            $targetDate = Carbon::today()->subDays($days);

            // Find transferred disbursements where transferred_at date matches
            $disbursements = Disbursement::with(['program.creator', 'program.campaignerProfile', 'program.updates'])
                ->where('status', 'transferred')
                ->whereDate('transferred_at', $targetDate)
                ->get();

            foreach ($disbursements as $disbursement) {
                $program = $disbursement->program;

                if (! $program || $program->campaigner_type === 'internal') {
                    continue;
                }

                // Check if an update has been posted on or after the disbursement transfer date
                $hasUpdateAfterTransfer = $program->updates()
                    ->where('created_at', '>=', $disbursement->transferred_at)
                    ->exists();

                if (! $hasUpdateAfterTransfer) {
                    $this->line("Sending day-{$days} reminder for program: {$program->title}");

                    try {
                        $waService->sendDisbursementReminder($program, $days);
                    } catch (\Exception $e) {
                        Log::error("Failed sending WA reminder for program {$program->id}: ".$e->getMessage());
                    }

                    if ($program->creator?->email) {
                        try {
                            Mail::raw(
                                "Halo {$program->creator->name},\n\nDana untuk program '{$program->title}' telah dicairkan {$days} hari yang lalu. Sebagai bentuk transparansi kepada para donatur, kami mohon untuk segera memposting Kabar Terbaru / Laporan Penyaluran melalui dashboard Anda di ".url('/akun/programs/'.$program->id.'/updates').".\n\nTerima kasih,\nTim Insani Indonesia",
                                function ($message) use ($program, $days) {
                                    $message->to($program->creator->email)
                                        ->subject("Pengingat Laporan Program (Hari ke-{$days}) - ".config('app.name'));
                                }
                            );
                        } catch (\Exception $e) {
                            Log::error("Failed sending Email reminder for program {$program->id}: ".$e->getMessage());
                        }
                    }
                }
            }
        }

        $this->info('Update reminders check completed.');
    }
}
