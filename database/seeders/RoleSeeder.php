<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;


class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define modules, actions, and permission levels
        $modules = app('modules');
        $actions = ['view', 'edit', 'delete'];
        $permissionLevels = ['owner', 'all'];

        // Create all permissions
        foreach ($modules as $module) {
            // Access and create permissions
            Permission::findOrCreate("access_{$module}");
            Permission::findOrCreate("create_{$module}");

            foreach ($actions as $action) {
                foreach ($permissionLevels as $level) {
                    Permission::findOrCreate("{$action}_{$level}_{$module}");
                }
            }
        }

        // Create roles
        $roles = [
            'Administrator' => Permission::all()->pluck('name')->toArray(), // Admin gets all permissions
            'Manager' => $this->getPermissionsForRole($modules, $actions, $permissionLevels, 'manager'),
            'Employee' => $this->getPermissionsForRole($modules, $actions, $permissionLevels, 'employee'),
            'Customer' => $this->getPermissionsForRole($modules, $actions, $permissionLevels, 'customer'),
        ];

        // Assign permissions to roles
        foreach ($roles as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->first();
            if(!$role) {
                $is_admin = $roleName == 'Administrator' ? 1 : 0;
                $is_apply_team_visibility = $roleName == 'Administrator' ? 0 : 1;
                $role = Role::create(['name' => $roleName, 'guard_name' => 'web', 'created_by' => '1', 'is_admin' => $is_admin, 'apply_team_visibility' => $is_apply_team_visibility]);
            }
            $role->syncPermissions($permissions);
        }
    }

    /**
     * Get permissions for a role based on specific conditions.
     */
    private function getPermissionsForRole(array $modules, array $actions, array $levels, string $role): array
    {
        $permissions = [];

        switch ($role) {
            case 'manager':
                $permissions = $this->getManagerPermissions($modules, $actions, $levels);
                break;
            case 'employee':
                $permissions = $this->getEmployeePermissions($modules, $actions, $levels);
                break;
            case 'customer':
                $permissions = $this->getCustomerPermissions($modules, $actions);
                break;
        }

        return Permission::whereIn('name', $permissions)->get()->pluck('name')->toArray();
    }

    /**
     * Define permissions for the manager role.
     */
    private function getManagerPermissions(array $modules, array $actions, array $levels): array
    {
        $permissions = [];

        foreach (['products', 'orders', 'customers', 'categories', 'vouchers', 'employees'] as $module) {
            $permissions[] = "access_{$module}";
            foreach (['create', 'view', 'edit', 'delete'] as $action) {
                foreach ($levels as $level) {
                    $permissions[] = "{$action}_{$level}_{$module}";
                }
            }
        }

        return $permissions;
    }

    /**
     * Define permissions for the employee role.
     */
    private function getEmployeePermissions(array $modules, array $actions, array $levels): array
    {
        $permissions = [];

        foreach (['products', 'orders', 'customers', 'categories', 'vouchers'] as $module) {
            $permissions[] = "access_{$module}";
            foreach (['view', 'edit'] as $action) { // Employees have limited actions
                foreach ($levels as $level) {
                    $permissions[] = "{$action}_{$level}_{$module}";
                }
            }
        }

        return $permissions;
    }

    /**
     * Define permissions for the customer role.
     */
    private function getCustomerPermissions(array $modules, array $actions): array
    {
        $permissions = [];

        foreach (['products', 'orders'] as $module) {
            $permissions[] = "access_{$module}";
            foreach (['view'] as $action) { // Customers can only view
                $permissions[] = "{$action}_all_{$module}";
            }
        }

        return $permissions;
    }
}
