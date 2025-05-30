<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy user admin
        $admin = User::where('email', 'trichau@gmail.com')->firstOrFail();
        $categories = [
            [
                'name' => 'Drink',
                'description' => 'Các loại đồ uống',
                'type' => 'Drink',
                'priority' => 1,
                'show_for_customer' => 1,
                'created_at' => now(),
                'created_by' => $admin->id,
                'updated_at' => now(),
            ],
            [
                'name' => 'Fried Chicken',
                'description' => 'Các loại gà rán',
                'type' => 'Food',
                'priority' => 1,
                'show_for_customer' => 1,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Burger',
                'description' => 'Các loại burger',
                'type' => 'Food',
                'priority' => 1,
                'show_for_customer' => 1,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($categories as $category) {
            Category::create($category); // HasUuid sẽ tự động tạo UUID cho cột id
        }
    }
}
