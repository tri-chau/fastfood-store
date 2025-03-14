<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory, HasUuid, HasCreatedBy;
    protected $fillable = [
        'full_name',
        'email',
        'phone_number',
        'date_of_birth',
        'gender',
        'team_id',
        'level',
        'user_id',
        'created_by',
        'date_registered',
    ];
    // Corrected relationship methods
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Singular: "user"
    }

    public function team()
    {
        return $this->belongsTo(Team::class); // Singular: "team"
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
