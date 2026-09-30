<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
use App\Notifications\ProgramUpdateReviewedNotification;
use Illuminate\Support\Facades\Notification;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $viewProgramPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo($viewProgramPerm);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->otherUser = User::factory()->create();

    $this->category = Category::create([
        'name' => ['id' => 'Kategori Kebaikan'],
        'slug' => 'kategori-kebaikan',
    ]);

    // Program created by Superadmin
    $this->adminProgram = Program::create([
        'title' => ['id' => 'Program Internal Superadmin'],
        'slug' => 'program-internal-superadmin',
        'program_code' => 'PRG-ADM-01',
        'story' => ['id' => 'Cerita program admin'],
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    // Program created by other campaigner (external)
    $this->externalProgram = Program::create([
        'title' => ['id' => 'Program Milik Campaigner Luar'],
        'slug' => 'program-milik-campaigner-luar',
        'program_code' => 'PRG-EXT-01',
        'story' => ['id' => 'Cerita program eksternal'],
        'category_id' => $this->category->id,
        'created_by' => $this->otherUser->id,
        'campaigner_type' => 'individual',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);
});

it('allows superadmin to view updates on a program they created', function () {
    actingAs($this->admin)
        ->get(route('admin.programs.updates.index', $this->adminProgram->id))
        ->assertSuccessful();
});

it('allows superadmin to create an update on a program they created', function () {
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->adminProgram->id), [
            'title' => 'Penyaluran Tahap 1 Sukses',
            'content' => '<p>Alhamdulillah dana telah disalurkan kepada penerima manfaat.</p>',
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'program_id' => $this->adminProgram->id,
        'title->id' => 'Penyaluran Tahap 1 Sukses',
        'created_by' => $this->admin->id,
        'is_published' => true,
    ]);
});

it('allows superadmin to store multilingual updates with ID, EN, and AR', function () {
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->adminProgram->id), [
            'title' => [
                'id' => 'Penyaluran Bantuan Sembako',
                'en' => 'Distribution of Food Aid',
                'ar' => 'توزيع المساعدات الغذائية',
            ],
            'content' => [
                'id' => '<p>Bantuan disalurkan di lokasi A.</p>',
                'en' => '<p>Aid was distributed at location A.</p>',
                'ar' => '<p>تم توزيع المساعدات في الموقع أ.</p>',
            ],
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'program_id' => $this->adminProgram->id,
        'title->id' => 'Penyaluran Bantuan Sembako',
        'title->en' => 'Distribution of Food Aid',
        'title->ar' => 'توزيع المساعدات الغذائية',
        'created_by' => $this->admin->id,
    ]);
});

it('allows superadmin to edit and delete a draft update on a program they created', function () {
    $update = ProgramUpdate::create([
        'program_id' => $this->adminProgram->id,
        'title' => 'Judul Awal',
        'content' => '<p>Konten awal</p>',
        'is_published' => false,
        'moderation_status' => 'pending',
        'created_by' => $this->admin->id,
    ]);

    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->adminProgram->id, $update->id]), [
            'title' => 'Judul Diperbarui',
            'content' => '<p>Konten diperbarui</p>',
            'is_published' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'id' => $update->id,
        'title->id' => 'Judul Diperbarui',
        'is_published' => false,
    ]);

    actingAs($this->admin)
        ->delete(route('admin.programs.updates.destroy', [$this->adminProgram->id, $update->id]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('program_updates', [
        'id' => $update->id,
    ]);
});

it('strictly forbids editing or deleting published or approved updates to maintain integrity', function () {
    $publishedUpdate = ProgramUpdate::create([
        'program_id' => $this->adminProgram->id,
        'title' => 'Laporan Penyaluran Sah',
        'content' => '<p>Dana telah disalurkan.</p>',
        'is_published' => true,
        'moderation_status' => 'approved',
        'created_by' => $this->admin->id,
    ]);

    // Editing published update is strictly forbidden
    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->adminProgram->id, $publishedUpdate->id]), [
            'title' => 'Coba Manipulasi Judul',
            'content' => '<p>Perubahan manipulatif</p>',
            'is_published' => true,
        ])
        ->assertForbidden();

    // Deleting published update is strictly forbidden
    actingAs($this->admin)
        ->delete(route('admin.programs.updates.destroy', [$this->adminProgram->id, $publishedUpdate->id]))
        ->assertForbidden();

    // Verify record remains untouched and not soft deleted
    $this->assertDatabaseHas('program_updates', [
        'id' => $publishedUpdate->id,
        'deleted_at' => null,
    ]);
});

