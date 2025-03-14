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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();;
            $table->timestamps();
            $table->string('vourcher_code');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('discount_type', ['percent', 'fixed'])->default('percent');
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->decimal('discount_percent', 8, 2)->default(0);
            $table->integer('limit');
            // update
            $table->decimal('minimum')->nullable();
            $table->enum('apply_type', ['shipping_fee', 'discount'])->default('discount');
            $table->decimal('limit_per_order')->nullable();

            $table->json('config');
//            $table->uuid('team_id');
            $table->uuid('created_by');
//            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
