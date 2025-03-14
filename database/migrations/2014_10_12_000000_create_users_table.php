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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('firebase_uid')->unique(); // Firebase UID
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number')->unique()->default('');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable(); // Firebase users don't have password
            $table->boolean('is_admin')->default(false);
            $table->enum('user_type', ['customer', 'user'])->default('user');
//            $table->uuid('team_id');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // update
            $table->string('api_token', 80)->unique()->nullable()->default(null);

            //Foreign keys
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
//            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');

            // update
            $table->text('custom_token')->unique()->nullable()->default(null); // use for authenticate admin

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