it('allows superadmin to view external program updates and moderate them with reason', function () {
    $pendingUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => 'Laporan dari Campaigner Eksternal',
        'content' => '<p>Foto dan kwitansi penyaluran.</p>',
        'is_published' => false,
        'moderation_status' => 'pending',
        'created_by' => $this->otherUser->id,
    ]);

    Notification::fake();

    // Superadmin can view external program updates index for moderation
    actingAs($this->admin)
        ->get(route('admin.programs.updates.index', $this->externalProgram->id))
        ->assertSuccessful();

    // Rejecting without reason fails validation
    actingAs($this->admin)
        ->put(route('admin.programs.updates.moderation', [$this->externalProgram->id, $pendingUpdate->id]), [
            'moderation_status' => 'rejected',
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');

    // Rejecting with reason succeeds
    actingAs($this->admin)
        ->put(route('admin.programs.updates.moderation', [$this->externalProgram->id, $pendingUpdate->id]), [
            'moderation_status' => 'rejected',
            'rejection_reason' => 'Bukti kwitansi tidak terbaca jelas.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($pendingUpdate->fresh()->moderation_status)->toBe('rejected')
        ->and($pendingUpdate->fresh()->rejection_reason)->toBe('Bukti kwitansi tidak terbaca jelas.')
        ->and($pendingUpdate->fresh()->is_published)->toBeFalse();

    Notification::assertSentTo($this->otherUser, ProgramUpdateReviewedNotification::class, function ($n) {
        return $n->update->moderation_status === 'rejected'
            && $n->update->rejection_reason === 'Bukti kwitansi tidak terbaca jelas.';
    });

    // Approving succeeds and publishes the update
    actingAs($this->admin)
        ->put(route('admin.programs.updates.moderation', [$this->externalProgram->id, $pendingUpdate->id]), [
            'moderation_status' => 'approved',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($pendingUpdate->fresh()->moderation_status)->toBe('approved')
        ->and($pendingUpdate->fresh()->is_published)->toBeTrue();

    Notification::assertSentTo($this->otherUser, ProgramUpdateReviewedNotification::class, function ($n) {
        return $n->update->moderation_status === 'approved'
            && $n->update->is_published === true;
    });
});

it('strictly forbids unauthorized users from viewing or editing updates, and forbids superadmin from storing or deleting on other programs', function () {
    $randomUser = User::factory()->create();

    // Non-admin cannot view updates of other program
    actingAs($randomUser)
        ->get(route('admin.programs.updates.index', $this->externalProgram->id))
        ->assertForbidden();

    // Superadmin cannot store update on other campaigner's program (only campaigner can report)
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->externalProgram->id), [
            'title' => 'Update Ilegal',
            'content' => '<p>Mencoba update program orang lain</p>',
            'is_published' => true,
        ])
        ->assertForbidden();

    // Create an update on other campaigner's program
    $otherUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => 'Kabar Asli Campaigner',
        'content' => '<p>Laporan asli</p>',
        'is_published' => false,
        'moderation_status' => 'pending',
        'created_by' => $this->otherUser->id,
    ]);

    // Random non-admin user cannot edit other campaigner's update
    actingAs($randomUser)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $otherUpdate->id]), [
            'title' => 'Percobaan Bajak Judul',
            'content' => '<p>Konten dibajak</p>',
            'is_published' => false,
        ])
        ->assertForbidden();

    // Superadmin cannot delete other campaigner's update
    actingAs($this->admin)
        ->delete(route('admin.programs.updates.destroy', [$this->externalProgram->id, $otherUpdate->id]))
        ->assertForbidden();

    // Verify database remains untouched
    $this->assertDatabaseHas('program_updates', [
        'id' => $otherUpdate->id,
        'title->id' => 'Kabar Asli Campaigner',
    ]);
});

