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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->decimal('price', 8, 2)->default(0);
            $table->decimal('cost', 8, 2)->default(0);
            $table->decimal('up_m_price', 8, 2)->default(0);
            $table->decimal('up_l_price', 8, 2)->default(0);
            $table->boolean('is_topping')->default(false);
            $table->integer('priority')->default(0);

//            $table->uuid('team_id');
            $table->uuid('created_by');
//            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
