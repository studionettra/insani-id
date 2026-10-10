<?php

use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders public program detail page with transparency data successfully', function () {
    $user = User::factory()->create();
    $program = Program::factory()->published()->create([
        'created_by' => $user->id,
        'title' => ['id' => 'Bantu Korban Bencana'],
        'story' => ['id' => '<p>Deskripsi cerita program donasi kemanusiaan.</p>'],
        'target_amount' => 10000000,
        'collected_amount' => 5000000,
    ]);

    // Create a paid donation with payment gateway fee
    $donation = Donation::factory()->create([
        'program_id' => $program->id,
        'amount' => 500000,
        'status' => 'paid',
    ]);
    Payment::create([
        'donation_id' => $donation->id,
        'gateway' => 'midtrans',
        'payment_method' => 'qris',
        'gateway_fee' => 3500,
        'gateway_status' => 'PAID',
        'paid_at' => now(),
    ]);

    // Create a transferred disbursement
    $disb = Disbursement::create([
        'program_id' => $program->id,
        'requested_amount' => 300000,
        'platform_fee_percent' => 5,
        'platform_fee_amount' => 15000,
        'bank_fee' => 2500,
        'nett_amount' => 282500,
        'status' => 'transferred',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'John Doe',
        'receipt_number' => 'KW-DISB-202609-0001',
        'distribution_plan' => 'Penyaluran beras dan sembako',
        'beneficiary_target' => '50 KK',
        'location' => 'Cianjur',
        'transferred_at' => now(),
    ]);

    ProgramUpdate::create([
        'program_id' => $program->id,
        'disbursement_id' => $disb->id,
        'title' => ['id' => 'Laporan Penyaluran Beras'],
        'content' => ['id' => 'Beras telah disalurkan kepada 50 KK.'],
        'created_by' => $user->id,
        'is_published' => true,
        'moderation_status' => 'approved',
    ]);

    $response = $this->get("/program/{$program->slug}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Program/Show')
        ->has('program')
        ->has('transparency')
        ->where('transparency.total_collected', 500000)
        ->where('transparency.total_gateway_fees', 3500)
        ->where('transparency.total_disbursed', 300000)
        ->where('transparency.total_platform_fees', 15000)
        ->where('transparency.total_transferred_nett', 282500)
        ->where('transparency.available_balance', 196500) // 500000 - 3500 - 300000 = 196500
        ->has('transparency.disbursements', 1)
        ->where('transparency.disbursements.0.bank_name', 'BCA')
        ->where('transparency.disbursements.0.bank_account_name', 'John Doe')
        ->where('transparency.disbursements.0.bank_account_number', '*** **** 7890')
        ->where('transparency.disbursements.0.bank_account_number_masked', '*** **** 7890')
        ->where('transparency.disbursements.0.program_update.id', fn ($id) => ! empty($id))
    );
});

it('renders public program detail page with empty disbursements array cleanly', function () {
    $user = User::factory()->create();
    $program = Program::factory()->published()->create([
        'created_by' => $user->id,
        'title' => ['id' => 'Bantu Air Bersih'],
    ]);

    $response = $this->get("/program/{$program->slug}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Program/Show')
        ->has('transparency')
        ->where('transparency.disbursements', [])
    );
});
