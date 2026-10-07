<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\MidtransCorePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        // Find payment record by gateway_reference_id or donation code
        $payment = Payment::where('gateway_reference_id', $orderId)
            ->where('gateway', 'midtrans')
            ->first();

        if (! $payment) {
            // Fallback find by donation code
            $payment = Payment::whereHas('donation', function ($q) use ($orderId) {
                $q->where('donation_code', $orderId);
            })->where('gateway', 'midtrans')->latest()->first();
        }

        if (! $payment) {
            Log::warning("Payment not found for Midtrans order {$orderId}");

            return response()->json(['message' => 'Payment not found'], 404);
        }

        // Map Midtrans transaction status to application gateway_status
        $gatewayStatus = 'PENDING';
        $isPaid = false;

        if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
            $gatewayStatus = 'PAID';
            $isPaid = true;
        } elseif ($transactionStatus === 'expire') {
            $gatewayStatus = 'EXPIRED';
        } elseif (in_array($transactionStatus, ['cancel', 'deny'], true)) {
            $gatewayStatus = 'FAILED';
        }

        // Calculate Midtrans official gateway fee using centralized pricing logic
        $amountFloat = (float) $grossAmount;
        $fee = $isPaid ? MidtransCorePaymentService::calculateGatewayFee($paymentType, $amountFloat) : 0.0;

        $updateData = [
            'gateway_status' => $gatewayStatus,
            'paid_amount' => $isPaid ? $amountFloat : null,
            'gateway_fee' => $fee,
            'paid_at' => $isPaid ? ($payment->paid_at ?? now()) : null,
            'raw_payload' => array_merge($payment->raw_payload ?? [], ['webhook' => $payload]),
        ];

        // Capture VA number if present in webhook
        if (! empty($payload['va_numbers'][0]['va_number'])) {
            $updateData['payment_destination'] = $payload['va_numbers'][0]['va_number'];
        } elseif (! empty($payload['permata_va_number'])) {
            $updateData['payment_destination'] = $payload['permata_va_number'];
        } elseif (! empty($payload['bill_key'])) {
            $updateData['payment_destination'] = $payload['bill_key'];
        }

        // Update payment (PaymentObserver will automatically handle donation status,
        // comments, program accumulated amounts, and receipt email notifications)
        $payment->update($updateData);

        return response()->json(['message' => 'Midtrans webhook processed successfully'], 200);
    }
}
