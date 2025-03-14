<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();;
            $table->timestamps();
            $table->string('order_number');
            $table->string('receiver_name');
            $table->string('receiver_address')->default('');
            $table->enum('payment_method', ['Banking', 'Cash', ''])->default('');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->enum('order_status', ['Draft', 'Wait For Approval', 'In Progress', 'Delivering', 'Delivered', 'Completed', 'Cancelled'])->default('Wait For Approval');
            $table->decimal('order_total', 8, 2)->default(0);
            $table->smallInteger('rate')->nullable();
            $table->string('customer_feedback');
            $table->uuid('host_id'); //Id of customer who placed this order
            $table->enum('source', ['Offline', 'Online'])->default('Offline');

            // update
            $table->string('payment_link')->nullable();
            $table->string('receiver_phone')->nullable();
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->string('note')->nullable();

            //update address
            $table->string('province')->nullable(); // Add province field
            $table->string('district')->nullable(); // Add district field
            $table->string('ward')->nullable();     // Add ward field
            $table->string('street')->nullable();

            // update team order
//            $table->string('custom_name')->nullable();
//            $table->string('type')->enum(['Personal', 'Group'])->default('Personal');

            $table->softDeletes();
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

//            $table->uuid('team_id');
//            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');

            //Foreign Keys
            $table->foreign('host_id')->references('id')->on('customers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Drop the orders table
        Schema::dropIfExists('orders');

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
