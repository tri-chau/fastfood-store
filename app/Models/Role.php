<?php

namespace App\Models;

use App\Models\Concerns\HasCreatedBy;
use App\Models\Concerns\HasUuid;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends \Spatie\Permission\Models\Role
{
    use HasFactory, HasUuid, HasCreatedBy;

    protected $fillable = [
        'id',
        'name',
        'guard_name',
        'description',
        'is_admin',
        'apply_team_visibility',
    ];

    // Define an accessor for 'is_admin'
    public function getIsAdminAttribute($value)
    {
        return (bool) $value; // Convert 1 to true, 0 to false
    }

    // Define an accessor for 'apply_team_visibility'
    public function getApplyTeamVisibilityAttribute($value)
    {
        return (bool) $value; // Convert 1 to true, 0 to false
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
