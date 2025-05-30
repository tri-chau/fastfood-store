import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import pusher from '../../modules/pusher/pusher.jsx';
import {
    fetchOrCreateConversation,
    fetchChatHistory,
    receiveMessage,
    sendMessage,
    resetChatStatus,
} from '../../redux/action/chatAction';
import { useAuth } from '../../hooks/contexts/authContext/index.jsx';
import usePusher from "../../modules/pusher/pusher.jsx";

const ChatPopup = ({isVisible, closePopup, firebaseId}) => {
    const dispatch = useDispatch();
    const { messages, loading } = useSelector((state) => state.chat);
    const conversationId = useSelector((state) => state.chat.conversationId);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const { currentUser, isPremiumUser } = useAuth();
    const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
    const [hasFetchedConversation, setHasFetchedConversation] = useState(false);
    const [pusherReady, setPusherReady] = useState(false);
    let pusher;
    try {
        pusher = usePusher();
        if (!pusherReady) {
            setPusherReady(true);
        }
    } catch (error) {
        console.log('ChatPopup: Waiting for Pusher to be ready...');
    }

    // Fetch or create conversation when the popup is opened and customerId is available
    useEffect(() => {
        if (isVisible && firebaseId && currentUser) {
            dispatch(fetchOrCreateConversation());
            setHasFetchedConversation(true);
        }
    }, [isVisible, firebaseId, currentUser, dispatch, hasFetchedConversation]);

    useEffect(() => {
        if (conversationId && currentUser && !hasFetchedHistory) {
            dispatch(fetchChatHistory(conversationId));
            setHasFetchedHistory(true);
        }
    }, [conversationId, dispatch, currentUser, hasFetchedHistory]);

    useEffect(() => {
        if (pusherReady && conversationId && currentUser) {
            console.log("conversationId received: ", conversationId);
            console.log('Subscribing to channel:', `private-chat.${conversationId}`);
            const channel = pusher.subscribe(`private-chat.${conversationId}`);
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('Successfully subscribed to channel:', `private-chat.${conversationId}`);
            });
            channel.bind('pusher:subscription_error', (error) => {
                console.error('Subscription error:', error);
            });
            channel.bind('message', (data) => {
                console.log('Received message via Pusher:', data);
                dispatch(receiveMessage(data));
            });

            return () => {
                console.log('Unsubscribing from channel:', `chat.${conversationId}`);
                channel.unbind_all();
                channel.unsubscribe();
            };
        }
    }, [pusherReady, conversationId, dispatch, currentUser]);


    // // Fetch chat history and establish Pusher subscription
    // useEffect(() => {
    //     if (conversationId && currentUser) {
    //         dispatch(fetchChatHistory(conversationId));
    //         console.log('Subscribing to channel:', `chat.${conversationId}`);
    //         const channel = pusher.subscribe(`private-chat.${conversationId}`);
    //         channel.bind('pusher:subscription_succeeded', () => {
    //             console.log('Successfully subscribed to channel:', `private-chat.${conversationId}`);
    //         });
    //         channel.bind('pusher:subscription_error', (error) => {
    //             console.error('Subscription error:', error);
    //         });
    //         channel.bind('message', (data) => {
    //             console.log('Received message via Pusher:', data);
    //             dispatch(receiveMessage(data));
    //         });
    //         return () => {
    //             console.log('Unsubscribing from channel:', `chat.${conversationId}`);
    //             channel.unbind_all();
    //             channel.unsubscribe();
    //         };
    //     }
    // }, [conversationId, dispatch, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        console.log(messageInput + ' ' + conversationId);
        if (!messageInput.trim() || !conversationId) return;
        dispatch(sendMessage(conversationId, messageInput));
        setMessageInput('');
        dispatch(resetChatStatus());
    };

    if (!isVisible || !currentUser) {
        return null;
    }

    return (
        <div
            className="fixed top-0 right-0 m-4 w-200 max-h-[80vh] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
            <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
                <h5 className="text-lg font-semibold">Hỗ trợ khách hàng</h5>
                <button
                    className="text-white hover:text-gray-200 focus:outline-none"
                    onClick={closePopup}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div className="p-3 overflow-y-auto max-h-[calc(80vh-160px)] min-h-[300px]">
                {loading && <p className="text-center text-gray-500">Đang tải...</p>}
                {messages.length === 0 && !loading && (
                    <p className="text-center text-gray-400">Chưa có tin nhắn.</p>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg ${
                            msg.sender_id === currentUser.uid
                                ? 'bg-blue-100 text-blue-800 ml-auto'
                                : 'bg-gray-100 text-gray-800'
                        } max-w-[85%] shadow-sm`}
                    >
                        <p className="text-sm">{msg.message || msg.text}</p>
                        <small className="text-xs text-gray-500">{msg.username}</small>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-200">
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
            </div>
        </div>
    );
};

export default ChatPopup;
