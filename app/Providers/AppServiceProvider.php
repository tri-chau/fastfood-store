<?php

namespace App\Providers;

use App\Models\CustomPersonalAccessToken;
use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

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
        Sanctum::usePersonalAccessTokenModel(CustomPersonalAccessToken::class);
        Carbon::macro('setDefaultToStringFormat', function () {
            Carbon::useTestNow(); // Optionally set a default time for testing
            Carbon::setToStringFormat('Y-m-d H:i:s'); // Example format
        });
    }
}
