<?php

use App\Models\Donation;
use App\Models\Program;
use App\Services\XenditPaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Xendit\Invoice\Invoice;
use Xendit\Invoice\InvoiceApi;
use Xendit\XenditSdkException;

uses(RefreshDatabase::class);

test('it returns error when XENDIT_API_KEY is not configured', function () {
    config(['services.xendit.api_key' => null]);

    $donation = Donation::factory()->create([
        'donation_code' => 'DON-NO-KEY',
        'amount' => 50000,
        'donor_email' => 'donor@example.com',
        'donor_name' => 'Budi',
        'donor_phone' => '081234567890',
    ]);

    $service = new XenditPaymentService;
    $result = $service->createInvoice($donation);

    expect($result)->toBeArray()
        ->and($result['status'])->toBe('error')
        ->and($result['message'])->toContain('Layanan pembayaran online belum dikonfigurasi');
});

test('it successfully creates invoice via mocked InvoiceApi', function () {
    config(['services.xendit.api_key' => 'mock_xendit_api_key']);

    $program = Program::factory()->create([
        'title' => 'Bantu Korban Banjir',
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-SUCCESS-1',
        'amount' => 100000,
        'donor_email' => 'donor@example.com',
        'donor_name' => 'Budi Santoso',
        'donor_phone' => '081234567890',
    ]);

    $mockInvoice = Mockery::mock(Invoice::class);
    $mockInvoice->shouldReceive('getInvoiceUrl')->once()->andReturn('https://checkout.xendit.co/web/inv_123456');
    $mockInvoice->shouldReceive('getExternalId')->once()->andReturn('DON-SUCCESS-1');

    $mockApi = Mockery::mock(InvoiceApi::class);
    $mockApi->shouldReceive('createInvoice')
        ->once()
        ->withArgs(function ($request) {
            return $request['external_id'] === 'DON-SUCCESS-1'
                && $request['amount'] == 100000
                && $request['payer_email'] === 'donor@example.com'
                && str_contains($request['description'], 'Bantu Korban Banjir');
        })
        ->andReturn($mockInvoice);

    $service = new XenditPaymentService($mockApi);
    $result = $service->createInvoice($donation);

    expect($result)->toBeArray()
        ->and($result['status'])->toBe('success')
        ->and($result['invoice_url'])->toBe('https://checkout.xendit.co/web/inv_123456')
        ->and($result['external_id'])->toBe('DON-SUCCESS-1');
});

test('it correctly extracts localized array program title in invoice description', function () {
    config(['services.xendit.api_key' => 'mock_xendit_api_key']);

    $program = Program::factory()->create();
    $program->setRawAttributes(array_merge($program->getAttributes(), [
        'title' => json_encode(['id' => 'Renovasi Masjid', 'en' => 'Mosque Renovation']),
    ]));
    $program->save();

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donation_code' => 'DON-LOCALE-1',
        'amount' => 75000,
        'donor_email' => 'donor@example.com',
        'donor_name' => 'Ahmad',
        'donor_phone' => '081234567890',
    ]);

    $mockInvoice = Mockery::mock(Invoice::class);
    $mockInvoice->shouldReceive('getInvoiceUrl')->once()->andReturn('https://checkout.xendit.co/web/inv_locale');
    $mockInvoice->shouldReceive('getExternalId')->once()->andReturn('DON-LOCALE-1');

    $mockApi = Mockery::mock(InvoiceApi::class);
    $mockApi->shouldReceive('createInvoice')
        ->once()
        ->withArgs(function ($request) {
            return str_contains($request['description'], 'Renovasi Masjid');
        })
        ->andReturn($mockInvoice);

    $service = new XenditPaymentService($mockApi);
    $result = $service->createInvoice($donation);

    expect($result['status'])->toBe('success');
});

test('it handles XenditSdkException gracefully', function () {
    config(['services.xendit.api_key' => 'mock_xendit_api_key']);

    $donation = Donation::factory()->create([
        'donation_code' => 'DON-ERR-1',
        'amount' => 50000,
        'donor_email' => 'donor@example.com',
        'donor_name' => 'Budi',
        'donor_phone' => '081234567890',
    ]);

    $mockApi = Mockery::mock(InvoiceApi::class);
    $mockApi->shouldReceive('createInvoice')
        ->once()
        ->andThrow(new XenditSdkException((object) ['message' => 'Invalid API Key'], '401', 'Unauthorized'));

    $service = new XenditPaymentService($mockApi);
    $result = $service->createInvoice($donation);

    expect($result)->toBeArray()
        ->and($result['status'])->toBe('error')
        ->and($result['message'])->toBe('Invalid API Key');
});

test('it handles general exceptions gracefully', function () {
    config(['services.xendit.api_key' => 'mock_xendit_api_key']);

    $donation = Donation::factory()->create([
        'donation_code' => 'DON-ERR-2',
        'amount' => 50000,
        'donor_email' => 'donor@example.com',
        'donor_name' => 'Budi',
        'donor_phone' => '081234567890',
    ]);

    $mockApi = Mockery::mock(InvoiceApi::class);
    $mockApi->shouldReceive('createInvoice')
        ->once()
        ->andThrow(new RuntimeException('Connection timed out'));

    $service = new XenditPaymentService($mockApi);
    $result = $service->createInvoice($donation);

    expect($result)->toBeArray()
        ->and($result['status'])->toBe('error')
        ->and($result['message'])->toBe('Connection timed out');
});
