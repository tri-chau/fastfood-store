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
        Schema::create('order_details', function (Blueprint $table) {
            $table->uuid('id')->primary();;
            $table->uuid('customer_order_id');
            $table->uuid('product_id');
            $table->uuid('parent_id')->nullable();
            $table->string('order_detail_number');
            $table->mediumInteger('quantity');
            $table->decimal('total_price', 8, 2)->default(0);
            $table->string('note');
            $table->enum('size', ['S', 'M', 'L'])->default('S');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('customer_order_id')->references('id')->on('customers_orders');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('parent_id')->references('id')->on('order_details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_details');
    }
};
