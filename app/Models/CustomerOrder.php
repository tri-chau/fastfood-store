<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CustomerOrder extends Pivot
{
    use HasFactory, HasUuid;
    protected $fillable = [
        'id',
        'customer_id',
        'order_id',
    ];
    protected $table = 'customers_orders';

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'customer_order_id');
    }
}
