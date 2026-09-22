<?php

use App\Models\Faq;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePerm = Permission::firstOrCreate(['name' => 'manage_faqs']);

    $this->adminRole->givePermissionTo($managePerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can display faqs index page for admin with manage_faqs permission', function () {
    Faq::create([
        'question' => [
            'id' => 'Bagaimana cara berdonasi?',
            'en' => 'How to donate?',
        ],
        'answer_html' => [
            'id' => '<p>Cara berdonasi sangat mudah.</p>',
            'en' => '<p>Donating is easy.</p>',
        ],
        'category' => 'donatur',
        'keywords' => 'donasi, cara',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get('/admin/faqs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Faqs/Index')
            ->has('faqs.data')
            ->where('faqs.data', function ($faqs) {
                expect(count($faqs))->toBeGreaterThan(0);
                $first = $faqs[0];
                expect($first)->toHaveKey('question_translations')
                    ->and($first['question_translations'])->toBeArray()
                    ->and($first)->toHaveKey('answer_html_translations')
                    ->and($first['answer_html_translations'])->toBeArray();

                return true;
            })
        );
});

it('can create a new faq', function () {
    actingAs($this->admin)
        ->post('/admin/faqs', [
            'question' => [
                'id' => 'Apakah yayasan memiliki izin resmi?',
                'en' => 'Does the foundation have an official permit?',
            ],
            'answer_html' => [
                'id' => '<p>Ya, yayasan berizin resmi Kemenkumham dan Kemensos.</p>',
                'en' => '<p>Yes, the foundation is officially licensed.</p>',
            ],
            'category' => 'keamanan',
            'keywords' => 'izin, legalitas',
            'is_active' => true,
            'sort_order' => 5,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $faq = Faq::where('category', 'keamanan')->first();
    expect($faq)->not->toBeNull();
    expect($faq->getTranslation('question', 'id'))->toBe('Apakah yayasan memiliki izin resmi?');
    expect($faq->getTranslation('question', 'en'))->toBe('Does the foundation have an official permit?');
    expect($faq->sort_order)->toBe(5);
});

it('can update an existing faq', function () {
    $faq = Faq::create([
        'question' => [
            'id' => 'Pertanyaan Lama',
            'en' => 'Old Question',
        ],
        'answer_html' => [
            'id' => '<p>Jawaban Lama</p>',
            'en' => '<p>Old Answer</p>',
        ],
        'category' => 'umum',
        'keywords' => 'lama',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->put("/admin/faqs/{$faq->id}", [
            'question' => [
                'id' => 'Pertanyaan Baru',
                'en' => 'New Question',
            ],
            'answer_html' => [
                'id' => '<p>Jawaban Baru</p>',
                'en' => '<p>New Answer</p>',
            ],
            'category' => 'lembaga',
            'keywords' => 'baru',
            'is_active' => false,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $faq->refresh();
    expect($faq->getTranslation('question', 'id'))->toBe('Pertanyaan Baru');
    expect($faq->getTranslation('question', 'en'))->toBe('New Question');
    expect($faq->category)->toBe('lembaga');
    expect($faq->is_active)->toBeFalse();
    expect($faq->sort_order)->toBe(2);
});

it('can delete an existing faq', function () {
    $faq = Faq::create([
        'question' => [
            'id' => 'Pertanyaan Hapus',
            'en' => 'Question to delete',
        ],
        'answer_html' => [
            'id' => '<p>Jawaban Hapus</p>',
            'en' => '<p>Answer to delete</p>',
        ],
        'category' => 'umum',
        'is_active' => true,
        'sort_order' => 99,
    ]);

    actingAs($this->admin)
        ->delete("/admin/faqs/{$faq->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Faq::find($faq->id))->toBeNull();
});

it('denies access to users without manage_faqs permission', function () {
    $regularUser = User::factory()->create();

    actingAs($regularUser)
        ->get('/admin/faqs')
        ->assertForbidden();
});
