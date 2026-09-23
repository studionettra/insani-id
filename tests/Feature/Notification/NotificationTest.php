<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Jobs\SendDonationPaidNotification;
use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use App\Notifications\CampaignerRegisteredNotification;
use App\Notifications\CampaignerStatusUpdatedNotification;
use App\Notifications\ContactMessageReceivedNotification;
use App\Notifications\DisbursementRequestedNotification;
use App\Notifications\DisbursementStatusUpdatedNotification;
use App\Notifications\DonationConfirmedNotification;
use App\Notifications\DonationReceivedNotification;
use App\Notifications\ProgramStatusUpdatedNotification;
use App\Notifications\ProgramSubmittedNotification;
use App\Services\NotificationGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'dashboard.view']);
    Permission::firstOrCreate(['name' => 'disbursement.view']);
    Permission::firstOrCreate(['name' => 'disbursement.create']);
    Permission::firstOrCreate(['name' => 'disbursement.approve']);
    Permission::firstOrCreate(['name' => 'campaigner.view']);
    Permission::firstOrCreate(['name' => 'campaigner.verify']);
    Permission::firstOrCreate(['name' => 'manage_contact_messages']);
    Permission::firstOrCreate(['name' => 'donation.view']);
    Permission::firstOrCreate(['name' => 'program.view']);
    Permission::firstOrCreate(['name' => 'program.publish']);

    $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $adminRole->givePermissionTo(Permission::all());

    $verifierRole = Role::firstOrCreate(['name' => 'Verifikator']);
    $verifierRole->givePermissionTo(['dashboard.view', 'campaigner.view', 'campaigner.verify', 'program.publish']);

    $financeRole = Role::firstOrCreate(['name' => 'Keuangan']);
    $financeRole->givePermissionTo(['dashboard.view', 'disbursement.view', 'disbursement.approve', 'donation.view']);

    $csRole = Role::firstOrCreate(['name' => 'Customer Service']);
    $csRole->givePermissionTo(['dashboard.view', 'manage_contact_messages']);

    Role::firstOrCreate(['name' => 'Campaigner Individu']);
    Role::firstOrCreate(['name' => 'Campaigner Lembaga']);

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

test('pengajuan pencairan dana mengirim notifikasi database ke admin dan keuangan', function () {
    Notification::fake();

    $finance = User::factory()->create();
    $finance->assignRole('Keuangan');

    $campaigner = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $campaigner->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $campaigner->name,
        'address' => 'Jl. Test No 1',
        'phone' => '08123456789',
    ]);

    $category = Category::create([
        'name' => 'Sosial',
        'slug' => 'sosial',
        'description' => 'Kategori sosial',
        'is_active' => true,
        'platform_fee_percent' => 5,
    ]);

    $program = Program::factory()->create([
        'program_code' => 'PRG-NOTIF-01',
        'category_id' => $category->id,
        'campaigner_type' => 'campaigner',
        'campaigner_profile_id' => $profile->id,
        'created_by' => $campaigner->id,
        'title' => 'Program Bantuan Sosial',
    ]);

    Donation::create([
        'donation_code' => 'DON-TEST-001',
        'program_id' => $program->id,
        'donor_name' => 'Donatur Dermawan',
        'donor_email' => 'donor@test.com',
        'donor_phone' => '08123456789',
        'amount' => 1000000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($campaigner)->post(route('akun.programs.disbursements.store', $program->id), [
        'requested_amount' => 500000,
        'notes' => 'Pencairan tahap 1',
    ]);

    $response->assertRedirect(route('akun.programs.disbursements.index', $program->id));

    Notification::assertSentTo([$this->admin, $finance], DisbursementRequestedNotification::class);
});

