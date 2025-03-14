<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;

    protected $fillable = [
        'id',
        'name',
        'description',
        'type',
        'priority',
        'show_for_customer',
        'image_path',
        'created_by',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
