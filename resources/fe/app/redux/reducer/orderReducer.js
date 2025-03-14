const orders = {
    orders: [],
    loading: false
}

const updateOrder = {
    loading: false
}

export const orderReducer = (state = orders, action) => {
    switch (action.type) {
        case 'GET_ORDERS_PROCESS' || 'GET_ORDERS_ADMIN_PROCESS':
            return {...state, loading: true};

        case 'GET_ORDERS_SUCCESS' || 'GET_ORDERS_ADMIN_SUCCESS':
            return {
                ...state,
                orders: action.payload.data,
                loading: false,
            };

        default:
            return state;
    }
}

export const updateOrderReducer = (state = updateOrder, action) => {
    switch (action.type) {
        case 'ADMIN_UPDATE_ORDER_PROCESS' || 'ADMIN_DELETE_ORDER_PROCESS':
            return {...state, loading: true};

        case 'ADMIN_UPDATE_ORDER_SUCCESS' || 'ADMIN_DELETE_ORDER_SUCCESS':
            return {
                ...state,
                loading: false,
            };

        default:
            return state;
    }
}