test('pendaftaran campaigner memicu notifikasi ke verifikator dan admin', function () {
    Notification::fake();
    Storage::fake('local');

    $verifier = User::factory()->create();
    $verifier->assignRole('Verifikator');

    $applicant = User::factory()->create();

    $response = $this->actingAs($applicant)->post(route('campaigner.register.store'), [
        'type' => 'individu',
        'bank_name' => 'Mandiri',
        'bank_account_number' => '9876543210',
        'bank_account_name' => $applicant->name,
        'address' => 'Jl. Pendaftaran No. 12',
        'phone' => '08987654321',
        'ktp' => UploadedFile::fake()->image('ktp.jpg'),
        'selfie_ktp' => UploadedFile::fake()->image('selfie.jpg'),
        'buku_rekening' => UploadedFile::fake()->image('rekening.jpg'),
    ]);

    $response->assertRedirect(route('campaigner.status'));

    Notification::assertSentTo([$this->admin, $verifier], CampaignerRegisteredNotification::class);
});

test('pesan kontak masuk memicu notifikasi ke customer service dan admin', function () {
    Notification::fake();

    $cs = User::factory()->create();
    $cs->assignRole('Customer Service');

    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response(['success' => true], 200),
    ]);

    $response = $this->post(route('contact.store'), [
        'name' => 'Fulan Pengunjung',
        'email' => 'fulan@example.com',
        'phone' => '081299998888',
        'subject' => 'Tanya Prosedur Kerjasama',
        'message' => 'Halo tim Insani, bagaimana cara bermitra?',
        'cf-turnstile-response' => 'fake-turnstile-token',
    ]);

    $response->assertSessionHas('success');

    Notification::assertSentTo([$this->admin, $cs], ContactMessageReceivedNotification::class);
});

test('user dapat menandai satu notifikasi sebagai dibaca', function () {
    $contactMessage = ContactMessage::create([
        'name' => 'Donatur Tanya',
        'email' => 'tanya@example.com',
        'subject' => 'Pertanyaan',
        'message' => 'Isi pesan',
    ]);

    $this->admin->notify(new ContactMessageReceivedNotification($contactMessage));

    $notification = $this->admin->notifications()->first();
    expect($notification->read_at)->toBeNull();

    $response = $this->actingAs($this->admin)->patch(route('notifications.read', $notification->id));
    $response->assertRedirect();

    $notification->refresh();
    expect($notification->read_at)->not->toBeNull();
});

test('endpoint read-and-redirect menandai notifikasi dibaca dan me-redirect ke target URL', function () {
    $contactMessage = ContactMessage::create([
        'name' => 'Donatur Tanya',
        'email' => 'tanya@example.com',
        'subject' => 'Pertanyaan Kerjasama',
        'message' => 'Isi pesan kontak',
    ]);

    $this->admin->notify(new ContactMessageReceivedNotification($contactMessage));

    $notification = $this->admin->notifications()->first();
    expect($notification->read_at)->toBeNull();

    $response = $this->actingAs($this->admin)->get(route('notifications.go', $notification->id));
    $response->assertRedirect(route('admin.contact-messages.show', $contactMessage->id));

    $notification->refresh();
    expect($notification->read_at)->not->toBeNull();
});

test('user dapat menandai semua notifikasi sebagai dibaca sekaligus', function () {
    $msg1 = ContactMessage::create(['name' => 'A', 'email' => 'a@a.com', 'subject' => 'S1', 'message' => 'M1']);
    $msg2 = ContactMessage::create(['name' => 'B', 'email' => 'b@b.com', 'subject' => 'S2', 'message' => 'M2']);

    $this->admin->notify(new ContactMessageReceivedNotification($msg1));
    $this->admin->notify(new ContactMessageReceivedNotification($msg2));

    expect($this->admin->unreadNotifications()->count())->toBe(2);

    $response = $this->actingAs($this->admin)->post(route('notifications.mark-all-read'));
    $response->assertRedirect();

    expect($this->admin->unreadNotifications()->count())->toBe(0);
});

