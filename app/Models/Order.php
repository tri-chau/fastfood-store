<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    protected $fillable = [
        'id',
        'order_number',
        'address_id',
        'customer_id',
        'receiver_name',
        'receiver_address',
        'receiver_phone',
        'payment_method',
        'payment_status',
        'order_status',
        'order_total',
        'note',
        'rate',
        'customer_feedback',
        'host_id',
        'source',
        'team_id',
        'created_by',
        'custom_name',
        'type',
        'province',
        'district',
        'ward',
        'street',
        'shipping_fee',
        'payment_link'
    ];

    use HasFactory, HasUuid, HasCreatedBy, SoftDeletes;

    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function orderdetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id', 'id');
    }
    // Relationship with the host customer
    public function host()  //not in use
    {
        return $this->belongsTo(Customer::class, 'host_id');
    }

    // Many-to-Many relationship with customers

    public function customers()  //not in use
    {
        return $this->belongsToMany(Customer::class, 'customers_orders')
            ->using(CustomerOrder::class) // Use the CustomerOrder pivot model
            ->withPivot('id') // Include the pivot table's ID
            ->withTimestamps();
    }
    public function creator() //not in use
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function team() //not in use
    {
        return $this->belongsTo(Team::class); // Singular: "team"
    }

    public function vouchers() { //not in use
        return $this->belongsToMany(Voucher::class, 'order_voucher');
    }
}
