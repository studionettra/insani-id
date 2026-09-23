<?php

use App\Models\PopupMessage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $popupPerm = Permission::firstOrCreate(['name' => 'manage_popups']);

    $this->adminRole->givePermissionTo($popupPerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->regularUser = User::factory()->create();
});

it('allows admin with manage_popups permission to view popup messages index', function () {
    PopupMessage::create([
        'title' => 'Event Qurban 1447H',
        'display_type' => 'image_only',
        'cta_text' => 'Lihat Detail',
        'cta_url' => '/program/qurban-berkah',
        'delay_seconds' => 3,
        'auto_close_seconds' => 15,
        'frequency' => 'once_per_day',
        'target_page' => 'home_only',
        'is_active' => true,
    ]);

    actingAs($this->admin)
        ->get(route('admin.popup-messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/PopupMessages/Index')
            ->has('popups.data', 1)
        );
});

it('allows admin to create an image_only popup message with flyer image upload', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('poster-event.jpg', 800, 1000);

    actingAs($this->admin)
        ->post(route('admin.popup-messages.store'), [
            'title' => 'Gebyar Peduli Sesama',
            'display_type' => 'image_only',
            'image_path' => $file,
            'cta_text' => 'Ikuti Event',
            'cta_url' => 'https://insani.id/program/gebyar-peduli',
            'open_in_new_tab' => true,
            'delay_seconds' => 2,
            'auto_close_seconds' => 20,
            'frequency' => 'once_per_day',
            'target_page' => 'home_only',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $popup = PopupMessage::where('title', 'Gebyar Peduli Sesama')->first();
    expect($popup)->not->toBeNull();
    expect($popup->display_type)->toBe('image_only');
    expect($popup->delay_seconds)->toBe(2);
    expect($popup->auto_close_seconds)->toBe(20);
    expect($popup->open_in_new_tab)->toBeTrue();
    expect($popup->image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($popup->image_path);
});

it('allows admin to create a hybrid popup message with title, content, and CTA', function () {
    actingAs($this->admin)
        ->post(route('admin.popup-messages.store'), [
            'title' => 'Kajian Rutin & Santunan Akbar',
            'display_type' => 'hybrid',
            'content' => 'Mari hadiri kajian bersama ustadz dan santunan anak yatim akhir pekan ini.',
            'cta_text' => 'Daftar Sekarang',
            'cta_url' => '/berita/kajian-rutin-santunan',
            'delay_seconds' => 1,
            'auto_close_seconds' => 0,
            'frequency' => 'once_per_session',
            'target_page' => 'all',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $popup = PopupMessage::where('title', 'Kajian Rutin & Santunan Akbar')->first();
    expect($popup)->not->toBeNull();
    expect($popup->display_type)->toBe('hybrid');
    expect($popup->content)->toContain('Mari hadiri kajian');
    expect($popup->frequency)->toBe('once_per_session');
    expect($popup->target_page)->toBe('all');
});

it('allows admin to update a popup message and change timer settings', function () {
    $popup = PopupMessage::create([
        'title' => 'Judul Lama',
        'display_type' => 'image_only',
        'delay_seconds' => 2,
        'auto_close_seconds' => 0,
        'frequency' => 'once_per_day',
        'target_page' => 'home_only',
        'is_active' => true,
    ]);

    actingAs($this->admin)
        ->put(route('admin.popup-messages.update', $popup), [
            'title' => 'Judul Baru Diperbarui',
            'display_type' => 'image_only',
            'delay_seconds' => 5,
            'auto_close_seconds' => 30,
            'frequency' => 'always',
            'target_page' => 'all',
            'cta_text' => 'Cek Info',
            'cta_url' => '/program/update',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $popup->refresh();
    expect($popup->title)->toBe('Judul Baru Diperbarui');
    expect($popup->delay_seconds)->toBe(5);
    expect($popup->auto_close_seconds)->toBe(30);
    expect($popup->frequency)->toBe('always');
    expect($popup->target_page)->toBe('all');
});

it('allows admin to toggle popup message active status', function () {
    $popup = PopupMessage::create([
        'title' => 'Toggle Me',
        'display_type' => 'image_only',
        'delay_seconds' => 2,
        'frequency' => 'once_per_day',
        'target_page' => 'home_only',
        'is_active' => true,
    ]);

    actingAs($this->admin)
        ->patch(route('admin.popup-messages.toggle-active', $popup))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($popup->fresh()->is_active)->toBeFalse();

    actingAs($this->admin)
        ->patch(route('admin.popup-messages.toggle-active', $popup))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($popup->fresh()->is_active)->toBeTrue();
});

it('allows admin to delete a popup message and purges its stored image', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->image('flyer-delete.jpg');
    $path = $file->store('popups', 'public');

    $popup = PopupMessage::create([
        'title' => 'Hapus Saya Segera',
        'display_type' => 'image_only',
        'image_path' => $path,
        'delay_seconds' => 2,
        'frequency' => 'once_per_day',
        'target_page' => 'home_only',
        'is_active' => true,
    ]);

    Storage::disk('public')->assertExists($path);

    actingAs($this->admin)
        ->delete(route('admin.popup-messages.destroy', $popup))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(PopupMessage::where('id', $popup->id)->exists())->toBeFalse();
    Storage::disk('public')->assertMissing($path);
});

it('denies regular user without permission from managing popup messages', function () {
    actingAs($this->regularUser)
        ->get(route('admin.popup-messages.index'))
        ->assertForbidden();

    actingAs($this->regularUser)
        ->post(route('admin.popup-messages.store'), [
            'title' => 'Unauthorized Popup',
            'display_type' => 'image_only',
        ])
        ->assertForbidden();
});

it('correctly filters active popups with schedule dates', function () {
    // 1. Expired popup
    PopupMessage::create([
        'title' => 'Expired Popup',
        'display_type' => 'image_only',
        'start_at' => now()->subDays(5),
        'end_at' => now()->subDay(),
        'is_active' => true,
    ]);

    // 2. Future popup
    PopupMessage::create([
        'title' => 'Future Popup',
        'display_type' => 'image_only',
        'start_at' => now()->addDay(),
        'end_at' => now()->addDays(5),
        'is_active' => true,
    ]);

    // 3. Inactive popup
    PopupMessage::create([
        'title' => 'Inactive Popup',
        'display_type' => 'image_only',
        'is_active' => false,
    ]);

    // 4. Live popup
    $livePopup = PopupMessage::create([
        'title' => 'Currently Live Popup',
        'display_type' => 'image_only',
        'start_at' => now()->subDay(),
        'end_at' => now()->addDays(2),
        'is_active' => true,
    ]);

    $activePopups = PopupMessage::query()->active()->get();
    expect($activePopups)->toHaveCount(1);
    expect($activePopups->first()->id)->toBe($livePopup->id);
    expect($livePopup->is_live)->toBeTrue();
});