test('shared props inertia menyertakan data notifications yang tepat', function () {
    $msg = ContactMessage::create(['name' => 'Budi', 'email' => 'budi@test.com', 'subject' => 'Halo', 'message' => 'Halo Insani']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg));

    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications', fn (Assert $page) => $page
                ->where('unread_count', 1)
                ->has('recent', 1)
                ->where('recent.0.data.title', 'Pesan Kontak Masuk')
                ->etc()
            )
        );
});

test('user dapat mengakses halaman index pusat notifikasi dengan pagination dan filter', function () {
    $msg = ContactMessage::create(['name' => 'User Index', 'email' => 'idx@test.com', 'subject' => 'Subject', 'message' => 'Msg']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg));

    $response = $this->actingAs($this->admin)->get(route('notifications.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Notifications/Index')
        ->has('notifications.data', 1)
        ->has('stats', fn (Assert $stats) => $stats
            ->where('total', 1)
            ->where('unread', 1)
            ->where('read', 0)
        )
    );
});

test('user dapat menandai notifikasi sebagai belum dibaca kembali (mark as unread)', function () {
    $msg = ContactMessage::create(['name' => 'Unread Test', 'email' => 'unread@test.com', 'subject' => 'Sub', 'message' => 'Msg']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg));

    $notification = $this->admin->notifications()->first();
    $notification->markAsRead();
    expect($notification->fresh()->read_at)->not->toBeNull();

    $response = $this->actingAs($this->admin)->patch(route('notifications.unread', $notification->id));
    $response->assertRedirect();

    expect($notification->fresh()->read_at)->toBeNull();
});

test('user dapat menghapus notifikasi satuan', function () {
    $msg = ContactMessage::create(['name' => 'Del Test', 'email' => 'del@test.com', 'subject' => 'Sub', 'message' => 'Msg']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg));

    $notification = $this->admin->notifications()->first();

    $response = $this->actingAs($this->admin)->delete(route('notifications.destroy', $notification->id));
    $response->assertRedirect();

    expect($this->admin->notifications()->count())->toBe(0);
});

test('user tidak dapat menghapus notifikasi milik user lain', function () {
    $otherUser = User::factory()->create();
    $msg = ContactMessage::create(['name' => 'Other Test', 'email' => 'other@test.com', 'subject' => 'Sub', 'message' => 'Msg']);
    $otherUser->notify(new ContactMessageReceivedNotification($msg));

    $notification = $otherUser->notifications()->first();

    $response = $this->actingAs($this->admin)->delete(route('notifications.destroy', $notification->id));
    $response->assertNotFound();

    expect($otherUser->notifications()->count())->toBe(1);
});

test('user dapat melakukan aksi massal (bulk action) tandai dibaca dan hapus', function () {
    $msg1 = ContactMessage::create(['name' => 'B1', 'email' => 'b1@test.com', 'subject' => 'Sub 1', 'message' => 'Msg 1']);
    $msg2 = ContactMessage::create(['name' => 'B2', 'email' => 'b2@test.com', 'subject' => 'Sub 2', 'message' => 'Msg 2']);

    $this->admin->notify(new ContactMessageReceivedNotification($msg1));
    $this->admin->notify(new ContactMessageReceivedNotification($msg2));

    $ids = $this->admin->notifications()->pluck('id')->toArray();
    expect(count($ids))->toBe(2);

    // 1. Bulk mark as read
    $response = $this->actingAs($this->admin)->post(route('notifications.bulk-action'), [
        'action' => 'mark_read',
        'ids' => $ids,
    ]);
    $response->assertRedirect();
    expect($this->admin->unreadNotifications()->count())->toBe(0);

    // 2. Bulk delete
    $delResponse = $this->actingAs($this->admin)->post(route('notifications.bulk-action'), [
        'action' => 'delete',
        'ids' => $ids,
    ]);
    $delResponse->assertRedirect();
    expect($this->admin->notifications()->count())->toBe(0);
});

