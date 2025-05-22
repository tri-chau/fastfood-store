<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class  Product extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;
    protected $fillable = [
        'id',
        'name',
        'description',
        'image',
        'status',
        'price',
        'cost',
        'up_m_price',
        'up_l_price',
        'is_topping',
        'priority',
    ];
    public function categories()
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }
    public function reviews()
    {
        return $this->hasMany(Reviews::class, 'product_id', 'id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'product_id');
    }

    public function tags() //not in use
    {
        return $this->belongsToMany(Tag::class);
    }
    public function vouchers() //not in use
    {
        return $this->belongsToMany(Voucher::class);
    }
    public function toppings() //not in use
    {
        return $this->belongsToMany(Product::class, 'products_toppings', 'product_id', 'topping_id')
                    ->withTimestamps()
                    ->withPivot('extra_price');
    }

    public function productsToppingThis() //not in use
    {
        return $this->belongsToMany(Product::class, 'products_toppings', 'topping_id', 'product_id')
                    ->withTimestamps()
                    ->withPivot('extra_price');
    }

    public function creator() //not in use
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function team() //not in use
    {
        return $this->belongsTo(Team::class); // Singular: "team"
    }

    public function images() //not in use
    {
        return $this->hasMany(ProductImage::class, 'product_id');
    }

}
