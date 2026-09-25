<?php

use App\Models\CampaignerProfile;
use App\Models\CampaignSlotRequest;
use App\Models\ContactMessage;
use App\Models\Disbursement;
use App\Models\Program;
use App\Models\User;
use App\Notifications\CampaignerRegisteredNotification;
use App\Notifications\CampaignSlotRequestedNotification;
use App\Notifications\CampaignSlotRequestReviewedNotification;
use App\Notifications\ContactMessageReceivedNotification;
use App\Notifications\DisbursementRequestedNotification;
use App\Notifications\DisbursementStatusUpdatedNotification;
use App\Notifications\ProgramStatusUpdatedNotification;
use App\Notifications\ProgramSubmittedNotification;
use Illuminate\Notifications\Messages\MailMessage;

it('renders CampaignSlotRequestedNotification mail correctly', function () {
    $user = User::factory()->make(['email' => 'admin@insani.id', 'name' => 'Admin Insani']);
    $profile = new CampaignerProfile([
        'nama_lembaga' => 'Yayasan Peduli Insani',
    ]);
    $slotRequest = new CampaignSlotRequest([
        'current_slots' => 3,
        'requested_slots' => 5,
        'reason' => 'Ingin membuka program Ramadhan baru',
    ]);
    $slotRequest->setRelation('campaignerProfile', $profile);
    $slotRequest->setRelation('requester', $user);

    $notification = new CampaignSlotRequestedNotification($slotRequest);

    expect($notification->via($user))->toContain('database', 'mail');

    $mail = $notification->toMail($user);
    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toContain('Pengajuan Tambahan Slot Campaign - Yayasan Peduli Insani')
        ->and($mail->introLines)->toContain('Mitra lembaga **Yayasan Peduli Insani** telah mengajukan permohonan penambahan kuota slot campaign aktif di Insani Indonesia.')
        ->and($mail->actionUrl)->toBe(route('admin.slot-requests.index'));
});

it('renders CampaignSlotRequestReviewedNotification mail for approved status', function () {
    $user = User::factory()->make(['email' => 'lembaga@insani.id', 'name' => 'Mitra Lembaga']);
    $profile = new CampaignerProfile([
        'nama_lembaga' => 'Yayasan Berkah Bersama',
        'max_campaign_slots' => 5,
    ]);
    $slotRequest = new CampaignSlotRequest([
        'status' => 'approved',
        'current_slots' => 3,
        'requested_slots' => 5,
    ]);
    $slotRequest->setRelation('campaignerProfile', $profile);
    $slotRequest->setRelation('requester', $user);

    $notification = new CampaignSlotRequestReviewedNotification($slotRequest);

    expect($notification->via($user))->toContain('database', 'mail');

    $mail = $notification->toMail($user);
    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toContain('Alhamdulillah! Pengajuan Tambahan Slot Campaign Anda Disetujui')
        ->and($mail->actionUrl)->toBe(route('akun.programs.index'));
});

it('renders CampaignSlotRequestReviewedNotification mail for rejected status', function () {
    $user = User::factory()->make(['email' => 'lembaga@insani.id', 'name' => 'Mitra Lembaga']);
    $profile = new CampaignerProfile([
        'nama_lembaga' => 'Yayasan Berkah Bersama',
        'max_campaign_slots' => 3,
    ]);
    $slotRequest = new CampaignSlotRequest([
        'status' => 'rejected',
        'current_slots' => 3,
        'requested_slots' => 6,
        'admin_notes' => 'Harap selesaikan pelaporan campaign sebelumnya terlebih dahulu.',
    ]);
    $slotRequest->setRelation('campaignerProfile', $profile);
    $slotRequest->setRelation('requester', $user);

    $notification = new CampaignSlotRequestReviewedNotification($slotRequest);

    $mail = $notification->toMail($user);
    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toContain('Pemberitahuan Terkait Pengajuan Tambahan Slot Campaign')
        ->and($mail->actionUrl)->toBe(route('akun.programs.index'));
});

it('renders DisbursementRequestedNotification mail correctly', function () {
    $admin = User::factory()->make(['email' => 'keuangan@insani.id', 'name' => 'Finance Admin']);
    $program = new Program(['title' => 'Bantuan Korban Bencana Banjir']);
    $disbursement = new Disbursement([
        'requested_amount' => 15000000,
        'bank_name' => 'Bank Syariah Indonesia (BSI)',
        'bank_account_number' => '7123456789',
        'bank_account_name' => 'Yayasan Peduli',
        'notes' => 'Penyaluran logistik sembako tahap 1',
    ]);
    $disbursement->id = '01923456-789a-bcde-f012-3456789abcde';
    $disbursement->setRelation('program', $program);

    $notification = new DisbursementRequestedNotification($disbursement);

    expect($notification->via($admin))->toContain('database', 'mail');

    $mail = $notification->toMail($admin);
    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toContain('Permohonan Pencairan Dana - Bantuan Korban Bencana Banjir')
        ->and($mail->actionUrl)->toBe(route('admin.disbursements.show', $disbursement->id));
});

