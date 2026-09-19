<?php

use App\Jobs\FullSyncBlogPostsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('programs:check-status')->dailyAt('00:01');
Schedule::command('disbursements:send-update-reminders')->dailyAt('09:00');
Schedule::job(new FullSyncBlogPostsJob)->hourly();
Schedule::command('backup:run --only-db')->dailyAt('01:00');
Schedule::command('backup:clean')->dailyAt('01:30');
