<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
// use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Reviews extends Model
{
    use HasFactory, HasUUid;
    protected $fillable = [
        'id',
        'customer_id',
        'product_id',
        'order_detail_id',
        'rating',
        'comment',
        'is_edited'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
    public function orderDetail()
    {
        return $this->belongsTo(OrderDetail::class, 'order_detail_id', 'id');
    }
    public function reviews()
    {
        return $this->hasManyThrough(Reviews::class, OrderDetail::class, 'order_id', 'order_detail_id', 'id', 'id');
    }
}
