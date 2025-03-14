<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AppInitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $customerRole = Role::create(['name' => 'customer']);
        $employeeRole = Role::create(['name' => 'employee']);
        $managerRole = Role::create(['name' => 'manager']);

        // Create a global team
        $team = Team::create([
            'name' => 'Global'
        ]);

        // Create an admin user and assign the admin role
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone_number' => '1234567890',
            'password' => Hash::make('password'), // Set a default password
            'user_type' => 'user', // Set user type if applicable
        ]);

        // Assign the 'admin' role to the admin user
        $adminUser->assignRole($adminRole);

        // Create a customer user and assign the customer role
        $customerUser = User::create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'phone_number' => '0987654321',
            'password' => Hash::make('password'), // Set a default password
            'user_type' => 'customer',
        ]);

        // Assign the 'customer' role to the customer user
        $customerUser->assignRole($customerRole);

        // Create an employee user and assign the employee role
        $employeeUser = User::create([
            'name' => 'Employee User',
            'email' => 'employee@example.com',
            'phone_number' => '1122334455',
            'password' => Hash::make('password'), // Set a default password
            'user_type' => 'user',
        ]);

        // Assign the 'employee' role to the employee user
        $employeeUser->assignRole($employeeRole);

        // Create a manager user and assign the manager role
        $managerUser = User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'phone_number' => '5566778899',
            'password' => Hash::make('password'), // Set a default password
            'user_type' => 'user',
        ]);

        // Assign the 'manager' role to the manager user
        $managerUser->assignRole($managerRole);

        // Create employee records for each employee user and associate with the global team
        $this->createEmployeeForUser($employeeUser, $team, 'Employee', 'employee@example.com', 'Manager');
        $this->createEmployeeForUser($managerUser, $team, 'Manager', 'manager@example.com', 'Manager');
    }

    /**
     * Helper function to create an employee record.
     *
     * @param User $user
     * @param Team $team
     * @param string $level
     * @param string $email
     * @param string $phone_number
     */
    protected function createEmployeeForUser(User $user, Team $team, $level, $email, $phone_number)
    {
        Employee::create([
            'user_id' => $user->id,
            'team_id' => $team->id,
            'date_registered' => now(),
            'date_of_birth' => now()->subYears(30), // Example: set a default date of birth
            'full_name' => $user->name,
            'gender' => 'Male', // You can customize this
            'level' => $level,
            'phone_number' => $phone_number,
            'email' => $email,
        ]);
    }
}
