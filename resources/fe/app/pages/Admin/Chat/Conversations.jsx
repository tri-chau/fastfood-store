import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import pusher from '../../../modules/pusher/pusher.jsx';
import {
    fetchChatHistory,
    fetchAdminConversations,
    receiveMessage,
    sendMessage,
    resetChatStatus,
} from '../../../redux/action/chatAction.js';
import connectApi from '../../../../settings/ConnectApi.js';
import { useAuth } from '../../../hooks/contexts/authContext/index.jsx';
import { getUserInfo } from '../../../modules/firebase/auth.js';
import usePusher from "../../../modules/pusher/pusher.jsx";

// import './Conversations.css';

const AdminConversations = () => {
    const dispatch = useDispatch();
    const { messages, loading, conversations } = useSelector((state) => state.chat);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
    const [hasFetchedConversation, setHasFetchedConversation] = useState(false);
    const [pusherReady, setPusherReady] = useState(false);
    const { currentUser, isPremiumUser } = useAuth();

    let pusher;
    try {
        pusher = usePusher();
        if (!pusherReady) {
            setPusherReady(true);
        }
    } catch (error) {
        console.log('Admin Conversation: Waiting for Pusher to be ready...');
    }

    useEffect(() => {
        if (currentUser && !hasFetchedConversation) {
            console.log('Dispatching admin conversations...');
            dispatch(fetchAdminConversations());
            setHasFetchedConversation(true);
        }
    }, [currentUser, dispatch, hasFetchedConversation]);

    useEffect(() => {
        if (selectedConversationId && currentUser) {
            console.log('Fetching chat history for conversation:', selectedConversationId);
            dispatch(fetchChatHistory(selectedConversationId));
        }
    }, [selectedConversationId, dispatch, currentUser]);

    useEffect(() => {
        if (pusherReady && selectedConversationId && currentUser) {
            console.log('Subscribing to channel:', `private-chat.${selectedConversationId}`);
            const channel = pusher.subscribe(`private-chat.${selectedConversationId}`);
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('Successfully subscribed to channel:', `private-chat.${selectedConversationId}`);
            });
            channel.bind('pusher:subscription_error', (error) => {
                console.error('Subscription error:', error);
            });
            channel.bind('message', (data) => {
                console.log('Received message via Pusher:', data);
                dispatch(receiveMessage(data));
            });

            return () => {
                console.log('Unsubscribing from channel:', `private-chat.${selectedConversationId}`);
                channel.unbind_all();
                channel.unsubscribe();
            };
        }
    }, [pusherReady, selectedConversationId, dispatch, currentUser]);


    // useEffect(() => {
    //     if (selectedConversationId && currentUser) {
    //         dispatch(fetchChatHistory(selectedConversationId));
    //         console.log('received conversation: ', selectedConversationId);
    //         const channel = pusher.subscribe(`private-chat.${selectedConversationId}`);
    //         channel.bind('message', (data) => {
    //             dispatch(receiveMessage(data));
    //         });
    //         return () => {
    //             channel.unbind_all();
    //             channel.unsubscribe();
    //         };
    //     }
    // }, [selectedConversationId, dispatch, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversationId) return;
        dispatch(sendMessage(selectedConversationId, messageInput));
        setMessageInput('');
        dispatch(resetChatStatus());
        scrollToBottom();
    };

    if (!currentUser) {
        return <p>Bạn không có quyền truy cập</p>;
    }

    return (
        <div className="flex h-screen">
            {/* Conversation List */}
            <div className="w-1/4 bg-gray-100 p-4 border-r">
                <h2 className="text-xl font-bold mb-4">Danh sách cuộc trò chuyện</h2>
                {loading && <p>Đang tải...</p>}
                {conversations?.conversations?.length > 0 ? (
                    conversations.conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-2 mb-2 cursor-pointer rounded-lg ${
                                selectedConversationId === conv.id ? 'bg-blue-200' : 'bg-white'
                            }`}
                            onClick={() => setSelectedConversationId(conv.id)}
                        >
                            <p className="font-semibold">
                                {conv.customers?.user?.name || 'Khách hàng'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {conv.latest_message?.text || 'Chưa có tin nhắn'}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Không có cuộc trò chuyện nào.</p>
                )}
            </div>

            {/* Chat Area */}
            <div className="w-3/4 p-4">
                {selectedConversationId ? (
                    <>
                        <div className="h-[calc(100vh-150px)] overflow-y-auto mb-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-2 p-2 rounded-lg ${
                                        msg.sender_id === currentUser.uid
                                            ? 'bg-blue-100 text-blue-800 ml-auto'
                                            : 'bg-gray-100 text-gray-800'
                                    } max-w-[85%]`}
                                >
                                    <p className="text-sm">{msg.message || msg.text}</p>
                                    <small className="text-xs text-gray-500">{msg.username}</small>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Nhập tin nhắn..."
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim()}
                            >
                                Gửi
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">Chọn một cuộc trò chuyện để bắt đầu.</p>
                )}
            </div>
        </div>
    );
};

export default AdminConversations;
