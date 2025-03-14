<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;
    protected $fillable = [
        'vourcher_code',
        'status',
        'start_date',
        'end_date',
        'discount_type',
        'discount_amount',
        'discount_percent',
        'config',
        'minimum',
        'limit_per_order',
        'apply_type',
        'limit'
    ];
    public function teams()
    {
        return $this->belongsToMany(Team::class);
    }
    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function team()
    {
        return $this->belongsTo(Team::class); // Singular: "team"
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_voucher');
    }
}
