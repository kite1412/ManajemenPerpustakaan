<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route as RouteFacade;

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
        Vite::prefetch(concurrency: 3);
        // Register route middleware alias for role checks
        if (app()->bound('router')) {
            app('router')->aliasMiddleware('role', \App\Http\Middleware\RoleMiddleware::class);
        }
    }
}
