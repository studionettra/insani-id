<?php

use App\Models\User;
use App\Models\Program;
use App\Models\CampaignerProfile;
use App\Models\Comment;
use App\Models\ProgramUpdate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    // Seed roles and permissions
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    $permissions = [
        'program.create', 'program.update-own', 'update-post.create',
        'comment.view', 'comment.moderate'
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $campaignerRole = Role::firstOrCreate(['name' => 'Campaigner Individu']);
    $campaignerRole->syncPermissions(['program.create', 'program.update-own', 'update-post.create']);

    $csRole = Role::firstOrCreate(['name' => 'Customer Service']);
    $csRole->syncPermissions(['comment.view', 'comment.moderate']);

    $this->campaigner = User::factory()->create(['email_verified_at' => now()]);
    $this->campaigner->assignRole('Campaigner Individu');

    $this->profile = CampaignerProfile::create([
        'user_id' => $this->campaigner->id,
        'type' => 'individu',
        'nik' => '1234567890123456',
        'address' => 'Test Address',
        'phone_number' => '081234567890',
        'bank_name' => 'BCA',
        'bank_account_name' => 'Test User',
        'bank_account_number' => '1234567890',
        'verification_status' => 'verified',
    ]);

    $this->cs = User::factory()->create();
    $this->cs->assignRole('Customer Service');

    $this->category = \App\Models\Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
    ]);

    $this->program = Program::create([
        'title' => 'Test Program',
        'slug' => 'test-program',
        'program_code' => 'PRG-TEST',
        'story' => 'Test Story',
        'created_by' => $this->campaigner->id,
        'campaigner_profile_id' => $this->profile->id,
        'campaigner_type' => 'App\\Models\\CampaignerProfile',
        'category_id' => $this->category->id,
        'status' => 'published',
        'cover_image' => 'cover.jpg'
    ]);
});

it('allows campaigner to create program update', function () {
    $response = $this->actingAs($this->campaigner)
        ->post(route('akun.programs.updates.store', $this->program->id), [
            'title' => 'Update 1',
            'content' => 'Content 1',
            'is_published' => true,
        ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('program_updates', [
        'program_id' => $this->program->id,
        'title' => 'Update 1',
        'is_published' => true,
    ]);
});

it('allows guest to submit a comment', function () {
    $response = $this->post(route('programs.comments.store', $this->program->id), [
        'name' => 'Guest User',
        'body' => 'Great program!',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('comments', [
        'program_id' => $this->program->id,
        'name' => 'Guest User',
        'body' => 'Great program!',
        'is_hidden' => false,
    ]);
});

it('allows cs to hide a comment', function () {
    $comment = Comment::create([
        'program_id' => $this->program->id,
        'name' => 'Guest User',
        'body' => 'Great program!',
        'is_hidden' => false,
    ]);

    $response = $this->actingAs($this->cs)
        ->put(route('admin.comments.toggle-hidden', $comment->id));

    $response->assertSessionHasNoErrors();
    
    $comment->refresh();
    expect($comment->is_hidden)->toBeTrue();
});
