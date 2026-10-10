<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Models\Payment;
use App\Services\MidtransCorePaymentService;
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
    protected $signature = 'donations:expire-stale {--hours=24 : Jam batas waktu donasi manual pending} {--online-hours=24 : Jam batas waktu donasi online pending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tandai donasi manual dan online yang melebihi batas waktu pembayaran sebagai expired, dengan verifikasi otomatis ke gateway.';

    /**
     * Execute the console command.
     */
    public function handle(MidtransCorePaymentService $midtrans): int
    {
        $hours = (int) $this->option('hours');
        $threshold = now()->subHours($hours);

        $onlineHours = (int) ($this->option('online-hours') ?? 24);
        $onlineThreshold = now()->subHours($onlineHours);

        $this->info("Memeriksa donasi manual pending sebelum {$threshold->toDateTimeString()} ({$hours} jam)...");

        $expiredOfflineCount = 0;

        Donation::where('channel', 'offline')
            ->where('status', 'pending')
            ->where('created_at', '<', $threshold)
            ->chunkById(100, function ($donations) use (&$expiredOfflineCount) {
                foreach ($donations as $donation) {
                    DB::transaction(function () use ($donation) {
                        $donation->update(['status' => 'expired']);

                        Payment::where('donation_id', $donation->id)
                            ->where('gateway_status', 'PENDING')
                            ->update(['gateway_status' => 'EXPIRED']);
                    });

                    $expiredOfflineCount++;
                }
            });

        $this->info("Memeriksa donasi online pending sebelum {$onlineThreshold->toDateTimeString()} ({$onlineHours} jam)...");

        $expiredOnlineCount = 0;
        $syncedPaidCount = 0;

        Donation::where('channel', 'online')
            ->where('status', 'pending')
            ->where('created_at', '<', $onlineThreshold)
            ->chunkById(100, function ($donations) use ($midtrans, &$expiredOnlineCount, &$syncedPaidCount) {
                foreach ($donations as $donation) {
                    $payment = $donation->payments()->where('gateway_status', 'PENDING')->latest()->first()
                        ?? $donation->payments()->latest()->first();

                    $resolved = false;

                    // Jika memiliki pembayaran Midtrans, coba verifikasi status terkini ke server Midtrans
                    if ($payment && $payment->gateway === 'midtrans' && $midtrans->isConfigured()) {
                        try {
                            $isPaid = $midtrans->syncPaymentStatus($payment);
                            $donation->refresh();

                            if ($donation->status === 'paid' || $isPaid) {
                                $syncedPaidCount++;
                                $resolved = true;
                            } elseif (in_array($donation->status, ['expired', 'failed', 'cancelled'], true)) {
                                $expiredOnlineCount++;
                                $resolved = true;
                            }
                        } catch (\Throwable $e) {
                            Log::warning("ExpireStaleDonations: Gagal sinkronisasi Midtrans untuk donasi {$donation->donation_code}: {$e->getMessage()}");
                        }
                    }

                    // Jika status belum terselesaikan (misal Midtrans mengembalikan error atau order not found), tandai expired
                    if (! $resolved && $donation->status === 'pending') {
                        DB::transaction(function () use ($donation, $payment) {
                            $donation->update(['status' => 'expired']);

                            if ($payment) {
                                $payment->update(['gateway_status' => 'EXPIRED']);
                            } else {
                                Payment::where('donation_id', $donation->id)
                                    ->where('gateway_status', 'PENDING')
                                    ->update(['gateway_status' => 'EXPIRED']);
                            }
                        });

                        $expiredOnlineCount++;
                    }
                }
            });

        $this->info("Selesai. {$expiredOfflineCount} donasi manual kedaluwarsa, {$expiredOnlineCount} donasi online kedaluwarsa, {$syncedPaidCount} donasi online terverifikasi lunas.");
        Log::info("ExpireStaleDonations: {$expiredOfflineCount} offline expired, {$expiredOnlineCount} online expired, {$syncedPaidCount} online synced paid.");

        return Command::SUCCESS;
    }
}
