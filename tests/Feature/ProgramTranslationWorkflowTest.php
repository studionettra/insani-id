<?php

use App\Jobs\TranslateProgramJob;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use App\Services\TranslationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $viewPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo($viewPerm);

    $this->admin = User::factory()->create(['name' => 'Admin Insani']);
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'is_active' => true,
    ]);

    $this->externalUser = User::factory()->create(['name' => 'Mitra Penggalang Dana']);

    $this->program = Program::create([
        'title' => ['id' => 'Bantuan Pangan Korban Banjir Bandang'],
        'slug' => 'bantuan-pangan-korban-banjir-bandang',
        'program_code' => 'PRG-TEST-001',
        'story' => ['id' => '<p>Warga sangat membutuhkan sembako dan obat-obatan.</p>'],
        'category_id' => $this->category->id,
        'created_by' => $this->externalUser->id,
        'campaigner_type' => 'lembaga',
        'status' => 'pending_verification',
        'cover_image' => 'programs/covers/test.jpg',
    ]);
});

it('dispatches TranslateProgramJob when admin publishes an external program', function () {
    Queue::fake([TranslateProgramJob::class]);

    actingAs($this->admin)
        ->put(route('admin.programs.update-status', $this->program->id), [
            'status' => 'published',
        ])
        ->assertRedirect();

    $this->program->refresh();
    expect($this->program->status)->toBe('published');

    Queue::assertPushed(TranslateProgramJob::class, function ($job) {
        return $job->program->id === $this->program->id;
    });
});

it('executes TranslateProgramJob to translate title and story to en and ar', function () {
    Http::fake([
        'https://translate.googleapis.com/translate_a/single*' => function ($request) {
            $q = $request['q'] ?? '';
            $tl = $request['tl'] ?? 'en';

            return Http::response([
                [["[{$tl}] {$q}", $q, null, null, 1]],
                null,
                'id',
            ], 200);
        },
    ]);

    $job = new TranslateProgramJob($this->program, true);
    $job->handle(new TranslationService);

    $this->program->refresh();

    expect($this->program->getTranslation('title', 'en', false))->toContain('[en]')
        ->and($this->program->getTranslation('title', 'ar', false))->toContain('[ar]')
        ->and($this->program->getTranslation('story', 'en', false))->toContain('[en]')
        ->and($this->program->getTranslation('story', 'ar', false))->toContain('[ar]');
});

it('allows admin to trigger manual translation via translate route', function () {
    Queue::fake([TranslateProgramJob::class]);

    actingAs($this->admin)
        ->post(route('admin.programs.translate', $this->program->id))
        ->assertRedirect()
        ->assertSessionHas('success');

    Queue::assertPushed(TranslateProgramJob::class, function ($job) {
        return $job->program->id === $this->program->id && $job->force === true;
    });
});

it('blocks unauthorized users from triggering manual translation', function () {
    $regularUser = User::factory()->create();

    actingAs($regularUser)
        ->post(route('admin.programs.translate', $this->program->id))
        ->assertForbidden();
});

it('passes translation dictionaries to admin show view', function () {
    actingAs($this->admin)
        ->get(route('admin.programs.show', $this->program->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Programs/Show')
            ->has('program.title_translations')
            ->has('program.story_translations')
        );
});
