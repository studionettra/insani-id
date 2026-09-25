<?php

use App\Models\CampaignerProfile;
use App\Models\CampaignSlotRequest;
use App\Models\User;
use App\Notifications\CampaignSlotRequestedNotification;
use App\Notifications\CampaignSlotRequestReviewedNotification;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Notification::fake();
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $verifyPerm = Permission::firstOrCreate(['name' => 'campaigner.verify']);
    $this->adminRole->givePermissionTo($verifyPerm);

    $this->admin = User::factory()->create(['name' => 'Superadmin Insani']);
    $this->admin->assignRole('Administrator');

    $this->lembagaRole = Role::firstOrCreate(['name' => 'Campaigner Lembaga']);
    $createPerm = Permission::firstOrCreate(['name' => 'program.create']);
    $this->lembagaRole->givePermissionTo($createPerm);

    $this->lembagaUser = User::factory()->create(['name' => 'PIC Yayasan Peduli']);
    $this->lembagaUser->assignRole('Campaigner Lembaga');
    $this->lembagaProfile = CampaignerProfile::create([
        'user_id' => $this->lembagaUser->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Peduli Bersama',
        'max_campaign_slots' => 3,
        'bank_name' => 'BSI',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Yayasan Peduli Bersama',
    ]);

    $this->individuRole = Role::firstOrCreate(['name' => 'Campaigner Individu']);
    $this->individuRole->givePermissionTo($createPerm);

    $this->individuUser = User::factory()->create(['name' => 'Individu User']);
    $this->individuUser->assignRole('Campaigner Individu');
    $this->individuProfile = CampaignerProfile::create([
        'user_id' => $this->individuUser->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'max_campaign_slots' => 1,
        'bank_name' => 'BSI',
        'bank_account_number' => '1234567891',
        'bank_account_name' => 'Individu User',
    ]);
});

it('allows lembaga campaigner to submit a slot increase request', function () {
    actingAs($this->lembagaUser)
        ->post(route('akun.slot-requests.store'), [
            'requested_slots' => 5,
            'reason' => 'Kami memiliki 2 program bantuan bencana alam darurat yang harus segera dibuka.',
            'planned_programs' => 'Program Dapur Umum Banjir dan Bantuan Sandang Pangan.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slotRequest = CampaignSlotRequest::first();
    expect($slotRequest)->not->toBeNull();
    expect($slotRequest->current_slots)->toBe(3);
    expect($slotRequest->requested_slots)->toBe(5);
    expect($slotRequest->status)->toBe('pending');
    expect($slotRequest->campaigner_profile_id)->toBe($this->lembagaProfile->id);

    Notification::assertSentTo($this->admin, CampaignSlotRequestedNotification::class);
});

it('blocks individu campaigner from submitting slot increase request', function () {
    actingAs($this->individuUser)
        ->post(route('akun.slot-requests.store'), [
            'requested_slots' => 2,
            'reason' => 'Ingin menambah campaign kedua.',
        ])
        ->assertSessionHas('error');

    expect(CampaignSlotRequest::count())->toBe(0);
});

it('prevents lembaga from submitting multiple pending slot requests', function () {
    CampaignSlotRequest::create([
        'campaigner_profile_id' => $this->lembagaProfile->id,
        'requested_by' => $this->lembagaUser->id,
        'current_slots' => 3,
        'requested_slots' => 5,
        'reason' => 'Pengajuan pertama yang masih diproses.',
        'status' => 'pending',
    ]);

    actingAs($this->lembagaUser)
        ->post(route('akun.slot-requests.store'), [
            'requested_slots' => 6,
            'reason' => 'Pengajuan kedua yang harus ditolak.',
        ])
        ->assertSessionHas('error');

    expect(CampaignSlotRequest::count())->toBe(1);
});

it('validates that requested slots must be greater than current slots', function () {
    actingAs($this->lembagaUser)
        ->post(route('akun.slot-requests.store'), [
            'requested_slots' => 3, // Sama dengan kuota sekarang
            'reason' => 'Pengajuan slot yang sama.',
        ])
        ->assertSessionHasErrors('requested_slots');
});

it('allows superadmin to view slot requests list', function () {
    CampaignSlotRequest::create([
        'campaigner_profile_id' => $this->lembagaProfile->id,
        'requested_by' => $this->lembagaUser->id,
        'current_slots' => 3,
        'requested_slots' => 5,
        'reason' => 'Pengajuan program kemanusiaan.',
        'status' => 'pending',
    ]);

    actingAs($this->admin)
        ->get(route('admin.slot-requests.index'))
        ->assertSuccessful();
});

it('allows superadmin to approve slot request and updates campaigner profile slots', function () {
    $slotRequest = CampaignSlotRequest::create([
        'campaigner_profile_id' => $this->lembagaProfile->id,
        'requested_by' => $this->lembagaUser->id,
        'current_slots' => 3,
        'requested_slots' => 5,
        'reason' => 'Permohonan program yatim piatu.',
        'status' => 'pending',
    ]);

    actingAs($this->admin)
        ->post(route('admin.slot-requests.approve', $slotRequest->id), [
            'approved_slots' => 5,
            'admin_notes' => 'Disetujui. Lembaga memiliki rekam jejak penyaluran yang sangat baik.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slotRequest->refresh();
    expect($slotRequest->status)->toBe('approved');
    expect($slotRequest->reviewed_by)->toBe($this->admin->id);
    expect($slotRequest->reviewed_at)->not->toBeNull();
    expect($slotRequest->admin_notes)->toContain('Disetujui');

    // Profile max slots must be updated to 5
    expect($this->lembagaProfile->fresh()->max_campaign_slots)->toBe(5);

    Notification::assertSentTo($this->lembagaUser, CampaignSlotRequestReviewedNotification::class);
});

it('allows superadmin to reject slot request with reason', function () {
    $slotRequest = CampaignSlotRequest::create([
        'campaigner_profile_id' => $this->lembagaProfile->id,
        'requested_by' => $this->lembagaUser->id,
        'current_slots' => 3,
        'requested_slots' => 5,
        'reason' => 'Permohonan tambahan.',
        'status' => 'pending',
    ]);

    actingAs($this->admin)
        ->post(route('admin.slot-requests.reject', $slotRequest->id), [
            'admin_notes' => 'Mohon selesaikan dan unggah kabar laporan penyaluran untuk campaign sebelumnya terlebih dahulu.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slotRequest->refresh();
    expect($slotRequest->status)->toBe('rejected');
    expect($slotRequest->reviewed_by)->toBe($this->admin->id);

    // Profile max slots must remain unchanged (3)
    expect($this->lembagaProfile->fresh()->max_campaign_slots)->toBe(3);

    Notification::assertSentTo($this->lembagaUser, CampaignSlotRequestReviewedNotification::class);
});
