<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUuid = 'B4NZvHjUcEhCdUPsxgUyWmnzSQd2';
        if (!User::where('id', '1')->exists()) {
            User::create([
                'id' => '1',
                'firebase_uid' => $adminUuid,
                'name' => 'Admin',
                'email' => 'admin@admin.com',
                'password' => bcrypt('123456'),
                'email_verified_at' => now(),
                'is_admin' => true,
                'api_token' => Str::random(80),
                'user_type' => 'user',
                'created_by' => $adminUuid
            ]);
        }
    }
}
