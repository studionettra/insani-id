<?php

namespace App\Providers;

use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use App\Observers\PaymentObserver;
use App\Observers\ProgramObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Fortify;

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

        // Record last login time on successful login
        Event::listen(Login::class, function (Login $event) {
            if ($event->user instanceof User) {
                $event->user->forceFill([
                    'last_login_at' => now(),
                ])->saveQuietly();

                activity('auth')
                    ->causedBy($event->user)
                    ->event('login')
                    ->withProperties([
                        'ip' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                    ])
                    ->log("Pengguna {$event->user->email} berhasil masuk");
            }
        });

        // Audit failed login attempts without storing plain passwords
        Event::listen(Failed::class, function (Failed $event) {
            $email = $event->credentials['email'] ?? $event->credentials[Fortify::username()] ?? 'unknown';

            $activity = activity('auth')
                ->event('login_failed')
                ->withProperties([
                    'email' => $email,
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);

            if ($event->user instanceof User) {
                $activity->performedOn($event->user);
            }

            $activity->log("Percobaan masuk gagal untuk {$email}");
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
            ->uncompromised()
        );
    }
}
