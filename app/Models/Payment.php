<?php

namespace App\Models;

use App\Services\MidtransCorePaymentService;
use App\Services\XenditPaymentService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Payment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'donation_id',
        'payment_method',
        'payment_channel',
        'payment_destination',
        'checkout_url',
        'gateway',
        'gateway_reference_id',
        'gateway_status',
        'paid_amount',
        'gateway_fee',
        'paid_at',
        'confirmed_by',
        'transfer_proof',
        'raw_payload',
    ];

    protected $appends = [
        'transfer_proof_url',
        'payment_channel_label',
    ];

    public function getTransferProofUrlAttribute(): ?string
    {
        if (! $this->transfer_proof) {
            return null;
        }

        if (auth()->check() && (auth()->user()->can('donation.view') || auth()->user()->hasRole('Administrator'))) {
            return route('admin.donations.proof', $this->donation_id);
        }

        return null;
    }

    public function getPaymentChannelLabelAttribute(): string
    {
        return self::formatChannelLabel(
            $this->payment_channel,
            $this->payment_method,
            $this->payment_destination,
            $this->relationLoaded('donation') ? $this->donation?->channel : null
        );
    }

    /**
     * Resolve a user-friendly, non-technical payment channel/method label.
     */
    public static function formatChannelLabel(
        ?string $paymentChannel,
        ?string $paymentMethod = null,
        ?string $paymentDestination = null,
        ?string $donationChannel = null
    ): string {
        $cleanChannel = trim((string) $paymentChannel);
        $upperChannel = strtoupper($cleanChannel);
        $isManual = ($donationChannel === 'offline')
            || ($paymentMethod === 'bank_transfer_manual')
            || str_starts_with($upperChannel, 'MANUAL_');

        // 1. Try finding channel definition in MidtransCorePaymentService or XenditPaymentService
        if (! empty($cleanChannel)) {
            $def = MidtransCorePaymentService::findChannel($cleanChannel)
                ?? XenditPaymentService::findChannel($cleanChannel);
            if ($def && ! empty($def['name'])) {
                return $def['name'];
            }
        }

        // 2. If manual / offline, match destination or code with BankAccount records
        if (! empty($paymentDestination) || ! empty($cleanChannel)) {
            $cleanDest = preg_replace('/[^0-9]/', '', (string) $paymentDestination);
            try {
                $account = BankAccount::all()->first(function ($acc) use ($cleanDest, $upperChannel) {
                    if (! empty($cleanDest)) {
                        $accNum = preg_replace('/[^0-9]/', '', (string) $acc->account_number);
                        if (! empty($accNum) && $accNum === $cleanDest) {
                            return true;
                        }
                    }

                    $accBankCode = strtoupper((string) ($acc->bank_code ?? ''));
                    if (! empty($accBankCode) && ($upperChannel === $accBankCode || $upperChannel === 'MANUAL_'.$accBankCode)) {
                        return true;
                    }

                    $generatedCode = 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $acc->bank_name));

                    return $upperChannel === $generatedCode;
                });

                if ($account && ! empty($account->bank_name)) {
                    return $account->bank_name;
                }
            } catch (\Throwable $e) {
                // Ignore fallback
            }
        }

        // 3. Fallback bank and channel dictionary
        $code = str_replace('MANUAL_', '', $upperChannel);
        $bankMap = [
            'BRI' => 'Bank Rakyat Indonesia (BRI)',
            'BSI' => 'Bank Syariah Indonesia (BSI)',
            'BCA' => 'Bank BCA',
            'BNI' => 'Bank BNI',
            'MANDIRI' => 'Bank Mandiri',
            'PERMATA' => 'Bank Permata',
            'CIMB' => 'Bank CIMB Niaga',
            'MUAMALAT' => 'Bank Muamalat',
            'BTN' => 'Bank BTN',
            'DANAMON' => 'Bank Danamon',
            'JAGO' => 'Bank Jago',
            'QRIS' => 'QRIS',
            'OVO' => 'OVO',
            'DANA' => 'DANA',
            'SHOPEEPAY' => 'ShopeePay',
            'ASTRAPAY' => 'AstraPay',
            'GOPAY' => 'GoPay',
            'LINKAJA' => 'LinkAja',
        ];

        if (isset($bankMap[$code])) {
            return $bankMap[$code];
        }

        // 4. Method-specific fallback
        $cleanMethod = strtolower(trim((string) $paymentMethod));
        if ($cleanMethod === 'qris') {
            return 'QRIS';
        }

        if ($isManual) {
            return ! empty($code) ? 'Bank '.$code : 'Transfer Bank Manual';
        }

        if ($cleanMethod === 'virtual_account') {
            return ! empty($code) ? $code.' Virtual Account' : 'Virtual Account';
        }

        if ($cleanMethod === 'ewallet') {
            return ! empty($code) ? $code : 'E-Wallet';
        }

        if ($cleanMethod === 'credit_card') {
            return 'Kartu Kredit';
        }

        if (! empty($cleanChannel)) {
            return ucwords(strtolower(str_replace(['_', '-'], ' ', $cleanChannel)));
        }

        return $donationChannel === 'offline' ? 'Transfer Bank Manual' : 'Online Payment';
    }

    protected $casts = [
        'paid_amount' => 'decimal:2',
        'gateway_fee' => 'decimal:2',
        'paid_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }
}
