<?php

namespace App\Providers;

use App\Models\Payment;
use App\Models\Program;
use App\Observers\PaymentObserver;
use App\Observers\ProgramObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Logout;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Implicitly grant "Administrator" role all permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Administrator') ? true : null;
        });

        // Capture user entity on logout before session is invalidated
        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                request()->attributes->set('logged_out_user', $event->user);
            }
        });

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
