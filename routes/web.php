<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\BankAccountController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\CampaignerVerificationController;
use App\Http\Controllers\Admin\CampaignSlotRequestController as AdminCampaignSlotRequestController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentModerationController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\DisbursementController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\FinancialReportController as AdminFinancialReportController;
use App\Http\Controllers\Admin\FocusProgramController as AdminFocusProgramController;
use App\Http\Controllers\Admin\FundraiserController as AdminFundraiserController;
use App\Http\Controllers\Admin\HomepageBannerController;
use App\Http\Controllers\Admin\ImpactStatController;
use App\Http\Controllers\Admin\LegalDocumentController;
use App\Http\Controllers\Admin\ManagementMemberController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PopupMessageController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\ProgramUpdateController as AdminProgramUpdateController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\AnalyticsCollectorController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\BlogController;
use App\Http\Controllers\Public\CampaignerDisbursementController;
use App\Http\Controllers\Public\CampaignerProgramController;
use App\Http\Controllers\Public\CampaignerProgramUpdateController;
use App\Http\Controllers\Public\CampaignerRegistrationController;
use App\Http\Controllers\Public\CampaignerSlotRequestController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\DonationController;
use App\Http\Controllers\Public\DonationReceiptController;
use App\Http\Controllers\Public\DonorDonationController;
use App\Http\Controllers\Public\FinancialReportController as PublicFinancialReportController;
use App\Http\Controllers\Public\FocusProgramController;
use App\Http\Controllers\Public\FundraiserController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PageController as PublicPageController;
use App\Http\Controllers\Public\ProgramListingController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SitemapController;
use App\Http\Controllers\Webhook\XenditWebhookController;
use App\Models\AppSetting;
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
    Route::post('/program/{program:slug}/donasi', [DonationController::class, 'store'])
        ->middleware('throttle:15,1')
        ->name('donation.store');
    Route::get('/donasi/status/{donationCode}', [DonationController::class, 'status'])->name('donation.status');
    Route::get('/donasi/kwitansi/{donationCode}', [DonationReceiptController::class, 'show'])->name('donation.receipt');
    Route::get('/cek-donasi', [DonationController::class, 'lookup'])->name('donation.lookup');
    Route::get('/program/{slug}', [ProgramListingController::class, 'show'])->name('program.show');

    // Public Pages
    Route::get('/tentang-kami', [AboutController::class, 'index'])->name('about.index');
    Route::get('/laporan-keuangan', [PublicFinancialReportController::class, 'index'])->name('financial-reports.index');
    Route::get('/laporan-keuangan/{financial_report:slug}/unduh', [PublicFinancialReportController::class, 'download'])->name('financial-reports.download');
    Route::get('/fokus-program', [FocusProgramController::class, 'index'])->name('focus.index');
    Route::get('/fokus-program/{category:slug}', [FocusProgramController::class, 'show'])->name('focus.show');
    Route::get('/berita', [BlogController::class, 'index'])->name('blog.index');
    Route::get('/berita/{slug}', [BlogController::class, 'show'])->name('blog.show');
    Route::get('/kontak', [ContactController::class, 'create'])->name('contact.create');
    Route::post('/kontak', [ContactController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('contact.store');

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

// Dynamic Sitemap XML
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Google AdSense ads.txt
Route::get('/ads.txt', function () {
    $content = AppSetting::get('ads_txt_content');
    if (! $content) {
        $pubId = AppSetting::get('google_adsense_client_id');
        if ($pubId) {
            $cleanPub = preg_replace('/[^0-9]/', '', (string) $pubId);
            if (! empty($cleanPub)) {
                $content = "google.com, pub-{$cleanPub}, DIRECT, f08c47fec0942fa0";
            }
        }
    }

    if (! $content) {
        abort(404);
    }

    return response($content, 200, [
        'Content-Type' => 'text/plain; charset=utf-8',
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->name('ads.txt');

// Public Instant Search API
Route::get('/api/public/search', [SearchController::class, 'search'])
    ->middleware('throttle:30,1')
    ->name('api.public.search');

// Webhooks
Route::post('/webhooks/xendit', [XenditWebhookController::class, 'handle'])
    ->middleware('verify.xendit-callback-token')
    ->name('webhooks.xendit');

// First-Party Analytics Collector
Route::post('/analytics/collect', [AnalyticsCollectorController::class, 'collect'])
    ->middleware('throttle:60,1')
    ->name('analytics.collect');
Route::post('/analytics/heartbeat', [AnalyticsCollectorController::class, 'heartbeat'])
    ->middleware('throttle:60,1')
    ->name('analytics.heartbeat');

Route::middleware(['auth', 'verified', 'no-cache'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/{id}/go', [NotificationController::class, 'readAndRedirect'])->name('go');
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::patch('/{id}/unread', [NotificationController::class, 'markAsUnread'])->name('unread');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::post('/bulk-action', [NotificationController::class, 'bulkAction'])->name('bulk-action');
        Route::delete('/clear-read', [NotificationController::class, 'clearRead'])->name('clear-read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // Campaigner Registration
    Route::get('/campaigner/register', [CampaignerRegistrationController::class, 'create'])->name('campaigner.register');
    Route::post('/campaigner/register', [CampaignerRegistrationController::class, 'store'])->name('campaigner.register.store');
    Route::get('/campaigner/status', [CampaignerRegistrationController::class, 'status'])->name('campaigner.status');
    Route::get('/campaigner/documents/{id}', [CampaignerRegistrationController::class, 'viewDocument'])->name('campaigner.document');

    // Fundraiser Actions
    Route::post('/program/{program:slug}/fundraiser', [FundraiserController::class, 'store'])->name('program.fundraiser.store');
    Route::get('/akun/fundraiser', [FundraiserController::class, 'myFundraisers'])->name('akun.fundraiser.index');

    Route::prefix('admin')->name('admin.')->middleware('role:Administrator|Program Officer|Verifikator|Keuangan|Customer Service|Content Editor')->group(function () {
        Route::get('/', fn () => redirect()->route('dashboard'))->name('dashboard');
        Route::post('/auto-translate', [TranslationController::class, 'translate'])->name('auto-translate');

        Route::middleware('permission:user.view')->group(function () {
            Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
            Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        });

        Route::middleware('permission:category.view')->group(function () {
            Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
            Route::patch('categories/{category}/pillar', [CategoryController::class, 'updatePillar'])->name('categories.update-pillar');
            Route::resource('focus-programs', AdminFocusProgramController::class)->parameters(['focus-programs' => 'category'])->except(['create', 'show', 'destroy']);
            Route::patch('focus-programs/{category}/toggle-status', [AdminFocusProgramController::class, 'toggleStatus'])->name('focus-programs.toggle-status');
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

        Route::middleware('permission:manage_legal_documents|manage_pages')->group(function () {
            Route::resource('legal-documents', LegalDocumentController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_financial_reports|report.view')->group(function () {
            Route::resource('financial-reports', AdminFinancialReportController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_partners')->group(function () {
            Route::resource('partners', PartnerController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_impact_stats')->group(function () {
            Route::resource('impact-stats', ImpactStatController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_banners')->group(function () {
            Route::resource('homepage-banners', HomepageBannerController::class)->except(['show', 'create', 'edit']);
            Route::resource('testimonials', TestimonialController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_popups|manage_banners')->group(function () {
            Route::patch('popup-messages/{popup_message}/toggle-active', [PopupMessageController::class, 'toggleActive'])->name('popup-messages.toggle-active');
            Route::resource('popup-messages', PopupMessageController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:manage_contact_messages')->group(function () {
            Route::resource('contact-messages', ContactMessageController::class)->only(['index', 'show', 'destroy']);
        });

        Route::middleware('permission:manage_blog')->group(function () {
            Route::resource('blogs', AdminBlogController::class)->except(['show']);
        });

        Route::middleware('permission:donation.view')->group(function () {
            Route::get('/donations', [App\Http\Controllers\Admin\DonationController::class, 'index'])->name('donations.index');
            Route::post('/donations/{donation}/confirm', [App\Http\Controllers\Admin\DonationController::class, 'confirm'])->name('donations.confirm');
            Route::resource('bank-accounts', BankAccountController::class)->except(['show', 'create', 'edit']);
        });

        Route::middleware('permission:campaigner.verify')->group(function () {
            Route::get('/campaigners', [CampaignerVerificationController::class, 'index'])->name('campaigners.index');
            Route::get('/campaigners/{id}', [CampaignerVerificationController::class, 'show'])->name('campaigners.show');
            Route::get('/campaigners/{id}/documents/{docId}', [CampaignerVerificationController::class, 'viewDocument'])->name('campaigners.document');
            Route::put('/campaigners/{id}/status', [CampaignerVerificationController::class, 'updateStatus'])->name('campaigners.update-status');

            Route::get('/slot-requests', [AdminCampaignSlotRequestController::class, 'index'])->name('slot-requests.index');
            Route::post('/slot-requests/{slotRequest}/approve', [AdminCampaignSlotRequestController::class, 'approve'])->name('slot-requests.approve');
            Route::post('/slot-requests/{slotRequest}/reject', [AdminCampaignSlotRequestController::class, 'reject'])->name('slot-requests.reject');
        });

        Route::get('/fundraisers', [AdminFundraiserController::class, 'index'])->name('fundraisers.index');

        Route::middleware('permission:program.view')->group(function () {
            Route::resource('programs', ProgramController::class);
            Route::put('/programs/{id}/status', [ProgramController::class, 'updateStatus'])->name('programs.update-status');
            Route::post('/programs/{id}/translate', [ProgramController::class, 'translate'])->name('programs.translate');
            Route::resource('programs.updates', AdminProgramUpdateController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::put('programs/{program}/updates/{update}/moderation', [AdminProgramUpdateController::class, 'updateModeration'])->name('programs.updates.moderation');
        });

        Route::middleware('permission:disbursement.view')->group(function () {
            Route::resource('disbursements', DisbursementController::class)->only(['index', 'show']);
            Route::get('disbursements/{disbursement}/receipt', [DisbursementController::class, 'receipt'])->name('disbursements.receipt');
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

            Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
            Route::get('analytics/realtime', [AnalyticsController::class, 'realtime'])->name('analytics.realtime');
            Route::get('analytics/events', [AnalyticsController::class, 'events'])->name('analytics.events');
        });

        Route::middleware('permission:settings.view')->group(function () {
            Route::get('site-settings', [SiteSettingController::class, 'index'])->name('site-settings.index');
            Route::post('site-settings', [SiteSettingController::class, 'update'])->name('site-settings.update');
        });
    });

    Route::middleware('auth')->group(function () {
        Route::post('/upload-image', [ImageUploadController::class, 'upload'])->name('upload.image.root');
    });

    Route::middleware('auth')->prefix('akun')->name('akun.')->group(function () {
        // Donor route
        Route::get('/donasi-saya', [DonorDonationController::class, 'index'])->name('donations.index');

        // Campaigner routes (Must be verified)
        Route::middleware('campaigner.verified')->group(function () {
            Route::resource('programs', CampaignerProgramController::class);
            Route::resource('programs.disbursements', CampaignerDisbursementController::class)->only(['index', 'create', 'store']);
            Route::get('programs/{program}/disbursements/{disbursement}/receipt', [CampaignerDisbursementController::class, 'receipt'])->name('programs.disbursements.receipt');
            Route::resource('programs.updates', CampaignerProgramUpdateController::class)->only(['index', 'store']);
            Route::post('slot-requests', [CampaignerSlotRequestController::class, 'store'])->name('slot-requests.store');
        });

        // Rich Text Image Upload (for Campaigners & Admins)
        Route::post('/upload-image', [ImageUploadController::class, 'upload'])->name('upload.image');
    });
});

require __DIR__.'/settings.php';
