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
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();;
            $table->timestamps();
            $table->uuid('user_id');
            $table->dateTime('date_registered');
            $table->dateTime('date_of_birth')->nullable();
            $table->string('full_name');
            $table->enum('gender', ['Male', 'Female'])->nullable();
            $table->string('phone_number')->unique();
            $table->string('email')->unique();
            // update
            $table->string('customer_number')->nullable();
            $table->enum('rank', ['Diamond', 'Gold', 'Silver', 'Bronze'])->nullable()->default('Bronze');
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->integer('total_point')->default(0);

            //update address
            $table->string('province')->nullable(); // Add province field
            $table->string('district')->nullable(); // Add district field
            $table->string('ward')->nullable();     // Add ward field
            $table->string('street')->nullable();


            $table->softDeletes();

//            $table->uuid('team_id');
            $table->uuid('created_by');
//            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            //Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
