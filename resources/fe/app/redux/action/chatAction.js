import connectApi from '../../../settings/ConnectApi';
import axios from 'axios';
import {
    FETCH_CONVERSATION_PROCESS,
    FETCH_ADMIN_CONVERSATION_SUCCESS,
    FETCH_CUSTOMER_CONVERSATION_SUCCESS,
    FETCH_CONVERSATION_FAIL,
    FETCH_CHAT_HISTORY_PROCESS,
    FETCH_CHAT_HISTORY_SUCCESS,
    FETCH_CHAT_HISTORY_FAIL,
    SEND_MESSAGE_PROCESS,
    SEND_MESSAGE_SUCCESS,
    SEND_MESSAGE_FAIL,
    RECEIVE_MESSAGE,
    RESET_CHAT_STATUS,
} from '../constant/chatType';


// Fetch or create conversation
export const fetchOrCreateConversation = () => async (dispatch) => {
    dispatch({ type: FETCH_CONVERSATION_PROCESS });
    console.log('Fetching or creating conversation...');
    try {
        const  response  = await connectApi.get(`/api/getConversation`); // API từ ChatController
        console.log('Conversation response:', response.data);
        dispatch({ type: FETCH_CUSTOMER_CONVERSATION_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({ type: FETCH_CONVERSATION_FAIL, payload: error.message });
        console.error('Error fetching or creating conversation:', error);
    }
};

export const fetchChatHistory = (conversationId) => async (dispatch) => {
    dispatch({ type: FETCH_CHAT_HISTORY_PROCESS });
    try {
        console.log('fetchChat history called');
        const { data } = await connectApi.get('/api/chat-history', {
            params: { conversation_id: conversationId },
        });
        console.log('Fetching chat history successfully');
        console.log('Chat history response:', data);
        dispatch({ type: FETCH_CHAT_HISTORY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: FETCH_CHAT_HISTORY_FAIL, payload: error.message });
        console.error('Lỗi lấy lịch sử chat:', error);
    }
};

export const fetchAdminConversations = () => async (dispatch) => {
    dispatch({ type: FETCH_CONVERSATION_PROCESS });
    try {
        console.log('Fetching admin conversations...');
        const { data } = await connectApi.get('/api/admin-conversations');
        console.log('Admin conversation response:', data);
        dispatch({ type: FETCH_ADMIN_CONVERSATION_SUCCESS, payload: data });
    } catch (error) {
        console.error('Lỗi lấy danh sách conversation:', error);
    }
};

export const sendMessage = (conversationId, message) => async (dispatch) => {
    dispatch({ type: SEND_MESSAGE_PROCESS });
    try {
        console.log('sendMessage action called');
        await connectApi.post('/api/messages', {
            conversation_id: conversationId,
            message,
        });
        dispatch({ type: SEND_MESSAGE_SUCCESS });
    } catch (error) {
        dispatch({ type: SEND_MESSAGE_FAIL, payload: error.message });
        console.error('Lỗi gửi tin nhắn:', error);
    }
};

export const receiveMessage = (message) => ({
    type: RECEIVE_MESSAGE,
    payload: message,
});

export const resetChatStatus = () => ({
    type: RESET_CHAT_STATUS,
});
