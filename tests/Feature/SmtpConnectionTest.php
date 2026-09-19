<?php

use App\Mail\DonationSuccessNotification;
use App\Models\Donation;
use Illuminate\Support\Facades\Mail;

test('inspect actually sent email body', function () {
    $donation = Donation::factory()->create([
        'donor_name' => 'Imam R',
        'donor_email' => 'studionettra@gmail.com',
        'amount' => 50000,
        'paid_at' => now(),
        'channel' => 'online',
        'status' => 'paid',
        'is_anonymous' => false,
        'donor_user_id' => null,
    ]);
    Mail::mailer('smtp')->to('studionettra@gmail.com')->send(new DonationSuccessNotification($donation));
    expect(true)->toBeTrue();
})->skip('Manual SMTP verification test');
