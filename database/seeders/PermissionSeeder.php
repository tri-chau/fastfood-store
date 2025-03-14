<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define your modules and actions
        $modules = app('modules');
        $actions = ['view', 'edit', 'delete'];

        // Define the permission levels (owner, all, permitted)
        $permissionLevels = ['owner', 'all'];

        // Loop through each module, action, and permission level to create permissions
        foreach ($modules as $module) {
            Permission::findOrCreate("access_{$module}");
            Permission::findOrCreate("create_{$module}");
            foreach ($actions as $action) {
                foreach ($permissionLevels as $level) {
                    // Create permission for each action and level
                    Permission::findOrCreate("{$action}_{$level}_{$module}");
                }
            }
        }
    }
}
