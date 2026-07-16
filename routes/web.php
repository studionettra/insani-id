<?php

use App\Http\Controllers\Admin\CampaignerVerificationController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Public\CampaignerProgramController;
use App\Http\Controllers\Public\CampaignerRegistrationController;
use App\Http\Controllers\Public\ProgramListingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\Public\HomeController::class, 'index'])->name('home');

// Public Program Listing
Route::get('/program', [ProgramListingController::class, 'index'])->name('program.index');
Route::get('/program/{program:slug}/donasi', [\App\Http\Controllers\Public\DonationController::class, 'create'])->name('donation.create');
Route::post('/program/{program:slug}/donasi', [\App\Http\Controllers\Public\DonationController::class, 'store'])->name('donation.store');
Route::get('/donasi/status/{donationCode}', [\App\Http\Controllers\Public\DonationController::class, 'status'])->name('donation.status');
Route::get('/program/{slug}', [ProgramListingController::class, 'show'])->name('program.show');

// Public Pages
Route::get('/tentang-kami', [\App\Http\Controllers\Public\AboutController::class, 'index'])->name('about.index');
Route::get('/fokus-program', [\App\Http\Controllers\Public\FocusProgramController::class, 'index'])->name('focus.index');
Route::get('/berita', [\App\Http\Controllers\Public\BlogController::class, 'index'])->name('blog.index');
Route::get('/berita/{slug}', [\App\Http\Controllers\Public\BlogController::class, 'show'])->name('blog.show');
Route::get('/kontak', [\App\Http\Controllers\Public\ContactController::class, 'create'])->name('contact.create');
Route::post('/kontak', [\App\Http\Controllers\Public\ContactController::class, 'store'])->name('contact.store');

// Webhooks
Route::post('/webhooks/xendit', [\App\Http\Controllers\Webhook\XenditWebhookController::class, 'handle'])
    ->middleware('verify.xendit-callback-token')
    ->name('webhooks.xendit');
Route::post('/webhooks/wordpress', [\App\Http\Controllers\Webhook\WordPressWebhookController::class, 'handle'])
    ->middleware('verify.wordpress-webhook-token')
    ->name('webhooks.wordpress');

Route::middleware(['auth', 'verified', 'no-cache'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Campaigner Registration
    Route::get('/campaigner/register', [CampaignerRegistrationController::class, 'create'])->name('campaigner.register');
    Route::post('/campaigner/register', [CampaignerRegistrationController::class, 'store'])->name('campaigner.register.store');
    Route::get('/campaigner/status', [CampaignerRegistrationController::class, 'status'])->name('campaigner.status');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
        Route::patch('categories/{category}/pillar', [CategoryController::class, 'updatePillar'])->name('categories.update-pillar');
        
        Route::middleware('permission:manage_pages')->group(function () {
            Route::resource('pages', \App\Http\Controllers\Admin\PageController::class)->except(['show']);
        });

        Route::middleware('permission:manage_faqs')->group(function () {
            Route::resource('faqs', \App\Http\Controllers\Admin\FaqController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_pages')->group(function () {
            Route::resource('pages', \App\Http\Controllers\Admin\PageController::class)->except(['show']);
        });

        Route::middleware('permission:manage_management')->group(function () {
            Route::resource('management-members', \App\Http\Controllers\Admin\ManagementMemberController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_partners')->group(function () {
            Route::resource('partners', \App\Http\Controllers\Admin\PartnerController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_impact_stats')->group(function () {
            Route::resource('impact-stats', \App\Http\Controllers\Admin\ImpactStatController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_banners')->group(function () {
            Route::resource('homepage-banners', \App\Http\Controllers\Admin\HomepageBannerController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_contact_messages')->group(function () {
            Route::resource('contact-messages', \App\Http\Controllers\Admin\ContactMessageController::class)->only(['index', 'show', 'destroy']);
        });

        // Donations
        Route::get('/donations', [\App\Http\Controllers\Admin\DonationController::class, 'index'])->name('donations.index');
        Route::post('/donations/{donation}/confirm', [\App\Http\Controllers\Admin\DonationController::class, 'confirm'])->name('donations.confirm');

        Route::middleware('permission:campaigner.verify')->group(function () {
            Route::get('/campaigners', [CampaignerVerificationController::class, 'index'])->name('campaigners.index');
            Route::get('/campaigners/{id}', [CampaignerVerificationController::class, 'show'])->name('campaigners.show');
            Route::put('/campaigners/{id}/status', [CampaignerVerificationController::class, 'updateStatus'])->name('campaigners.update-status');
        });

        Route::middleware('permission:program.view')->group(function () {
            Route::resource('programs', ProgramController::class);
            Route::put('/programs/{id}/status', [ProgramController::class, 'updateStatus'])->name('programs.update-status');
        });
        
        Route::middleware('permission:disbursement.view')->group(function () {
            Route::resource('disbursements', \App\Http\Controllers\Admin\DisbursementController::class)->only(['index', 'show']);
            Route::put('disbursements/{disbursement}/status', [\App\Http\Controllers\Admin\DisbursementController::class, 'updateStatus'])->name('admin.disbursements.update-status');
        });

        Route::middleware('permission:comment.moderate')->group(function () {
            Route::get('comments', [\App\Http\Controllers\Admin\CommentModerationController::class, 'index'])->name('comments.index');
            Route::put('comments/{comment}/toggle-hidden', [\App\Http\Controllers\Admin\CommentModerationController::class, 'toggleHidden'])->name('comments.toggle-hidden');
        });

        Route::middleware('permission:report.view')->group(function () {
            Route::get('reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
            Route::get('reports/donations/export', [\App\Http\Controllers\Admin\ReportController::class, 'exportDonations'])->name('reports.donations.export');
            Route::get('reports/disbursements/export', [\App\Http\Controllers\Admin\ReportController::class, 'exportDisbursements'])->name('reports.disbursements.export');
        });
    });

    Route::middleware('auth')->prefix('akun')->name('akun.')->group(function () {
        // Campaigner routes (Must be verified)
        Route::middleware('campaigner.verified')->group(function () {
            Route::resource('programs', CampaignerProgramController::class);
            Route::resource('programs.disbursements', \App\Http\Controllers\Public\CampaignerDisbursementController::class)->only(['index', 'create', 'store']);
            Route::resource('programs.updates', \App\Http\Controllers\Public\CampaignerProgramUpdateController::class)->except(['show']);
        });
    });
});

Route::post('/programs/{program}/comments', [\App\Http\Controllers\Public\CommentController::class, 'store'])->name('programs.comments.store');

require __DIR__.'/settings.php';
