<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Address extends Model
{
    use HasFactory, HasUuid;
    protected $fillable = [
        'customer_id',
        'address',
        'ward',
        'city',
        'house_number',
        'full_address',
        'created_at',
        'updated_at',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'address_id', 'id');
    }
}
