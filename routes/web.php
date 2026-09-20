<?php

use App\Http\Controllers\Admin\CampaignerVerificationController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentModerationController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\DisbursementController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\HomepageBannerController;
use App\Http\Controllers\Admin\ImpactStatController;
use App\Http\Controllers\Admin\ManagementMemberController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\BlogController;
use App\Http\Controllers\Public\CampaignerDisbursementController;
use App\Http\Controllers\Public\CampaignerProgramController;
use App\Http\Controllers\Public\CampaignerProgramUpdateController;
use App\Http\Controllers\Public\CampaignerRegistrationController;
use App\Http\Controllers\Public\CommentController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\DonationController;
use App\Http\Controllers\Public\DonorDonationController;
use App\Http\Controllers\Public\FocusProgramController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PageController as PublicPageController;
use App\Http\Controllers\Public\ProgramListingController;
use App\Http\Controllers\Webhook\WordPressWebhookController;
use App\Http\Controllers\Webhook\XenditWebhookController;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

// Public Localized Routes
Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath'],
], function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Public Program Listing & Detail
    Route::get('/program', [ProgramListingController::class, 'index'])->name('program.index');
    Route::get('/program/{program:slug}/donasi', [DonationController::class, 'create'])->name('donation.create');
    Route::post('/program/{program:slug}/donasi', [DonationController::class, 'store'])->name('donation.store');
    Route::get('/donasi/status/{donationCode}', [DonationController::class, 'status'])->name('donation.status');
    Route::get('/program/{slug}', [ProgramListingController::class, 'show'])->name('program.show');

    // Public Pages
    Route::get('/tentang-kami', [AboutController::class, 'index'])->name('about.index');
    Route::get('/fokus-program', [FocusProgramController::class, 'index'])->name('focus.index');
    Route::get('/berita', [BlogController::class, 'index'])->name('blog.index');
    Route::get('/berita/{slug}', [BlogController::class, 'show'])->name('blog.show');
    Route::get('/kontak', [ContactController::class, 'create'])->name('contact.create');
    Route::post('/kontak', [ContactController::class, 'store'])->name('contact.store');

    // Smart Redirect for "Galang Dana" / Create Program
    Route::get('/buat-program', function () {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        if (! $user->campaignerProfile) {
            return redirect()->route('campaigner.register');
        }

        if ($user->campaignerProfile->verification_status !== 'verified') {
            return redirect()->route('campaigner.status');
        }

        return redirect()->route('akun.programs.create');
    })->name('buat-program');

    // Static Legal & Help Pages (Clean URL Aliases)
    Route::get('/pusat-bantuan', [PublicPageController::class, 'pusatBantuan'])->name('page.pusat-bantuan');
    Route::get('/faq', fn () => redirect()->route('page.pusat-bantuan'))->name('page.faq');
    Route::get('/syarat-ketentuan', [PublicPageController::class, 'syaratKetentuan'])->name('page.syarat-ketentuan');
    Route::get('/kebijakan-privasi', [PublicPageController::class, 'kebijakanPrivasi'])->name('page.kebijakan-privasi');
    Route::get('/cara-donasi', [PublicPageController::class, 'caraDonasi'])->name('page.cara-donasi');

    // Dynamic Public Pages (Catch-all inside locale)
    Route::get('/halaman/{slug}', [PublicPageController::class, 'show'])->name('page.show');
});

// Webhooks
Route::post('/webhooks/xendit', [XenditWebhookController::class, 'handle'])
    ->middleware('verify.xendit-callback-token')
    ->name('webhooks.xendit');
Route::post('/webhooks/wordpress', [WordPressWebhookController::class, 'handle'])
    ->middleware('verify.wordpress-webhook-token')
    ->name('webhooks.wordpress');

Route::middleware(['auth', 'verified', 'no-cache'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Campaigner Registration
    Route::get('/campaigner/register', [CampaignerRegistrationController::class, 'create'])->name('campaigner.register');
    Route::post('/campaigner/register', [CampaignerRegistrationController::class, 'store'])->name('campaigner.register.store');
    Route::get('/campaigner/status', [CampaignerRegistrationController::class, 'status'])->name('campaigner.status');

    Route::prefix('admin')->name('admin.')->middleware('role:Administrator|Program Officer|Verifikator|Keuangan|Customer Service|Content Editor')->group(function () {
        Route::middleware('permission:user.view')->group(function () {
            Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        });

        Route::middleware('permission:category.view')->group(function () {
            Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
            Route::patch('categories/{category}/pillar', [CategoryController::class, 'updatePillar'])->name('categories.update-pillar');
        });

        Route::middleware('permission:manage_pages')->group(function () {
            Route::resource('pages', PageController::class)->except(['show']);
        });

        Route::middleware('permission:manage_faqs')->group(function () {
            Route::resource('faqs', FaqController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_management')->group(function () {
            Route::resource('management-members', ManagementMemberController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_partners')->group(function () {
            Route::resource('partners', PartnerController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_impact_stats')->group(function () {
            Route::resource('impact-stats', ImpactStatController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_banners')->group(function () {
            Route::resource('homepage-banners', HomepageBannerController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_contact_messages')->group(function () {
            Route::resource('contact-messages', ContactMessageController::class)->only(['index', 'show', 'destroy']);
        });

        Route::middleware('permission:donation.view')->group(function () {
            Route::get('/donations', [App\Http\Controllers\Admin\DonationController::class, 'index'])->name('donations.index');
            Route::post('/donations/{donation}/confirm', [App\Http\Controllers\Admin\DonationController::class, 'confirm'])->name('donations.confirm');
        });

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
            Route::resource('disbursements', DisbursementController::class)->only(['index', 'show']);
            Route::put('disbursements/{disbursement}/status', [DisbursementController::class, 'updateStatus'])->name('disbursements.update-status');
        });

        Route::middleware('permission:comment.moderate')->group(function () {
            Route::get('comments', [CommentModerationController::class, 'index'])->name('comments.index');
            Route::put('comments/{comment}/toggle-hidden', [CommentModerationController::class, 'toggleHidden'])->name('comments.toggle-hidden');
        });

        Route::middleware('permission:report.view')->group(function () {
            Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
            Route::get('reports/donations/export', [ReportController::class, 'exportDonations'])->name('reports.donations.export');
            Route::get('reports/disbursements/export', [ReportController::class, 'exportDisbursements'])->name('reports.disbursements.export');
        });

        Route::middleware('permission:settings.view')->group(function () {
            Route::get('site-settings', [SiteSettingController::class, 'index'])->name('site-settings.index');
            Route::post('site-settings', [SiteSettingController::class, 'update'])->name('site-settings.update');
        });
    });

    Route::post('/programs/{program}/comments', [CommentController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('programs.comments.store');

    Route::middleware('auth')->prefix('akun')->name('akun.')->group(function () {
        // Donor route
        Route::get('/donasi-saya', [DonorDonationController::class, 'index'])->name('donations.index');

        // Campaigner routes (Must be verified)
        Route::middleware('campaigner.verified')->group(function () {
            Route::resource('programs', CampaignerProgramController::class);
            Route::resource('programs.disbursements', CampaignerDisbursementController::class)->only(['index', 'create', 'store']);
            Route::resource('programs.updates', CampaignerProgramUpdateController::class)->only(['index', 'store']);
        });

        // Rich Text Image Upload (for Campaigners & Admins)
        Route::post('/upload-image', [ImageUploadController::class, 'upload'])->name('upload.image');
    });
});

require __DIR__.'/settings.php';
