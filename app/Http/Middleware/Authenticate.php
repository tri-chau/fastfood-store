<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * Override this method to return a JSON response instead of a redirect.
     */
    protected function redirectTo(Request $request): ?string
    {
        // If the request expects JSON (i.e., an API request), return a 401 Unauthorized response
        if ($request->expectsJson()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // For non-API requests, return null (or you can also return a custom response if needed)
        return null;
    }
}
