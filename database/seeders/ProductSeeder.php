<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy user admin
        $admin = User::where('email', 'trichau@gmail.com')->firstOrFail();

        $products = [
            [
                'name' => 'Fried Chicken Bucket',
                'description' => 'Crispy and juicy fried chicken bucket',
                'price' => 30000,
                'image' => 'FriedChickenBucket.png',
                'status' => 'active',
                'is_topping' => 0,
                'priority' => 1,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Big King Burger',
                'description' => 'Double patty flame-grilled burger',
                'price' => 25000,
                'image' => 'BigBurger.jpg',
                'status' => 'active',
                'is_topping' => 0,
                'priority' => 2,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Iced Cola',
                'description' => 'Chilled refreshing cola drink',
                'price' => 35000,
                'image' => 'IcedCola.jpg',
                'status' => 'active',
                'is_topping' => 0,
                'priority' => 3,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fried Chicken with fries and nuggets',
                'description' => 'Combo for friends and families',
                'price' => 150000,
                'image' => 'ChickenWFries.jpg',
                'status' => 'active',
                'is_topping' => 0,
                'priority' => 1,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($products as $product) {
            Product::create($product); // HasUuid sẽ tự động tạo UUID cho cột id
        }
    }
}
