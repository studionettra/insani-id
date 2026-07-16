<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\ManagementMemberController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\ImpactStatController;
use App\Http\Controllers\Api\HomepageBannerController;
use App\Http\Controllers\Api\ContactMessageController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::get('/pages/{slug}', [PageController::class, 'show']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/management', [ManagementMemberController::class, 'index']);
    Route::get('/partners', [PartnerController::class, 'index']);
    Route::get('/impact-stats', [ImpactStatController::class, 'index']);
    Route::get('/banners', [HomepageBannerController::class, 'index']);
    
    // Using Turnstile middleware (or manual validation) for contact messages
    Route::post('/contact', [ContactMessageController::class, 'store']);
});
