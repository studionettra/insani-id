<?php

use App\Jobs\SendDonationPaidNotification;
use App\Mail\DonationSuccessNotification;
use App\Mail\NewDonationNotification;
use App\Models\Donation;
use App\Models\NotificationLog;
use App\Models\Program;
use App\Models\User;
use App\Services\NotificationGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('it sends email and whatsapp notifications when donation is paid', function () {
    Mail::fake();

    $creator = User::factory()->create([
        'email' => 'campaigner@example.com',
    ]);

    $program = Program::factory()->create([
        'created_by' => $creator->id,
        'campaigner_type' => 'individu',
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'donor_email' => 'donor@example.com',
        'donor_phone' => '08123456789',
        'status' => 'paid',
    ]);

    $mockWaService = Mockery::mock(NotificationGatewayService::class);
    $mockWaService->shouldReceive('sendDonationConfirmation')
        ->once()
        ->withArgs(function ($d) use ($donation) {
            return $d->id === $donation->id;
        });

    $mockWaService->shouldReceive('sendNewDonationAlertToCampaigner')
        ->once()
        ->withArgs(function ($d) use ($donation) {
            return $d->id === $donation->id;
        });

    $job = new SendDonationPaidNotification($donation);
    $job->handle($mockWaService);

    // Assert Emails sent
    Mail::assertSent(DonationSuccessNotification::class, function ($mail) {
        return $mail->hasTo('donor@example.com');
    });

    Mail::assertQueued(NewDonationNotification::class, function ($mail) {
        return $mail->hasTo('campaigner@example.com');
    });

    // Assert Notification Logs created
    expect(NotificationLog::where('notifiable_id', $donation->id)->where('channel', 'email')->exists())->toBeTrue()
        ->and(NotificationLog::where('notifiable_id', $donation->id)->where('channel', 'whatsapp')->exists())->toBeTrue();
});
