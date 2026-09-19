<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\XenditPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();

        Log::info('Xendit Webhook Received', ['external_id' => $payload['external_id'] ?? null, 'status' => $payload['status'] ?? null]);

        // Xendit sends external_id which maps to our donation_code
        // And also status like PAID, EXPIRED, SETTLED

        if (! isset($payload['external_id'])) {
            return response()->json(['message' => 'Missing external_id'], 400);
        }

        $payment = Payment::where('gateway_reference_id', $payload['external_id'])
            ->where('gateway', 'xendit')
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $status = strtoupper($payload['status'] ?? '');
        $isPaid = in_array($status, ['PAID', 'SETTLED']);

        $updateData = [
            'gateway_status' => $status,
            'paid_amount' => $isPaid ? ($payload['paid_amount'] ?? $payload['amount'] ?? null) : null,
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
    }
}
