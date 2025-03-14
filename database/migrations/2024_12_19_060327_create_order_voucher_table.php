<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderVoucherTable extends Migration
{
    public function up()
    {
        Schema::create('order_voucher', function (Blueprint $table) {
            $table->id(); // Auto-incrementing ID for the pivot table
            $table->uuid('order_id'); // UUID foreign key
            $table->uuid('voucher_id'); // UUID foreign key
            $table->timestamps();

            // Add foreign key constraints
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('voucher_id')->references('id')->on('vouchers')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_voucher');
    }
}
