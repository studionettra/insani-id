<?php

use App\Jobs\SendDonationPaidNotification;
use App\Models\Comment;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.xendit.webhook_token' => 'test-webhook-token']);
});

test('it returns 403 when x-callback-token header is missing or invalid', function () {
    $response = $this->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-123456',
        'status' => 'PAID',
    ]);

    $response->assertStatus(403);
    expect($response->json('message'))->toBe('Unauthorized token');

    $responseInvalid = $this->withHeaders([
        'x-callback-token' => 'wrong-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-123456',
        'status' => 'PAID',
    ]);

    $responseInvalid->assertStatus(403);
    expect($responseInvalid->json('message'))->toBe('Unauthorized token');
});

test('it returns 400 when external_id is missing', function () {
    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'status' => 'PAID',
    ]);

    $response->assertStatus(400);
    expect($response->json('message'))->toBe('Missing external_id');
});

test('it returns 404 when payment is not found', function () {
    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'NON-EXISTENT-ID',
        'status' => 'PAID',
    ]);

    $response->assertStatus(404);
    expect($response->json('message'))->toBe('Payment not found');
});

test('it successfully processes PAID webhook and updates donation, comments, and program collected amount', function () {
    Queue::fake();

    $program = Program::factory()->create([
        'target_amount' => 500000,
        'collected_amount' => 0,
        'status' => 'published',
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-PAY-1',
        'amount' => 150000,
        'status' => 'pending',
        'message' => 'Semoga berkah selalu',
        'is_anonymous' => false,
        'donor_name' => 'Budi Santoso',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-PAY-1',
        'gateway_status' => 'PENDING',
    ]);

    $payload = [
        'external_id' => 'DON-PAY-1',
        'status' => 'PAID',
        'paid_amount' => 150000,
        'payment_method' => 'BANK_TRANSFER',
    ];

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), $payload);

    $response->assertOk();
    expect($response->json('message'))->toBe('Webhook processed successfully');

    // Assert Payment updated
    $payment->refresh();
    expect($payment->gateway_status)->toBe('PAID')
        ->and((float) $payment->paid_amount)->toBe(150000.0)
        ->and($payment->paid_at)->not->toBeNull()
        ->and($payment->raw_payload)->toBe($payload);

    // Assert Donation updated
    $donation->refresh();
    expect($donation->status)->toBe('paid')
        ->and($donation->paid_at)->not->toBeNull();

    // Assert Comment created
    $comment = Comment::where('donation_id', $donation->id)->first();
    expect($comment)->not->toBeNull()
        ->and($comment->name)->toBe('Budi Santoso')
        ->and($comment->body)->toBe('Semoga berkah selalu')
        ->and($comment->is_hidden)->toBeFalse();

    // Assert Program collected_amount recalculated
    $program->refresh();
    expect((float) $program->collected_amount)->toBe(150000.0)
        ->and($program->status)->toBe('published');

    // Assert Notification dispatched
    Queue::assertPushed(SendDonationPaidNotification::class, function ($job) use ($donation) {
        return $job->donation->id === $donation->id;
    });
});

test('it marks program completed when target amount is reached', function () {
    Queue::fake();

    $program = Program::factory()->create([
        'target_amount' => 200000,
        'collected_amount' => 100000,
        'status' => 'published',
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-TARGET-REACHED',
        'amount' => 100000,
        'status' => 'pending',
        'message' => null,
    ]);

    Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-TARGET-REACHED',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-TARGET-REACHED',
        'status' => 'PAID',
        'amount' => 100000,
    ]);

    $response->assertOk();

    $program->refresh();
    expect((float) $program->collected_amount)->toBe(100000.0) // Note: only paid donations are summed
        ->and($program->status)->toBe('published'); // 100000 is < 200000, let's test exact target:

    // Now make it reach or exceed target
    $donation2 = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-TARGET-2',
        'amount' => 150000,
        'status' => 'pending',
    ]);

    Payment::factory()->create([
        'donation_id' => $donation2->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-TARGET-2',
        'gateway_status' => 'PENDING',
    ]);

    $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-TARGET-2',
        'status' => 'PAID',
        'amount' => 150000,
    ]);

    $program->refresh();
    // 100000 + 150000 = 250000 >= 200000 target
    expect((float) $program->collected_amount)->toBe(250000.0)
        ->and($program->status)->toBe('completed');
});

