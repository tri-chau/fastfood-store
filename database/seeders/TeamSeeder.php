<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if(!Team::where('id', '1')->exists()) {
            Team::create([
                'id' => '1',
                'name' => 'Global',
                'address' => '',
                'city' => '',
                'state' => '',
                'ward' => '',
                'description' => 'Default team',
                'created_by' => '1'
            ]);
        }
    }
}
