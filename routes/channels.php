<?php

use Illuminate\Support\Facades\Broadcast;



Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    \Log::info('Authorizing channel', ['user_id' => $user->id, 'conversation_id' => $conversationId]);
    $conversation = \App\Models\Conversation::findOrFail($conversationId);
    // Nếu user là admin, kiểm tra admin_id
    if ($user->is_admin == 1) {
        $result = $user->id == $conversation->admin_id;
        \Log::debug('Admin channel authorization result', ['result' => $result]);
        return $result;
    }
    // Lấy customer_id từ bảng customers dựa trên user->id
    $customer = \App\Models\Customer::where('user_id', $user->id)->first();
    if (!$customer) {
        \Log::error('Customer not found for user', ['user_id' => $user->id]);
        return false;
    }
    \Log::debug('Customer found', ['customer_id' => $customer->id]);
    $result = $customer->id == $conversation->customer_id || $user->id == $conversation->admin_id;
    \Log::debug('Channel authorization result', ['result' => $result]);
    return $result;
});

