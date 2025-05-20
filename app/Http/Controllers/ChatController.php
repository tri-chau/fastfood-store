<?php

namespace App\Http\Controllers;

use App\Events\Message;
use App\Models\Conversation;
use App\Models\Message as MessageModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{

    public function checkFirebaseUser(Request $request)
    {
        \Log::debug('Checking Firebase user');
        $firebaseUser = $request->attributes->get('firebaseUser');
        if (!$firebaseUser) {
            \Log::info('cant find user firebase id'); // Ghi log
            return null;
        }

        \Log::info('Firebase user attributes:', $firebaseUser);
        // Tìm user trong database dựa vào Firebase UID
        return User::where('firebase_uid', $firebaseUser['sub'])->first();
    }


    public function message(Request $request)
    {
        $user = $this->checkFirebaseUser($request);
        $conversationId = $request->input('conversation_id');
        \Log::debug('User: ' . $user);
        \Log::debug('Conversation ID: ' . $conversationId);
        $messageText = $request->input('message');
        // Validate input
        $request->validate([
            'conversation_id' => 'required|uuid|exists:conversations,id',
            'message' => 'required|string',
        ]);
        \Log::debug('message validated');
        // Save message to database
        $message = MessageModel::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'text' => $messageText,
            'status' => 'sent',
            'is_seen' => false,
        ]);
        // Broadcast message
        event(new Message(
            username: $user->name,
            message: $messageText,
            conversation_id: $conversationId,
            sender_id: $user->id,
            receiver_id: $this->getReceiverId($conversationId, $user->id),
        ));
        \Log::debug('Message event broadcasted:', [
            'channel' => 'chat.' . $conversationId,
            'event' => 'message',
            'data' => [
                'username' => $user->name,
                'message' => $messageText,
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $this->getReceiverId($conversationId, $user->id),
            ],
        ]);
        return response()->json(['status' => 'success']);
    }

    public function getConversation(Request $request)
    {
        \Log::debug('getConversation called', ['conversation_id' => $request->query('conversation_id')]);
        $user = $this->checkFirebaseUser($request);
        \Log::debug('User: ' . $user);
        $customer = \App\Models\Customer::where('user_id', $user->id)->first();
        $customerId = $customer?->id ?? null;
        \Log::debug('Customer ID: ' . $customerId);
        if (!$customerId && !$user->is_admin) {
            return response()->json(['error' => 'Người dùng không hợp lệ'], 403);
        }
        // Create conversation for customer only
        if ($customerId) {
            $admin = User::where('is_admin', true)
                ->whereNotNull('custom_token')
                ->first();
            \Log::debug('Admin ID: ' . $admin->id);
            $conversation = Conversation::where('customer_id', $customerId)
                ->where('admin_id', $admin->id)
                ->first();
            if (!$conversation) {
                $conversation = Conversation::create([
                    'customer_id' => $customerId,
                    'admin_id' => $admin->id,
                    'created_at' => now(),
                ]);
            }
            \Log::debug('Conversation: ', $conversation->toArray());
            return response()->json($conversation);
        }
        return response()->json(['error' => 'Chỉ khách hàng mới tạo được conversation'], 403);
    }

    public function getChatHistory(Request $request)
    {
        \Log::debug('getChatHistory called', ['conversation_id' => $request->query('conversation_id')]);
        $conversationId = $request->query('conversation_id');

        $validator = \Validator::make($request->all(), [
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json(['error' => 'Invalid conversation ID'], 400);
        }
        \Log::debug('getChatHistory validated');

        $messages = MessageModel::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function getAdminConversations(Request $request)
    {
        \Log::debug('getAdminConversations called');
        $user = $this->checkFirebaseUser($request);
        if (!$user->is_admin) {
            return response()->json(['error' => 'Chỉ admin mới xem được danh sách conversation'], 403);
        }

        $conversations = Conversation::where('admin_id', $user->id)
            ->with(['customers.user', 'latestMessage']) // dùng latestMessage mới thêm
            ->get();

        return response()->json([
            'conversations' => $conversations
        ]);
    }


    private function getReceiverId($conversationId, $senderId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        return $conversation->customer_id === $senderId ? $conversation->admin_id : $conversation->customer_id;
    }

    private function getAvailableAdminId()
    {
        // Cải thiện logic để chọn admin (ví dụ: phân bổ theo lượt hoặc trạng thái online)
        return User::where('is_admin', true)->first()->id;
    }
}
