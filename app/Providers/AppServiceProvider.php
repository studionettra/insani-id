<?php

namespace App\Providers;

use App\Console\Commands\RouteTranslationsListCommand;
use App\Models\Payment;
use App\Models\Program;
use App\Observers\PaymentObserver;
use App\Observers\ProgramObserver;
use Carbon\CarbonImmutable;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            'laravellocalizationroutecache.list',
            RouteTranslationsListCommand::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Program::observe(ProgramObserver::class);
        Payment::observe(PaymentObserver::class);

        View::composer('*', function ($view) {
            if (isset($view->getData()['message']) && $view->getData()['message'] instanceof Message) {
                View::share('mailMessage', $view->getData()['message']);
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): Password => Password::min(8)
            ->mixedCase()
            ->letters()
            ->numbers()
            ->symbols()
        );
    }
}
