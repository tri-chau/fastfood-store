<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;
class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        \Log::info('BroadcastServiceProvider booting');
        Broadcast::routes(['middleware' => ['firebase.auth']]);
        require base_path('routes/channels.php');
    }
}

