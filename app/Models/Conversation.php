<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;


class Conversation extends Model
{
    use HasFactory, HasUuid;
    protected $fillable = [
        'customer_id',
        'admin_id',
        'created_at',
        'updated_at',
    ];

    public function customers()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function admins()
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'id');
    }
    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'conversation_id', 'id')->latestOfMany('created_at');
    }

}
