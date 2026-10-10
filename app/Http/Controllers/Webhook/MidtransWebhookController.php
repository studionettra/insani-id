<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\MidtransCorePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function __construct(
        protected MidtransCorePaymentService $midtrans
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');
        $transactionStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? 'accept');
        $paymentType = (string) ($payload['payment_type'] ?? '');

        Log::info('Midtrans Webhook Received', [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'transaction_status' => $transactionStatus,
            'payment_type' => $paymentType,
        ]);

        if (empty($orderId) || empty($statusCode) || empty($grossAmount) || empty($signatureKey)) {
            return response()->json(['message' => 'Missing required webhook parameters'], 400);
        }

        // Verify cryptographic SHA-512 signature
        if (! $this->midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning('Unauthorized Midtrans Webhook: Invalid Signature', [
                'order_id' => $orderId,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Invalid signature'], 403);
        }

        return DB::transaction(function () use ($orderId, $grossAmount, $transactionStatus, $fraudStatus, $paymentType, $payload) {
            // Find payment record with pessimistic lock
            $payment = Payment::with('donation')
                ->where('gateway_reference_id', $orderId)
                ->where('gateway', 'midtrans')
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                // Fallback find by donation code
                $payment = Payment::with('donation')
                    ->whereHas('donation', function ($q) use ($orderId) {
                        $q->where('donation_code', $orderId);
                    })
                    ->where('gateway', 'midtrans')
                    ->latest()
                    ->lockForUpdate()
                    ->first();
            }

            if (! $payment) {
                Log::warning("Payment not found for Midtrans order {$orderId}");

                return response()->json(['message' => 'Payment not found'], 404);
            }

            $currentStatus = strtoupper((string) $payment->gateway_status);
            $isSettlement = ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept'));
            $isExpire = ($transactionStatus === 'expire');
            $isFailed = in_array($transactionStatus, ['cancel', 'deny'], true);

            // Monotonic state protection: if payment is already PAID, ignore out-of-order downgrade callbacks
            if ($currentStatus === 'PAID' && ! $isSettlement) {
                Log::info("Ignored out-of-order Midtrans webhook for order {$orderId}. Current status is already PAID, received: {$transactionStatus}");

                $payment->update([
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['ignored_webhook' => $payload]),
                ]);

                return response()->json(['message' => 'Ignored out-of-order webhook; payment already settled'], 200);
            }

            // Handle settlement/capture
            if ($isSettlement) {
                $amountFloat = (float) $grossAmount;
                $expectedAmount = (float) ($payment->donation?->amount ?? 0);

                // Strict nominal comparison to prevent financial mismatch
                if (round($amountFloat, 2) !== round($expectedAmount, 2)) {
                    Log::error("Midtrans Webhook Nominal Mismatch for order {$orderId}", [
                        'received_gross_amount' => $amountFloat,
                        'expected_donation_amount' => $expectedAmount,
                        'donation_code' => $payment->donation?->donation_code,
                    ]);

                    $payment->update([
                        'gateway_status' => 'MISMATCH',
                        'raw_payload' => array_merge($payment->raw_payload ?? [], [
                            'mismatch_webhook' => $payload,
                            'mismatch_details' => [
                                'received' => $amountFloat,
                                'expected' => $expectedAmount,
                                'detected_at' => now()->toIso8601String(),
                            ],
                        ]),
                    ]);

                    return response()->json(['message' => 'Nominal mismatch; payment quarantined for review'], 200);
                }

                $gatewayStatus = 'PAID';
                $isPaid = true;
                $fee = MidtransCorePaymentService::calculateGatewayFee($paymentType, $amountFloat);

                $updateData = [
                    'gateway_status' => $gatewayStatus,
                    'paid_amount' => $amountFloat,
                    'gateway_fee' => $fee,
                    'paid_at' => $payment->paid_at ?? now(),
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['webhook' => $payload]),
                ];
            } elseif ($isExpire) {
                $updateData = [
                    'gateway_status' => 'EXPIRED',
                    'paid_amount' => null,
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['webhook' => $payload]),
                ];
            } elseif ($isFailed) {
                $updateData = [
                    'gateway_status' => 'FAILED',
                    'paid_amount' => null,
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['webhook' => $payload]),
                ];
            } else {
                $updateData = [
                    'gateway_status' => 'PENDING',
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['webhook' => $payload]),
                ];
            }

            // Capture VA number if present in webhook
            if (! empty($payload['va_numbers'][0]['va_number'])) {
                $updateData['payment_destination'] = $payload['va_numbers'][0]['va_number'];
            } elseif (! empty($payload['permata_va_number'])) {
                $updateData['payment_destination'] = $payload['permata_va_number'];
            } elseif (! empty($payload['bill_key'])) {
                $updateData['payment_destination'] = $payload['bill_key'];
            }

            $payment->update($updateData);

            return response()->json(['message' => 'Midtrans webhook processed successfully'], 200);
        });
    }
}
