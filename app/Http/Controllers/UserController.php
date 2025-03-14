<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json($users);
    }

    /**
     * Show the specified user.
     */
    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'phone_number' => 'nullable|string|unique:users',
            'password' => 'required|string|min:6',
            'user_type' => 'required|in:customer,user',
            'is_admin' => 'required|boolean'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'is_admin' => $request->is_admin,
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'nullable|string',
            'email' => 'nullable|string|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|unique:users,phone_number,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
            'user_type' => 'nullable|in:customer,user',
            'is_admin' => 'nullable|boolean'
        ]);

        $user->update($request->only(['name', 'email', 'phone_number', 'user_type', 'is_admin']));

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user
        ]);
    }

    /**
     * Delete the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        $role = Role::findByName($request->role);
        $user->assignRole($role);

        return response()->json([
            'message' => 'Role assigned to user successfully.',
            'user' => $user->load('roles')
        ]);
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        $role = Role::findByName($request->role);
        $user->removeRole($role);

        return response()->json([
            'message' => 'Role removed from user successfully.',
            'user' => $user->load('roles')
        ]);
    }

    /**
     * Get roles of the specified user.
     */
    public function getRoles(User $user)
    {
        return response()->json($user->getRoleNames());
    }
}
