import connectApi from "../../../settings/ConnectApi.js";
import {
    ADMIN_DELETE_ORDER_PROCESS, ADMIN_DELETE_ORDER_SUCCESS,
    ADMIN_UPDATE_ORDER_PROCESS,
    ADMIN_UPDATE_ORDER_SUCCESS,
    GET_ORDERS_PROCESS, GET_ORDERS_SEARCH_PROCESS, GET_ORDERS_SEARCH_SUCCESS,
    GET_ORDERS_SUCCESS
} from "../constant/orderType.js";

export const getAllOrders = (limit, form) => async (dispatch) => {
    dispatch({ type: GET_ORDERS_PROCESS });

    const { data } = await connectApi.get(`/api/loadCustomerOrders`, {params: form});

    dispatch({ type: GET_ORDERS_SUCCESS, payload: data });
}

export const getAllOrdersAdmin = () => async (dispatch) => {
    dispatch({ type: GET_ORDERS_PROCESS });

    const { data } = await connectApi.get(`/api/admin/orders/all`);

    dispatch({ type: GET_ORDERS_SUCCESS, payload: data });
}

// export const getSearchOrdersAdmin = (form) => async (dispatch) => {
//     dispatch({ type: GET_ORDERS_SEARCH_PROCESS });
//
//     const { data } = await connectApi.get(`/api/admin/orders/search`, {
//         params: form,
//     });
//
//     dispatch({ type: GET_ORDERS_SEARCH_SUCCESS, payload: data });
// };

export const getSearchOrdersAdmin = (searchText) => async (dispatch) => {
    dispatch({ type: 'GET_ORDERS_SEARCH_PROCESS' });

    try {
        console.log("Searching orders with text:", searchText);
        console.log("TYPE:", typeof searchText);
        console.log("VALUE:", searchText);
        const { data } = await connectApi.get(`/api/admin/orders/search`, {
            params: { searchText } // Gửi dưới dạng tham số query
        });

        dispatch({ type: 'GET_ORDERS_SEARCH_SUCCESS', payload: data.data });
    } catch (error) {
        dispatch({ type: 'GET_ORDERS_SEARCH_FAIL', payload: error.message });
    }
};


export const adminUpdateOrder = (id, form) => async (dispatch) => {
    dispatch({ type: ADMIN_UPDATE_ORDER_PROCESS });

    const { data } = await connectApi.post(`/api/admin/orders/update/${id}`, form);

    dispatch({ type: ADMIN_UPDATE_ORDER_SUCCESS, payload: data });
}

export const adminDeleteOrder = (id) => async (dispatch) => {
    dispatch({ type: ADMIN_DELETE_ORDER_PROCESS });

    const { data } = await connectApi.delete(`/api/admin/orders/delete/${id}`);

    dispatch({ type: ADMIN_DELETE_ORDER_SUCCESS, payload: data });
}
