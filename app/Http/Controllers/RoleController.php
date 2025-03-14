<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::get(); // Include permissions for each role
        return response()->json([
            'success' => true,
            'data' => $roles
        ], 200);
    }
    public function getRoleOptions()
    {
        // Retrieve all teams with only id and name fields
        $roles = Role::all(['id', 'name']);

        // Add the total number of employees to each team
        $roles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $roles
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles',
            'guard_name' => 'required',
            'permissions' => 'array',
        ]);

        try {
            $role = Role::create([
                'name' => $request->name,
                'guard_name' => $request->guard_name,
                'description' => $request->description,
                'is_admin' => $request->is_admin ? 1 : 0,
                'apply_team_visibility' => $request->apply_team_visibility ? 1 : 0,
            ]);
            $converted_permission = Permission::convertPermission($request->permissions);
            foreacH($converted_permission as $permission) {
                $permission = Permission::where('name', $permission)->first();
                $role->givePermissionTo($permission);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role.',
                'error' => $e->getMessage()
            ], 500);
        }
        return response()->json([
            'success' => true,
            'data' => $role
        ], 200);
    }

    public function assignPermission(Request $request, Role $role)
    {
        $request->validate(['permission' => 'required|exists:permissions,name']);
        $permission = Permission::where('name', $request->permission)->first();
        $role->givePermissionTo($permission);

        return response()->json([
            'success' => true,
            'message' => 'Permission assigned to role successfully.',
            'data' => $role->load('permissions')
        ], 200);
    }

    public function revokePermission(Request $request, Role $role)
    {
        $request->validate(['permission' => 'required|exists:permissions,name']);
        $permission = Permission::where('name', $request->permission)->first();
        $role->revokePermissionTo($permission);

        return response()->json([
            'success' => true,
            'message' => 'Permission revoked from role successfully.',
            'data' => $role->load('permissions')
        ], 200);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id, // Ensure the role name is unique, excluding the current role
            'guard_name' => 'required',
            'permissions' => 'array',
        ]);

        try {
            // Update role attributes
            $role->update([
                'name' => $request->name,
                'guard_name' => $request->guard_name,
                'description' => $request->description,
                'is_admin' => $request->is_admin ? 1 : 0,
                'apply_team_visibility' => $request->apply_team_visibility ? 1 : 0,
            ]);

            // Convert and update permissions
            $converted_permission = Permission::convertPermission($request->permissions);

            // Detach existing permissions and assign new ones
            $role->syncPermissions([]);  // Detach all permissions first
            foreach ($converted_permission as $permission) {
                $permissionModel = Permission::where('name', $permission)->first();
                if ($permissionModel) {
                    $role->givePermissionTo($permissionModel);
                }
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role.',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully.',
            'data' => $role->load('permissions')
        ], 200);
    }

    public function getDetail(Role $role)
    {
        // Load the permissions associated with the role
        $role->load('permissions');

        // Convert the stored permissions back to the original structure
        $permissions = Permission::reverseConvertPermission($role->permissions);
        unset($role->permissions); // Remove the permissions attribute from the role object
        return response()->json([
            'success' => true,
            'data' => [
                'role' => $role,
                'permissions' => $permissions
            ]
        ], 200);
    }

    public function reverseConvertPermission($permissions)
    {
        $reversed_permissions = [];

        // Define the available actions for each module
        $all_actions = ['view', 'create', 'edit', 'delete'];

        foreach ($permissions as $permission) {
            // Split permission name into parts
            $permission_parts = explode('_', $permission->name);

            if (count($permission_parts) >= 2) {
                $action = $permission_parts[0]; // 'view', 'create', 'update', etc.
                $permission_type = $permission_parts[1]; // 'permitted', 'owner', 'all', etc.
                $module = $permission_parts[2] ?? $permission_parts[1]; // 'user', 'order', etc.

                if ($module) {
                    // Initialize the module if not already done
                    if (!isset($reversed_permissions[$module])) {
                        $reversed_permissions[$module] = [];
                    }

                    // Assign the permission type to the corresponding action for the module
                    $reversed_permissions[$module][$action] = $permission_type;

                    if($action == 'access' || $action == 'create') {
                        if(!isset($reversed_permissions[$module][$action])) {
                            $reversed_permissions[$module][$action] = 'none';
                        } else {
                            $reversed_permissions[$module][$action] = 'allowed';
                        }
                    }
                }
            }
        }
        foreach (app('modules') as $module) {
            if(!isset($reversed_permissions[$module])) {
                $reversed_permissions[$module]['access'] = 'none';
            }
            foreach ($all_actions as $action) {
                if (!isset($reversed_permissions[$module][$action])) {
                    $reversed_permissions[$module][$action] = 'none'; // Set missing actions to 'none'
                }
            }
        }
        return $reversed_permissions;
    }


}
