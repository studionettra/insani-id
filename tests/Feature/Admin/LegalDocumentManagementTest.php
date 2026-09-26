<?php

use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePerm = Permission::firstOrCreate(['name' => 'manage_legal_documents']);

    $this->adminRole->givePermissionTo($managePerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can display legal documents index page for admin', function () {
    actingAs($this->admin)
        ->get('/admin/legal-documents')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/LegalDocuments/Index')
            ->has('documents.data')
        );
});

it('can create a legal document with an uploaded pdf file', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('izin_pub_kemensos.pdf', 1024, 'application/pdf');

    actingAs($this->admin)
        ->post('/admin/legal-documents', [
            'title' => [
                'id' => 'Izin PUB Kemensos',
                'en' => 'PUB Permit Ministry of Social Affairs',
            ],
            'document_number' => '123/HUK-PS/2024',
            'issuer_name' => 'Kementerian Sosial RI',
            'icon_type' => 'shield',
            'file' => $file,
            'is_active' => true,
            'sort_order' => 10,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $doc = LegalDocument::where('document_number', '123/HUK-PS/2024')->first();
    expect($doc)->not->toBeNull();
    expect($doc->getTranslation('title', 'id'))->toBe('Izin PUB Kemensos');
    expect($doc->file_path)->not->toBeNull();

    Storage::disk('public')->assertExists($doc->file_path);
});

it('can update legal document and clean up old file when replaced', function () {
    Storage::fake('public');

    $oldFile = UploadedFile::fake()->create('old_doc.pdf', 500, 'application/pdf');
    $oldPath = $oldFile->store('legal-documents', 'public');

    $doc = LegalDocument::create([
        'title' => [
            'id' => 'Dokumen Lama',
        ],
        'file_path' => $oldPath,
        'document_number' => 'SK-001',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    Storage::disk('public')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->create('new_doc.pdf', 800, 'application/pdf');

    actingAs($this->admin)
        ->put("/admin/legal-documents/{$doc->id}", [
            'title' => [
                'id' => 'Dokumen Baru',
            ],
            'document_number' => 'SK-001-REV',
            'issuer_name' => 'Kemenkumham RI',
            'file' => $newFile,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $doc->refresh();
    expect($doc->getTranslation('title', 'id'))->toBe('Dokumen Baru');
    expect($doc->document_number)->toBe('SK-001-REV');

    // Old file must be deleted, new file must exist
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($doc->file_path);
});

it('can delete legal document along with its storage file', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('to_delete.pdf', 300, 'application/pdf');
    $filePath = $file->store('legal-documents', 'public');

    $doc = LegalDocument::create([
        'title' => ['id' => 'Dokumen Dihapus'],
        'file_path' => $filePath,
        'is_active' => true,
        'sort_order' => 99,
    ]);

    Storage::disk('public')->assertExists($filePath);

    actingAs($this->admin)
        ->delete("/admin/legal-documents/{$doc->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(LegalDocument::find($doc->id))->toBeNull();
    Storage::disk('public')->assertMissing($filePath);
});

it('public about page provides dynamic legal documents', function () {
    $response = get('/tentang-kami');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/About/Index')
        ->has('legalDocuments')
    );
});

it('can create and search multilingual legal documents with ID, EN, and AR', function () {
    actingAs($this->admin)
        ->post('/admin/legal-documents', [
            'title' => [
                'id' => 'Akta Pendirian Yayasan',
                'en' => 'Deed of Foundation Establishment',
                'ar' => 'عقد تأسيس المؤسسة',
            ],
            'document_number' => 'AHU-00123-2024',
            'issuer_name' => 'Kemenkumham RI',
            'icon_type' => 'scale',
            'description' => [
                'id' => 'Disahkan oleh Notaris Jakarta.',
                'en' => 'Ratified by Notary Jakarta.',
                'ar' => 'مصدق من قبل كاتب العدل في جاكرتا.',
            ],
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $doc = LegalDocument::where('document_number', 'AHU-00123-2024')->first();
    expect($doc)->not->toBeNull();
    expect($doc->getTranslation('title', 'ar'))->toBe('عقد تأسيس المؤسسة');
    expect($doc->getTranslation('description', 'ar'))->toBe('مصدق من قبل كاتب العدل في جاكرتا.');

    // Test search by Arabic title
    actingAs($this->admin)
        ->get('/admin/legal-documents?search=تأسيس')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('documents.data', 1)
        );
});
