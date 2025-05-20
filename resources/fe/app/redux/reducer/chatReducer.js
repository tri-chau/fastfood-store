import {
    FETCH_CONVERSATION_PROCESS,
    FETCH_ADMIN_CONVERSATION_SUCCESS,
    FETCH_CUSTOMER_CONVERSATION_SUCCESS,
    FETCH_CHAT_HISTORY_PROCESS,
    FETCH_CHAT_HISTORY_SUCCESS,
    SEND_MESSAGE_PROCESS,
    SEND_MESSAGE_SUCCESS,
    RECEIVE_MESSAGE,
    RESET_CHAT_STATUS,
    FETCH_CONVERSATION_FAIL,
    FETCH_CHAT_HISTORY_FAIL,
    SEND_MESSAGE_FAIL,
} from '../constant/chatType';

const initialState = {
    conversationId: null,
    conversations: [], // Thêm để lưu danh sách conversation
    messages: [],
    loading: false,
    success: false,
    error: null,
};

export const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_CONVERSATION_PROCESS:
        case FETCH_CHAT_HISTORY_PROCESS:
        case SEND_MESSAGE_PROCESS:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_CUSTOMER_CONVERSATION_SUCCESS:
            return {
                ...state,
                conversationId: action.payload.id, //payload trả về là id thì phải .id
                loading: false,
            };
        case FETCH_ADMIN_CONVERSATION_SUCCESS:
            return {
                ...state,
                conversations: action.payload,
                loading: false,
            };
        case FETCH_CONVERSATION_FAIL:
            return { ...state, loading: false, error: action.payload };

        case FETCH_CHAT_HISTORY_SUCCESS:
            return {
                ...state,
                messages: action.payload,
                loading: false,
            };
        case FETCH_CHAT_HISTORY_FAIL:
            return { ...state, loading: false, error: action.payload };

        case SEND_MESSAGE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
            };
        case SEND_MESSAGE_FAIL:
            return { ...state, loading: false, error: action.payload };

        case RECEIVE_MESSAGE:
            const newMsg = action.payload;
            // Cập nhật latest_message trong conversations
            const updatedConversations = state.conversations?.conversations?.map(conv => {
                if (conv.id === newMsg.conversation_id) {
                    return {
                        ...conv,
                        latest_message: {
                            text: newMsg.message || newMsg.text,
                            sender_id: newMsg.sender_id,
                            created_at: newMsg.created_at,
                        }
                    };
                }
                return conv;
            });

            return {
                ...state,
                messages: [...state.messages, newMsg],
                conversations: {
                    ...state.conversations,
                    conversations: updatedConversations,
                },
            };

        case RESET_CHAT_STATUS:
            return {
                ...state,
                loading: false,
                success: false,
                error: null,
            };

        default:
            return state;
    }
};
