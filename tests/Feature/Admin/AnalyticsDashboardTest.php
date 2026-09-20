<?php

use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $reportPerm = Permission::firstOrCreate(['name' => 'report.view']);
    $this->adminRole->givePermissionTo([$reportPerm]);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'title' => 'Bantu Korban Bencana Alam',
        'slug' => 'bantu-korban-bencana-alam',
        'target_amount' => 50000000,
        'views_count' => 0,
    ]);
});

it('increments program views_count once per session upon visit', function () {
    expect($this->program->views_count)->toBe(0);

    // First visit in session
    $response = $this->get('/program/'.$this->program->slug);
    $response->assertOk();

    expect($this->program->fresh()->views_count)->toBe(1);
    expect(session()->has('viewed_program_'.$this->program->id))->toBeTrue();

    // Repeated visit in the same session should NOT increment views again
    $this->get('/program/'.$this->program->slug);
    expect($this->program->fresh()->views_count)->toBe(1);
});

it('increments blog views_count once per session upon visit', function () {
    $blog = BlogPostCache::create([
        'author_id' => $this->admin->id,
        'title' => 'Penyaluran Bantuan Sembako Berjalan Lancar',
        'slug' => 'penyaluran-bantuan-sembako',
        'excerpt' => 'Laporan penyaluran bantuan.',
        'content_html' => '<p>Konten berita lengkap.</p>',
        'status' => 'published',
        'published_at' => now()->subDay(),
        'views_count' => 0,
    ]);

    expect($blog->views_count)->toBe(0);

    // First visit in session
    $response = $this->get('/berita/'.$blog->slug);
    $response->assertOk();

    expect($blog->fresh()->views_count)->toBe(1);
    expect(session()->has('viewed_blog_'.$blog->id))->toBeTrue();

    // Second visit in same session
    $this->get('/berita/'.$blog->slug);
    expect($blog->fresh()->views_count)->toBe(1);
});

it('provides analyticsData on dashboard for staff and administrators', function () {
    // Create some paid donations with UTM parameters
    Donation::factory()->paid()->create([
        'program_id' => $this->program->id,
        'amount' => 150000,
        'utm_source' => 'whatsapp',
        'utm_medium' => 'social_share',
        'utm_campaign' => 'sedekah_subuh',
    ]);

    Donation::factory()->paid()->create([
        'program_id' => $this->program->id,
        'amount' => 250000,
        'utm_source' => 'instagram',
        'utm_medium' => 'social_bio',
        'utm_campaign' => 'sedekah_subuh',
    ]);

    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('analyticsData')
            ->has('analyticsData.donationTrends')
            ->has('analyticsData.utmSources')
            ->has('analyticsData.funnel')
            ->has('analyticsData.topPrograms')
            ->where('analyticsData.funnel.totalPaid', 2)
        );
});

it('provides channelAttributions data on admin reports page', function () {
    Donation::factory()->paid()->create([
        'program_id' => $this->program->id,
        'amount' => 500000,
        'utm_source' => 'facebook',
        'utm_medium' => 'cpc',
        'utm_campaign' => 'bencana_alam',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reports/Index')
            ->has('channelAttributions')
            ->where('channelAttributions.0.source', 'facebook')
            ->where('channelAttributions.0.campaign', 'bencana_alam')
        );
});

it('displays views_count in admin programs listing', function () {
    $programPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo([$programPerm]);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->program->update(['views_count' => 125]);

    $this->actingAs($this->admin)
        ->get(route('admin.programs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Programs/Index')
            ->has('programs.data')
            ->where('programs.data.0.views_count', 125)
        );
});
