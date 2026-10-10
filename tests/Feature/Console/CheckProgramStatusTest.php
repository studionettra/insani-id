<?php

use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('programs check-status command handles programs with soft-deleted creators smoothly', function () {
    Mail::fake();

    $creator = User::factory()->create();
    $program = Program::factory()->create([
        'created_by' => $creator->id,
        'status' => 'published',
        'is_continuous' => false,
        'target_amount' => 1000000,
        'collected_amount' => 1000000,
    ]);

    // Soft-delete the creator
    $creator->delete();

    $this->artisan('programs:check-status')
        ->assertSuccessful();

    $program->refresh();
    expect($program->status)->toBe('completed');
});