test('it handles anonymous donations by creating comment under Hamba Allah', function () {
    Queue::fake();

    $program = Program::factory()->create();

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-ANON-1',
        'amount' => 50000,
        'status' => 'pending',
        'is_anonymous' => true,
        'donor_name' => 'Secret Donor',
        'message' => 'Doa terbaik untuk semua',
    ]);

    Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-ANON-1',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-ANON-1',
        'status' => 'PAID',
        'amount' => 50000,
    ]);

    $response->assertOk();

    $comment = Comment::where('donation_id', $donation->id)->first();
    expect($comment)->not->toBeNull()
        ->and($comment->name)->toBe('Hamba Allah')
        ->and($comment->body)->toBe('Doa terbaik untuk semua');
});

test('it marks donation as expired when EXPIRED status is received', function () {
    $donation = Donation::factory()->create([
        'donation_code' => 'DON-EXP-1',
        'status' => 'pending',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-EXP-1',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-EXP-1',
        'status' => 'EXPIRED',
    ]);

    $response->assertOk();

    $payment->refresh();
    $donation->refresh();

    expect($payment->gateway_status)->toBe('EXPIRED')
        ->and($donation->status)->toBe('expired');
});

test('it marks donation as failed when FAILED status is received', function () {
    $donation = Donation::factory()->create([
        'donation_code' => 'DON-FAIL-1',
        'status' => 'pending',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-FAIL-1',
        'gateway_status' => 'PENDING',
    ]);

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), [
        'external_id' => 'DON-FAIL-1',
        'status' => 'FAILED',
    ]);

    $response->assertOk();

    $payment->refresh();
    $donation->refresh();

    expect($payment->gateway_status)->toBe('FAILED')
        ->and($donation->status)->toBe('failed');
});

test('it successfully processes SETTLED webhook and updates payment channel and donation status', function () {
    Queue::fake();

    $program = Program::factory()->create();

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-SETTLED-1',
        'amount' => 50000,
        'status' => 'pending',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-SETTLED-1',
        'gateway_status' => 'PENDING',
    ]);

    $payload = [
        'external_id' => 'DON-SETTLED-1',
        'status' => 'SETTLED',
        'amount' => 50000,
        'paid_amount' => 50000,
        'payment_method' => 'EWALLET',
        'payment_channel' => 'SHOPEEPAY',
    ];

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), $payload);

    $response->assertOk();

    $payment->refresh();
    $donation->refresh();

    expect($payment->gateway_status)->toBe('SETTLED')
        ->and((float) $payment->paid_amount)->toBe(50000.0)
        ->and($payment->paid_at)->not->toBeNull()
        ->and($payment->payment_method)->toBe('ewallet')
        ->and($payment->payment_channel)->toBe('SHOPEEPAY')
        ->and($donation->status)->toBe('paid')
        ->and((float) $payment->gateway_fee)->toBeGreaterThan(0);
});

test('webhook saves explicit fees from payload and updates program available balance correctly', function () {
    $program = Program::factory()->create([
        'target_amount' => 1000000,
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-FEE-TEST',
        'amount' => 100000,
        'status' => 'pending',
    ]);

    $payment = Payment::factory()->create([
        'donation_id' => $donation->id,
        'gateway' => 'xendit',
        'gateway_reference_id' => 'DON-FEE-TEST',
        'gateway_status' => 'PENDING',
    ]);

    $payload = [
        'external_id' => 'DON-FEE-TEST',
        'status' => 'PAID',
        'amount' => 100000,
        'paid_amount' => 100000,
        'fees' => [
            ['type' => 'admin', 'value' => 4440],
        ],
    ];

    $response = $this->withHeaders([
        'x-callback-token' => 'test-webhook-token',
    ])->postJson(route('webhooks.xendit'), $payload);

    $response->assertOk();

    $payment->refresh();
    $donation->refresh();
    $program->refresh();

    expect((float) $payment->gateway_fee)->toBe(4440.0)
        ->and($donation->status)->toBe('paid')
        ->and((float) $program->total_collected_amount)->toBe(100000.0)
        ->and((float) $program->total_gateway_fees)->toBe(4440.0)
        ->and((float) $program->net_collected_amount)->toBe(95560.0)
        ->and((float) $program->available_balance)->toBe(95560.0);
});
