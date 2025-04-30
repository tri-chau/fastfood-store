<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Exception\Auth\RevokedIdToken;
use Symfony\Component\HttpFoundation\Response;
use Kreait\Firebase\Contract\Auth as FireAuth;


class FirebaseAuthMiddleware
{
    protected FireAuth $firebaseAuth;

    public function __construct(FireAuth $firebaseAuth)
    {

        $this->firebaseAuth = $firebaseAuth;
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken(); // Lấy token từ header Authorization
        if (!$token) {
            \Log::error('No token provided');
            return response()->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($token);
            \Log::info('Token verified successfully:', $verifiedIdToken->claims()->all());
            $request->attributes->set('firebaseUser', $verifiedIdToken->claims()->all());
        } catch (RevokedIdToken $e) {
            return response()->json(['error' => 'Token revoked'], Response::HTTP_UNAUTHORIZED);
        } catch (\Exception $e) {
            \Log::error('Firebase token verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized (Token invalid)'], Response::HTTP_UNAUTHORIZED);
        }
        return $next($request);
    }
}
