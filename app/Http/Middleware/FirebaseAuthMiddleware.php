<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Exception\Auth\RevokedIdToken;
use Symfony\Component\HttpFoundation\Response;
use Kreait\Firebase\Contract\Auth as FireAuth;
use Illuminate\Support\Facades\Auth;



class FirebaseAuthMiddleware
{
    protected FireAuth $firebaseAuth;

    public function __construct(FireAuth $firebaseAuth)
    {

        $this->firebaseAuth = $firebaseAuth;
    }

    public function handle(Request $request, Closure $next)
    {
        \Log::info('FirebaseAuthMiddleware started');
        $token = $request->bearerToken(); // Lấy token từ header Authorization
        if (!$token) {
            \Log::error('No token provided');
            return response()->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($token);
            \Log::info('Token verified successfully:', $verifiedIdToken->claims()->all());
            $firebaseClaims = $verifiedIdToken->claims()->all();
            $firebaseUid = $firebaseClaims['sub'];
            // Tìm hoặc tạo user trong database
            $user = \App\Models\User::firstOrCreate(
                ['firebase_uid' => $firebaseUid],
                [
                    'email' => $firebaseClaims['email'] ?? null,
                    'name' => $firebaseClaims['name'] ?? 'Unknown',
                ]
            );
            \Log::info('User found or created:', $user->toArray());
            auth()->setUser($user);
            \Log::info('User attached to Auth:', auth()->user() ? auth()->user()->toArray() : 'null');
            $request->attributes->set('firebaseUser', $firebaseClaims);
        } catch (RevokedIdToken $e) {
            \Log::error('Token revoked:');
            return response()->json(['error' => 'Token revoked'], Response::HTTP_UNAUTHORIZED);
        } catch (\Exception $e) {
            \Log::error('Token verification failed:' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized (Token invalid)'], Response::HTTP_UNAUTHORIZED);
        }
        return $next($request);
    }
}
