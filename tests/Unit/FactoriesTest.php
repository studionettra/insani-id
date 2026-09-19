<?php

use App\Models\Category;
use App\Models\Comment;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\ProgramUpdate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->group('factories');

test('ProgramFactory creates valid model', function () {
    $program = Program::factory()->create();
    expect($program)->toBeInstanceOf(Program::class)
        ->and($program->program_code)->toStartWith('PRG-')
        ->and($program->title)->not->toBeEmpty()
        ->and($program->slug)->not->toBeEmpty()
        ->and($program->category_id)->not->toBeNull()
        ->and($program->campaigner_type)->toBeIn(['individu', 'lembaga', 'internal'])
        ->and($program->created_by)->not->toBeNull()
        ->and($program->target_amount)->toBeGreaterThan(0)
        ->and($program->collected_amount)->toBe('0.00')
        ->and($program->status)->toBeIn(['draft', 'pending_verification', 'published', 'rejected', 'completed', 'closed_manual']);
});

test('ProgramFactory published state', function () {
    $program = Program::factory()->published()->create();
    expect($program->status)->toBe('published')
        ->and($program->published_at)->not->toBeNull();
});

test('ProgramFactory pending state', function () {
    $program = Program::factory()->pending()->create();
    expect($program->status)->toBe('pending_verification');
});

test('CategoryFactory creates valid model', function () {
    $category = Category::factory()->create();
    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->slug)->not->toBeEmpty()
        ->and($category->is_active)->toBeTrue()
        ->and($category->platform_fee_percent)->toBeGreaterThanOrEqual(0);

    $name = $category->getTranslations('name');
    expect($name)->toBeArray()->toHaveKey('id');
});

test('DonationFactory creates valid model', function () {
    $donation = Donation::factory()->create();
    expect($donation)->toBeInstanceOf(Donation::class)
        ->and($donation->donation_code)->toStartWith('DON-')
        ->and($donation->program_id)->not->toBeNull()
        ->and($donation->donor_name)->not->toBeEmpty()
        ->and($donation->donor_email)->toContain('@')
        ->and($donation->amount)->toBeGreaterThan(0)
        ->and($donation->channel)->toBeIn(['online', 'offline'])
        ->and($donation->status)->toBeIn(['pending', 'paid', 'expired', 'failed', 'refunded']);
});

test('DonationFactory paid state', function () {
    $donation = Donation::factory()->paid()->create();
    expect($donation->status)->toBe('paid')
        ->and($donation->paid_at)->not->toBeNull();
});

test('PaymentFactory creates valid model', function () {
    $payment = Payment::factory()->create();
    expect($payment)->toBeInstanceOf(Payment::class)
        ->and($payment->donation_id)->not->toBeNull()
        ->and($payment->payment_method)->toBeIn(['virtual_account', 'ewallet', 'qris', 'credit_card', 'bank_transfer_manual'])
        ->and($payment->gateway)->not->toBeEmpty()
        ->and($payment->gateway_status)->toBeIn(['PENDING', 'PAID', 'EXPIRED', 'FAILED']);
});

test('PaymentFactory paid state', function () {
    $payment = Payment::factory()->paid()->create();
    expect($payment->gateway_status)->toBe('PAID')
        ->and($payment->paid_amount)->not->toBeNull()
        ->and($payment->paid_at)->not->toBeNull();
});

test('DisbursementFactory creates valid model', function () {
    $disbursement = Disbursement::factory()->create();
    expect($disbursement)->toBeInstanceOf(Disbursement::class)
        ->and($disbursement->program_id)->not->toBeNull()
        ->and($disbursement->requested_amount)->toBeGreaterThan(0)
        ->and($disbursement->bank_name)->not->toBeEmpty()
        ->and($disbursement->bank_account_number)->not->toBeEmpty()
        ->and($disbursement->bank_account_name)->not->toBeEmpty()
        ->and($disbursement->status)->toBeIn(['pending', 'approved', 'rejected', 'transferred'])
        ->and($disbursement->nett_amount)->toBeLessThanOrEqual($disbursement->requested_amount);
});

test('CommentFactory creates valid model', function () {
    $comment = Comment::factory()->create();
    expect($comment)->toBeInstanceOf(Comment::class)
        ->and($comment->program_id)->not->toBeNull()
        ->and($comment->name)->not->toBeEmpty()
        ->and($comment->body)->not->toBeEmpty()
        ->and($comment->is_hidden)->toBeFalse();
});

test('ProgramUpdateFactory creates valid model', function () {
    $update = ProgramUpdate::factory()->create();
    expect($update)->toBeInstanceOf(ProgramUpdate::class)
        ->and($update->program_id)->not->toBeNull()
        ->and($update->title)->not->toBeEmpty()
        ->and($update->content)->not->toBeEmpty()
        ->and($update->created_by)->not->toBeNull()
        ->and($update->is_published)->toBeTrue();
});
