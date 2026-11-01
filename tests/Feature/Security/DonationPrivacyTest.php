<?php

use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guest searching by email does not receive donation records and receives privacy notice', function () {
    $program = Program::factory()->create();
    $donation = Donation::factory()->for($program)->create([
        'donor_email' => 'victim@example.com',
        'donor_name' => 'Donatur Dermawan',
        'donation_code' => 'DON-SECRET123',
    ]);

    $response = $this->get(route('donation.lookup', ['q' => 'victim@example.com']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Donation/Lookup')
        ->where('search', 'victim@example.com')
        ->where('donations', null)
        ->whereNot('notice', null)
    );
});

test('guest searching with valid donation code redirects directly to status page', function () {
    $program = Program::factory()->create();
    $donation = Donation::factory()->for($program)->create([
        'donation_code' => 'DON-VALID9999',
    ]);

    $response = $this->get(route('donation.lookup', ['q' => 'DON-VALID9999']));

    $response->assertRedirect(route('donation.status', ['donationCode' => 'DON-VALID9999']));
});

test('authenticated user searching their own email can view their donation records', function () {
    $user = User::factory()->create(['email' => 'owner@example.com']);
    $program = Program::factory()->create();
    $donation = Donation::factory()->for($program)->create([
        'donor_email' => 'owner@example.com',
        'donor_user_id' => $user->id,
        'donation_code' => 'DON-OWNED111',
    ]);

    $response = $this->actingAs($user)->get(route('donation.lookup', ['q' => 'owner@example.com']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Donation/Lookup')
        ->where('search', 'owner@example.com')
        ->has('donations.data', 1)
        ->where('donations.data.0.donation_code', 'DON-OWNED111')
    );
});

test('authenticated user searching another user email is blocked with privacy notice', function () {
    $user = User::factory()->create(['email' => 'attacker@example.com']);
    $program = Program::factory()->create();
    Donation::factory()->for($program)->create([
        'donor_email' => 'victim@example.com',
        'donation_code' => 'DON-VICTIM777',
    ]);

    $response = $this->actingAs($user)->get(route('donation.lookup', ['q' => 'victim@example.com']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Donation/Lookup')
        ->where('donations', null)
        ->whereNot('notice', null)
    );
});
