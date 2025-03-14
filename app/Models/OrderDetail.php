<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory, HasUuid;
    protected $fillable = [
        'customer_order_id',
        'product_id',
        'parent_id',
        'order_detail_number',
        'quantity',
        'total_price',
        'note',
        'size',
    ];

    // Relationship with the customer_order (pivot table)
    public function customerOrder()
    {
        return $this->belongsTo(CustomerOrder::class, 'customer_order_id');
    }

    // Relationship with the product
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // Self-referential relationship for toppings (parent-child)
    public function parent()
    {
        return $this->belongsTo(OrderDetail::class, 'parent_id');
    }

    public function toppings()
    {
        return $this->hasMany(OrderDetail::class, 'parent_id');
    }
}
