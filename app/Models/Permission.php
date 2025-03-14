<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends \Spatie\Permission\Models\Permission
{
    use HasFactory;
    use HasUuid;
    static public function convertPermission($permissions)
    {
        $converted_permission = [];
        foreach ($permissions as $module => $actions)
        {
            foreach ($actions as $action => $permission)
            {
                if (($action == 'access' || $action == 'create') && $permission == 'allowed')
                {
                    $converted_permission[] = $action . '_' . $module;
                    continue;
                }
                if ($permission != 'none')
                {
                    $converted_permission[] = $action . '_' . $permission . '_' . $module;
                }
            }
        }
        return $converted_permission;
    }
    static public function reverseConvertPermission($permissions, $is_admin = false)
    {
        $reversed_permissions = [];

        // Define the available actions for each module
        $all_actions = ['view', 'create', 'edit', 'delete'];

        foreach ($permissions as $permission) {
            // Split permission name into parts
            $permission_parts = explode('_', $permission->name);

            if (count($permission_parts) >= 2) {
                $action = $permission_parts[0]; // 'view', 'create', 'update', etc.
                $permission_type = !$is_admin ? $permission_parts[1] : 'all'; // 'permitted', 'owner', 'all', etc.
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

                        if($is_admin) {
                            $reversed_permissions[$module][$action] = 'allowed';
                        }
                    }
                }
            }
        }
        $modules = app('modules');
        foreach ($modules as $module) {
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
