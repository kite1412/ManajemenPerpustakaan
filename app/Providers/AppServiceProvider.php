<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\HASH;
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
        if (Schema::hasTable('users')) {
            $adminExists = DB::table('users')->where('email', 'admin@example.com')->exists();
            $memberExists = DB::table('users')->where('email', 'member@example.com')->exists();

            if (! $adminExists) {
                DB::table('users')->insert([
                    'username' => 'admin',
                    'name' => 'admin',
                    'email' => 'admin@example.com',
                    'password' => Hash::make('secret'),
                    'role' => 'ADMIN',
                ]);
            }

            if (! $memberExists) {
                DB::table('users')->insert([
                    'username' => 'member',
                    'name' => 'member',
                    'email' => 'member@example.com',
                    'password' => Hash::make('secret')
                ]);
            }
        }
    }
}
