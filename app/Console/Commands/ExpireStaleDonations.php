<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireStaleDonations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:expire-stale {--hours=48 : Jam batas waktu donasi manual pending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tandai donasi manual (offline) yang melebihi batas waktu pembayaran sebagai expired.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = (int) $this->option('hours');
        $threshold = now()->subHours($hours);

        $this->info("Memeriksa donasi manual pending sebelum {$threshold->toDateTimeString()} ({$hours} jam)...");

        $expiredCount = 0;

        Donation::where('channel', 'offline')
            ->where('status', 'pending')
            ->where('created_at', '<', $threshold)
            ->chunkById(100, function ($donations) use (&$expiredCount) {
                foreach ($donations as $donation) {
                    DB::transaction(function () use ($donation) {
                        $donation->update(['status' => 'expired']);

                        Payment::where('donation_id', $donation->id)
                            ->where('gateway_status', 'PENDING')
                            ->update(['gateway_status' => 'EXPIRED']);
                    });

                    $expiredCount++;
                }
            });

        $this->info("Selesai. Sebanyak {$expiredCount} donasi manual kedaluwarsa telah diperbarui.");
        Log::info("ExpireStaleDonations: Marked {$expiredCount} offline donations as expired.");

        return Command::SUCCESS;
    }
}
