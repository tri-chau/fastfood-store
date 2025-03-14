<?php
// app/Providers/CarbonServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Carbon\Carbon;

class CarbonServiceProvider extends ServiceProvider
{
    public function register()
    {
        Carbon::setToStringFormat('Y-m-d H:i:s'); // Set your default format here
    }
}
