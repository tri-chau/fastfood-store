<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register()
    {
        $this->app->singleton('modules', function () {
            return [
                'dashboard',
                'calendar',
                'users',
                'products',
                'orders',
                'customers',
                'categories',
                'employees',
                'vouchers',
                'teams',
                'roles',
            ];
        });
    }

    public function boot()
    {
        //
    }
}
