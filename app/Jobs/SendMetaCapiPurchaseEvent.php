<?php

namespace App\Jobs;

use App\Models\Donation;
use App\Services\MetaCapiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendMetaCapiPurchaseEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Donation $donation,
        public ?string $clientIp = null,
        public ?string $userAgent = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(MetaCapiService $capiService): void
    {
        $this->donation->loadMissing('program');
        $capiService->sendPurchaseEvent($this->donation, $this->clientIp, $this->userAgent);
    }
}
