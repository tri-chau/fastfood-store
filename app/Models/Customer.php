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
    // Customer.php
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'customers_orders')
            ->using(CustomerOrder::class) // Use the CustomerOrder pivot model
            ->withPivot('id') // Include the pivot table's ID
            ->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