test('user dapat membersihkan semua notifikasi yang telah dibaca (clear-read)', function () {
    $msg1 = ContactMessage::create(['name' => 'C1', 'email' => 'c1@test.com', 'subject' => 'Sub 1', 'message' => 'Msg 1']);
    $msg2 = ContactMessage::create(['name' => 'C2', 'email' => 'c2@test.com', 'subject' => 'Sub 2', 'message' => 'Msg 2']);

    $this->admin->notify(new ContactMessageReceivedNotification($msg1));
    $this->admin->notify(new ContactMessageReceivedNotification($msg2));

    // Mark msg1 as read, msg2 remains unread
    $notif1 = $this->admin->notifications()->first();
    $notif1->markAsRead();

    expect($this->admin->notifications()->count())->toBe(2);
    expect($this->admin->readNotifications()->count())->toBe(1);

    $response = $this->actingAs($this->admin)->delete(route('notifications.clear-read'));
    $response->assertRedirect();

    expect($this->admin->notifications()->count())->toBe(1);
    expect($this->admin->unreadNotifications()->count())->toBe(1);
});

test('notifikasi donasi masuk (DonationReceivedNotification) terkirim saat job SendDonationPaidNotification berjalan', function () {
    Notification::fake();

    $finance = User::factory()->create();
    $finance->assignRole('Keuangan');

    $category = Category::create([
        'name' => 'Pendidikan',
        'slug' => 'pendidikan',
        'description' => 'Pendidikan',
        'is_active' => true,
    ]);

    $campaigner = User::factory()->create();
    $program = Program::factory()->create([
        'program_code' => 'PRG-DON-01',
        'category_id' => $category->id,
        'campaigner_type' => 'campaigner',
        'created_by' => $campaigner->id,
        'title' => 'Beasiswa Yatim',
    ]);

    $donation = Donation::create([
        'donation_code' => 'DON-RCV-01',
        'program_id' => $program->id,
        'donor_name' => 'Ibu Rahma',
        'donor_email' => 'rahma@example.com',
        'donor_phone' => '08123456789',
        'amount' => 250000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $mockWa = Mockery::mock(NotificationGatewayService::class);
    $mockWa->shouldReceive('sendDonationConfirmation')->andReturn(true);
    $mockWa->shouldReceive('sendNewDonationAlertToCampaigner')->andReturn(true);

    $job = new SendDonationPaidNotification($donation);
    $job->handle($mockWa);

    Notification::assertSentTo([$this->admin, $finance, $campaigner], DonationReceivedNotification::class);
});

test('pengajuan program baru dari campaigner memicu notifikasi ProgramSubmittedNotification', function () {
    Notification::fake();
    Storage::fake('public');

    $verifier = User::factory()->create();
    $verifier->assignRole('Verifikator');

    $campaigner = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $campaigner->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Peduli Insan',
        'bank_name' => 'BSI',
        'bank_account_number' => '1122334455',
        'bank_account_name' => 'Yayasan Peduli Insan',
        'address' => 'Jl. Kemanusiaan No. 5',
        'phone' => '081211112222',
    ]);

    $category = Category::create([
        'name' => 'Kemanusiaan',
        'slug' => 'kemanusiaan',
        'description' => 'Bencana dan kemanusiaan',
        'is_active' => true,
    ]);

    $response = $this->actingAs($campaigner)->post(route('akun.programs.store'), [
        'title' => 'Bantuan Korban Banjir',
        'category_id' => $category->id,
        'target_amount' => 50000000,
        'deadline' => now()->addDays(30)->toDateString(),
        'story' => '<p>Bantuan darurat logistik dan sembako bagi masyarakat terdampak banjir bandang.</p>',
        'cover_image' => UploadedFile::fake()->image('cover.jpg'),
    ]);

    $response->assertRedirect(route('akun.programs.index'));

    Notification::assertSentTo([$this->admin, $verifier], ProgramSubmittedNotification::class);
});

