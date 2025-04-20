<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Customer extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;
    protected $fillable = [
        'id',
        'date_registered',
        'date_of_birth',
        'full_name',
        'gender',
        'phone_number',
        'email',
        'user_id',
        'created_by',
        'province',
        'district',
        'ward',
        'street',
        'customer_number'
    ];

    protected static function booted()
    {
        static::creating(function ($customer) {
            $customer->date_registered = $customer->date_registered ?? Carbon::now();
        });
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversation(){
        return $this->hasOne(Conversation::class, 'customer_id', 'id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class, 'customer_id', 'id');
    }

    public function order()
    {
        return $this->hasMany(Order::class, 'customer_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(Reviews::class, 'customer_id', 'id');
    }

    public function creator() //not in use
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Customer.php
    public function orders() //not in use
    {
        return $this->belongsToMany(Order::class, 'customers_orders')
            ->using(CustomerOrder::class) // Use the CustomerOrder pivot model
            ->withPivot('id') // Include the pivot table's ID
            ->withTimestamps();
    }
}
