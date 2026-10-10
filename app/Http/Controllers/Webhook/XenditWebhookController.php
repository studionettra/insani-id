<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\XenditPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();

        Log::info('Xendit Webhook Received', ['external_id' => $payload['external_id'] ?? null, 'status' => $payload['status'] ?? null]);

        if (! isset($payload['external_id'])) {
            return response()->json(['message' => 'Missing external_id'], 400);
        }

        return DB::transaction(function () use ($payload) {
            $payment = Payment::with('donation')
                ->where('gateway_reference_id', $payload['external_id'])
                ->where('gateway', 'xendit')
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            $currentStatus = strtoupper((string) $payment->gateway_status);
            $status = strtoupper($payload['status'] ?? '');
            $isPaid = in_array($status, ['PAID', 'SETTLED'], true);

            // Monotonic protection: If current payment is already PAID/SETTLED, ignore out-of-order downgrade attempts
            if (in_array($currentStatus, ['PAID', 'SETTLED'], true) && ! $isPaid) {
                Log::info("Ignored out-of-order Xendit webhook for order {$payload['external_id']}. Current status is already {$currentStatus}, received: {$status}");

                $payment->update([
                    'raw_payload' => array_merge($payment->raw_payload ?? [], ['ignored_webhook' => $payload]),
                ]);

                return response()->json(['message' => 'Ignored out-of-order webhook; payment already settled'], 200);
            }

            $gatewayFee = 0;
            if ($isPaid) {
                $paidAmount = (float) ($payload['paid_amount'] ?? $payload['amount'] ?? 0);
                $expectedAmount = (float) ($payment->donation?->amount ?? 0);

                // Strict nominal comparison to prevent financial mismatch
                if (round($paidAmount, 2) !== round($expectedAmount, 2)) {
                    Log::error("Xendit Webhook Nominal Mismatch for external_id {$payload['external_id']}", [
                        'received_amount' => $paidAmount,
                        'expected_donation_amount' => $expectedAmount,
                        'donation_code' => $payment->donation?->donation_code,
                    ]);

                    $payment->update([
                        'gateway_status' => 'MISMATCH',
                        'raw_payload' => array_merge($payment->raw_payload ?? [], [
                            'mismatch_webhook' => $payload,
                            'mismatch_details' => [
                                'received' => $paidAmount,
                                'expected' => $expectedAmount,
                                'detected_at' => now()->toIso8601String(),
                            ],
                        ]),
                    ]);

                    return response()->json(['message' => 'Nominal mismatch; payment quarantined for review'], 200);
                }

                if (! empty($payload['fees']) && is_array($payload['fees'])) {
                    $gatewayFee = (float) array_sum(array_column($payload['fees'], 'value'));
                } elseif (isset($payload['fee'])) {
                    $gatewayFee = (float) $payload['fee'];
                } elseif (isset($payload['fee_amount'])) {
                    $gatewayFee = (float) $payload['fee_amount'];
                } else {
                    $method = strtoupper($payload['payment_method'] ?? '');
                    $channel = strtoupper($payload['payment_channel'] ?? $payload['bank_code'] ?? '');
                    if ($method === 'QRIS' || $channel === 'QRIS') {
                        $gatewayFee = round($paidAmount * 0.007 * 1.11, 2);
                    } elseif (in_array($method, ['EWALLET', 'OVO', 'DANA', 'SHOPEEPAY', 'ASTRAPAY']) || in_array($channel, ['OVO', 'DANA', 'SHOPEEPAY', 'ASTRAPAY'])) {
                        $gatewayFee = round($paidAmount * 0.015 * 1.11, 2);
                    } elseif (in_array($method, ['VIRTUAL_ACCOUNT', 'POOL', 'FIXED_VA']) || str_contains($method, 'VA') || in_array($channel, ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'CIMB', 'BSI'])) {
                        $gatewayFee = 4440;
                    }
                }
            }

            $updateData = [
                'gateway_status' => $status,
                'paid_amount' => $isPaid ? ($payload['paid_amount'] ?? $payload['amount'] ?? null) : null,
                'gateway_fee' => $gatewayFee,
                'paid_at' => $isPaid ? ($payment->paid_at ?? now()) : null,
                'raw_payload' => $payload,
            ];

            if (! empty($payload['payment_method'])) {
                $updateData['payment_method'] = XenditPaymentService::mapPaymentMethod($payload['payment_method']);
            }

            $channel = $payload['payment_channel'] ?? $payload['bank_code'] ?? null;
            if (! empty($channel)) {
                $updateData['payment_channel'] = $channel;
            }

            if (! empty($payload['payment_destination'])) {
                $updateData['payment_destination'] = $payload['payment_destination'];
            }

            $payment->update($updateData);

            return response()->json(['message' => 'Webhook processed successfully'], 200);
        });
    }
}
