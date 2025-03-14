<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products_toppings', function (Blueprint $table) {
            $table->timestamps();
            $table->uuid('product_id');
            $table->uuid('topping_id');

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('topping_id')->references('id')->on('products')->onDelete('cascade');
            $table->primary(['product_id', 'topping_id']);

            // update
            $table->decimal('extra_price', 8, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_toppings');
    }
};