it('renders DisbursementStatusUpdatedNotification mail for transferred status', function () {
    $campaigner = User::factory()->make(['email' => 'campaigner@insani.id', 'name' => 'Ketua Yayasan']);
    $program = new Program(['title' => 'Renovasi Masjid Pelosok']);
    $program->id = '01923456-1111-2222-3333-444455556666';

    $disbursement = new Disbursement([
        'program_id' => $program->id,
        'requested_amount' => 20000000,
        'amount' => 20000000,
        'status' => 'transferred',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '1420001234567',
        'bank_account_name' => 'Panitia Renovasi',
    ]);
    $disbursement->id = '01923456-7777-8888-9999-000011112222';
    $disbursement->setRelation('program', $program);

    $notification = new DisbursementStatusUpdatedNotification($disbursement);

    expect($notification->via($campaigner))->toContain('database', 'mail');

    $mail = $notification->toMail($campaigner);
    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toContain('Alhamdulillah! Dana Pencairan Telah Ditransfer - Renovasi Masjid Pelosok')
        ->and($mail->actionUrl)->toBe(route('akun.programs.disbursements.index', $program->id));
});

it('renders ProgramSubmittedNotification and ProgramStatusUpdatedNotification mail correctly', function () {
    $admin = User::factory()->make(['email' => 'kurator@insani.id', 'name' => 'Tim Kurasi']);
    $campaigner = User::factory()->make(['email' => 'campaigner@insani.id', 'name' => 'Relawan Kebaikan']);
    $program = new Program([
        'title' => 'Ambulans Gratis untuk Dhuafa',
        'slug' => 'ambulans-gratis-untuk-dhuafa',
        'target_amount' => 50000000,
    ]);
    $program->id = '01923456-9999-8888-7777-666655554444';
    $program->setRelation('creator', $campaigner);

    // 1. Program Submitted
    $subNotif = new ProgramSubmittedNotification($program);
    $subMail = $subNotif->toMail($admin);
    expect($subMail->subject)->toContain('Pengajuan Program Galang Dana Baru - Ambulans Gratis untuk Dhuafa');

    // 2. Program Published
    $pubNotif = new ProgramStatusUpdatedNotification($program, 'published');
    $pubMail = $pubNotif->toMail($campaigner);
    expect($pubMail->subject)->toContain('Alhamdulillah! Program Anda Telah Diterbitkan - Ambulans Gratis untuk Dhuafa')
        ->and($pubMail->actionUrl)->toBe(route('program.show', 'ambulans-gratis-untuk-dhuafa'));
});

it('renders CampaignerRegisteredNotification and ContactMessageReceivedNotification mail correctly', function () {
    $admin = User::factory()->make(['email' => 'admin@insani.id', 'name' => 'Admin Insani']);

    // Campaigner Registered
    $user = User::factory()->make(['email' => 'calon@lembaga.org', 'name' => 'Ahmad Fulan']);
    $profile = new CampaignerProfile([
        'type' => 'lembaga',
        'nama_lembaga' => 'Lembaga Zakat Mandiri',
        'pic_phone' => '081234567890',
    ]);
    $profile->id = '01923456-aaaa-bbbb-cccc-ddddeeeeffff';
    $profile->setRelation('user', $user);

    $campNotif = new CampaignerRegisteredNotification($profile);
    $campMail = $campNotif->toMail($admin);
    expect($campMail->subject)->toContain('Pendaftaran Campaigner Baru - Lembaga Zakat Mandiri (Lembaga)')
        ->and($campMail->actionUrl)->toBe(route('admin.campaigners.show', $profile->id));

    // Contact Message
    $contact = new ContactMessage([
        'name' => 'Budi Santoso',
        'email' => 'budi@gmail.com',
        'phone' => '081122334455',
        'subject' => 'Pertanyaan Kerjasama Penyaluran Logistik',
        'message' => 'Bagaimana syarat kemitraan program logistik sembako?',
    ]);
    $contact->id = '01923456-1234-5678-90ab-cdef12345678';

    $contactNotif = new ContactMessageReceivedNotification($contact);
    $contactMail = $contactNotif->toMail($admin);
    expect($contactMail->subject)->toContain('[Insani Hubungi Kami] Pertanyaan Kerjasama Penyaluran Logistik')
        ->and($contactMail->actionUrl)->toBe(route('admin.contact-messages.show', $contact->id));
});