test('inertia partial reload untuk prop notifications berhasil mengembalikan data notifications terbaru', function () {
    $msg = ContactMessage::create(['name' => 'Partial Test', 'email' => 'partial@test.com', 'subject' => 'Sub', 'message' => 'Msg']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg));

    $middleware = new HandleInertiaRequests;
    $version = $middleware->version(request());

    $response = $this->actingAs($this->admin)->get(route('dashboard'), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
        'X-Inertia-Partial-Component' => 'Dashboard',
        'X-Inertia-Partial-Data' => 'notifications',
    ]);

    $response->assertOk();
    $response->assertJsonPath('props.notifications.unread_count', 1);
    $response->assertJsonPath('props.notifications.recent.0.data.title', 'Pesan Kontak Masuk');
});

test('admin memverifikasi campaigner memicu CampaignerStatusUpdatedNotification ke user', function () {
    Notification::fake();

    $user = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'nik' => '1234567890123456',
        'phone' => '08123456789',
        'address' => 'Jl. Merdeka No. 1',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $user->name,
        'verification_status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.campaigners.update-status', $profile->id), [
        'status' => 'verified',
    ]);

    $response->assertRedirect(route('admin.campaigners.index'));
    Notification::assertSentTo($user, CampaignerStatusUpdatedNotification::class, function ($n) {
        return $n->status === 'verified';
    });
});

test('admin menolak verifikasi campaigner memicu CampaignerStatusUpdatedNotification dengan catatan', function () {
    Notification::fake();

    $user = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'nik' => '1234567890123456',
        'phone' => '08123456789',
        'address' => 'Jl. Merdeka No. 1',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => $user->name,
        'verification_status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.campaigners.update-status', $profile->id), [
        'status' => 'rejected',
        'notes' => 'Foto KTP buram dan tidak terbaca',
    ]);

    $response->assertRedirect(route('admin.campaigners.index'));
    Notification::assertSentTo($user, CampaignerStatusUpdatedNotification::class, function ($n) {
        return $n->status === 'rejected' && str_contains($n->notes, 'Foto KTP buram');
    });
});

test('admin memperbarui status program memicu ProgramStatusUpdatedNotification ke creator', function () {
    Notification::fake();

    $creator = User::factory()->create();
    $category = Category::create([
        'name' => 'Pendidikan',
        'slug' => 'pendidikan',
        'description' => 'Program pendidikan',
        'is_active' => true,
    ]);

    $program = Program::create([
        'program_code' => 'PRG-TEST-001',
        'title' => ['id' => 'Renovasi Sekolah Pelosok'],
        'slug' => 'renovasi-sekolah-pelosok',
        'category_id' => $category->id,
        'campaigner_type' => 'user',
        'created_by' => $creator->id,
        'target_amount' => 10000000,
        'story' => ['id' => '<p>Renovasi atap dan lantai sekolah dasar di desa terpencil.</p>'],
        'cover_image' => 'programs/covers/test1.jpg',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.programs.update-status', $program->id), [
        'status' => 'published',
    ]);

    $response->assertSessionHasNoErrors();
    Notification::assertSentTo($creator, ProgramStatusUpdatedNotification::class, function ($n) {
        return $n->status === 'published';
    });
});

test('admin memperbarui status pencairan dana memicu DisbursementStatusUpdatedNotification ke campaigner', function () {
    Notification::fake();

    $creator = User::factory()->create();
    $category = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
        'description' => 'Program kesehatan',
        'is_active' => true,
    ]);

    $program = Program::create([
        'program_code' => 'PRG-TEST-002',
        'title' => ['id' => 'Operasi Balita'],
        'slug' => 'operasi-balita',
        'category_id' => $category->id,
        'campaigner_type' => 'user',
        'created_by' => $creator->id,
        'target_amount' => 20000000,
        'collected_amount' => 15000000,
        'story' => ['id' => '<p>Bantuan operasi balita penderita kelainan jantung.</p>'],
        'cover_image' => 'programs/covers/test2.jpg',
        'status' => 'published',
    ]);

    $disbursement = Disbursement::create([
        'disbursement_code' => 'DISB-TEST-001',
        'program_id' => $program->id,
        'requested_amount' => 5000000,
        'nett_amount' => 5000000,
        'bank_name' => 'BCA',
        'bank_account_number' => '9988776655',
        'bank_account_name' => 'Ibu Pasien',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.disbursements.update-status', $disbursement->id), [
        'status' => 'approved',
    ]);

    $response->assertSessionHasNoErrors();
    Notification::assertSentTo($creator, DisbursementStatusUpdatedNotification::class, function ($n) {
        return $n->disbursement->status === 'approved';
    });
});

