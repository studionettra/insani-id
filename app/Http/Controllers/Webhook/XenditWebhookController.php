<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
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
        
        if (!isset($payload['external_id'])) {
            return response()->json(['message' => 'Missing external_id'], 400);
        }

        $payment = Payment::where('gateway_reference_id', $payload['external_id'])
                        ->where('gateway', 'xendit')
                        ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $status = $payload['status'];

        $payment->update([
            'gateway_status' => $status,
            'paid_amount' => $status === 'PAID' ? ($payload['paid_amount'] ?? $payload['amount']) : null,
            'paid_at' => $status === 'PAID' ? now() : null,
            'raw_payload' => $payload
        ]);

        return response()->json(['message' => 'Webhook processed successfully'], 200);
    }
}
