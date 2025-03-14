<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;
    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'ward',
        'created_by',
        'description'
    ];
    public function vouchers()
    {
        return $this->belongsToMany(Voucher::class);
    }
    // In Team.php (Team model)
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