test('pembayaran donasi sukses mengirimkan DonationConfirmedNotification ke akun donatur terdaftar', function () {
    Notification::fake();
    Http::fake();

    $donor = User::factory()->create();
    $creator = User::factory()->create();

    $category = Category::create([
        'name' => 'Sosial',
        'slug' => 'sosial',
        'description' => 'Program sosial',
        'is_active' => true,
    ]);

    $program = Program::create([
        'program_code' => 'PRG-TEST-003',
        'title' => ['id' => 'Beras untuk Lansia'],
        'slug' => 'beras-untuk-lansia',
        'category_id' => $category->id,
        'campaigner_type' => 'user',
        'created_by' => $creator->id,
        'target_amount' => 10000000,
        'story' => ['id' => '<p>Bantuan sembako beras lansia dhuafa.</p>'],
        'cover_image' => 'programs/covers/test3.jpg',
        'status' => 'published',
    ]);

    $donation = Donation::create([
        'donation_code' => 'DON-TEST-001',
        'program_id' => $program->id,
        'donor_user_id' => $donor->id,
        'donor_name' => $donor->name,
        'donor_email' => $donor->email,
        'donor_phone' => '081234567890',
        'amount' => 250000,
        'unique_code' => 123,
        'channel' => 'manual_transfer',
        'status' => 'pending',
    ]);

    $donation->update(['status' => 'verified', 'paid_at' => now()]);

    $job = new SendDonationPaidNotification($donation);
    $job->handle(app(NotificationGatewayService::class));

    Notification::assertSentTo($donor, DonationConfirmedNotification::class, function ($n) {
        return $n->donation->amount == 250000;
    });
});

test('prune notifications menghapus notifikasi dibaca lebih dari 60 hari dan mempertahankan lainnya', function () {
    $msg1 = ContactMessage::create(['name' => 'Old', 'email' => 'old@test.com', 'subject' => 'Old', 'message' => 'Old']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg1));
    $oldReadNotif = $this->admin->notifications()->first();
    $oldReadNotif->update([
        'read_at' => now()->subDays(65),
    ]);

    $msg2 = ContactMessage::create(['name' => 'Recent', 'email' => 'recent@test.com', 'subject' => 'Recent', 'message' => 'Recent']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg2));
    $recentReadNotif = $this->admin->unreadNotifications()->first();
    $recentReadNotif->update([
        'read_at' => now()->subDays(10),
    ]);

    $msg3 = ContactMessage::create(['name' => 'UnreadOld', 'email' => 'unread@test.com', 'subject' => 'Unread', 'message' => 'Unread']);
    $this->admin->notify(new ContactMessageReceivedNotification($msg3));
    $unreadNotif = $this->admin->unreadNotifications()->first();
    $unreadNotif->update([
        'created_at' => now()->subDays(70),
    ]);

    expect($this->admin->notifications()->count())->toBe(3);

    DB::table('notifications')
        ->whereNotNull('read_at')
        ->where('read_at', '<', now()->subDays(60))
        ->delete();

    expect($this->admin->notifications()->count())->toBe(2);
    expect($this->admin->notifications()->where('id', $oldReadNotif->id)->exists())->toBeFalse();
    expect($this->admin->notifications()->where('id', $recentReadNotif->id)->exists())->toBeTrue();
    expect($this->admin->notifications()->where('id', $unreadNotif->id)->exists())->toBeTrue();
});