it('allows superadmin to curate and translate pending updates on external programs', function () {
    $pendingUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => ['id' => 'Kabar Lapangan Campaigner'],
        'content' => ['id' => '<p>Penyaluran sembako terlaksana.</p>'],
        'is_published' => false,
        'moderation_status' => 'pending',
        'created_by' => $this->otherUser->id,
    ]);

    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $pendingUpdate->id]), [
            'title' => [
                'id' => 'Kabar Lapangan Campaigner (Ditinjau)',
                'en' => 'Campaigner Field Report (Reviewed)',
                'ar' => 'تقرير الميدان للحملة (تمت المراجعة)',
            ],
            'content' => [
                'id' => '<p>Penyaluran sembako terlaksana dengan rapi.</p>',
                'en' => '<p>Food package distribution completed smoothly.</p>',
                'ar' => '<p>اكتمل توزيع الطرود الغذائية بسلاسة.</p>',
            ],
            'is_published' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'id' => $pendingUpdate->id,
        'title->id' => 'Kabar Lapangan Campaigner (Ditinjau)',
        'title->en' => 'Campaigner Field Report (Reviewed)',
        'title->ar' => 'تقرير الميدان للحملة (تمت المراجعة)',
        'content->en' => '<p>Food package distribution completed smoothly.</p>',
    ]);
});

it('allows superadmin to translate approved updates without mutating the original Indonesian text', function () {
    $approvedUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => ['id' => 'Laporan Akhir Terverifikasi'],
        'content' => ['id' => '<p>Penyaluran dana 100% tuntas dan sah.</p>'],
        'is_published' => true,
        'moderation_status' => 'approved',
        'created_by' => $this->otherUser->id,
    ]);

    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $approvedUpdate->id]), [
            'title' => [
                'id' => 'Laporan Akhir Terverifikasi',
                'en' => 'Verified Final Report',
                'ar' => 'التقرير النهائي المعتمد',
            ],
            'content' => [
                'id' => '<p>Penyaluran dana 100% tuntas dan sah.</p>',
                'en' => '<p>100% fund disbursement completed and validated.</p>',
                'ar' => '<p>تم صرف 100% من الأموال والتحقق منها بنجاح.</p>',
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'id' => $approvedUpdate->id,
        'title->id' => 'Laporan Akhir Terverifikasi',
        'title->en' => 'Verified Final Report',
        'title->ar' => 'التقرير النهائي المعتمد',
        'content->id' => '<p>Penyaluran dana 100% tuntas dan sah.</p>',
        'content->en' => '<p>100% fund disbursement completed and validated.</p>',
        'is_published' => true,
    ]);
});

it('strictly forbids altering Indonesian content on approved updates to maintain financial integrity', function () {
    $approvedUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => ['id' => 'Kwitansi Penyaluran Resmi'],
        'content' => ['id' => '<p>Total Rp 50.000.000 telah diserahkan.</p>'],
        'is_published' => true,
        'moderation_status' => 'approved',
        'created_by' => $this->otherUser->id,
    ]);

    // Attempting to mutate Indonesian title on approved update must be blocked with 403
    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $approvedUpdate->id]), [
            'title' => [
                'id' => 'Manipulasi Nilai Kwitansi',
                'en' => 'Official Receipt',
            ],
            'content' => [
                'id' => '<p>Total Rp 50.000.000 telah diserahkan.</p>',
            ],
        ])
        ->assertForbidden();

    // Attempting to mutate Indonesian content on approved update must also be blocked with 403
    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $approvedUpdate->id]), [
            'title' => [
                'id' => 'Kwitansi Penyaluran Resmi',
            ],
            'content' => [
                'id' => '<p>Manipulasi: Dana dialihkan ke kegiatan lain.</p>',
            ],
        ])
        ->assertForbidden();

    // Verify database remains untouched
    $this->assertDatabaseHas('program_updates', [
        'id' => $approvedUpdate->id,
        'title->id' => 'Kwitansi Penyaluran Resmi',
        'content->id' => '<p>Total Rp 50.000.000 telah diserahkan.</p>',
    ]);
});

it('records activity logs when a program update is created or modified', function () {
    $update = ProgramUpdate::create([
        'program_id' => $this->adminProgram->id,
        'title' => 'Kabar Penyaluran Logged',
        'content' => '<p>Konten laporan audit.</p>',
        'is_published' => false,
        'moderation_status' => 'pending',
        'created_by' => $this->admin->id,
    ]);

    $activity = Activity::where('subject_type', ProgramUpdate::class)
        ->where('subject_id', $update->id)
        ->latest()
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->event)->toBe('created');
});
