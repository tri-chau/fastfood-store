import connectApi from "../../../settings/ConnectApi.js";
import {
    FETCH_DISTRICTS_PROCESS, FETCH_DISTRICTS_SUCCESS,
    FETCH_PROVINCES_PROCESS,
    FETCH_PROVINCES_SUCCESS,
    FETCH_WARDS_PROCESS, FETCH_WARDS_SUCCESS
} from "../constant/paymentType.js";


export const fetchProvinces = () => async (dispatch) => {
    dispatch({ type: FETCH_PROVINCES_PROCESS });

    const { data } = await connectApi.get("/api/ghn/provinces");

    console.log(data);

    dispatch({ type: FETCH_PROVINCES_SUCCESS, payload: data });
}

export const fetchDistricts = (provinceId) => async (dispatch) => {
    dispatch({ type: FETCH_DISTRICTS_PROCESS });

    const { data } = await connectApi.get(`/api/ghn/districts`, { params: { province_id: provinceId } });

    dispatch({ type: FETCH_DISTRICTS_SUCCESS, payload: data });
}

export const fetchWards = (districtId) => async (dispatch) => {
    dispatch({ type: FETCH_WARDS_PROCESS });

    const { data } = await connectApi.get(`/api/ghn/wards`, { params: { district_id: districtId } });

    dispatch({ type: FETCH_WARDS_SUCCESS, payload: data });
}

export const createPaymentLink = (order_id) => async (dispatch) => {
    dispatch({ type: "CREATE_PAYMENT_LINK_PROCESS" });

    const response = await connectApi.post("/api/payos/create-payment-link", {order_id: order_id});

    dispatch({ type: "CREATE_PAYMENT_LINK_SUCCESS", payload: response.data });
}

export const customerCancelOrder = (order_id) => async (dispatch) => {
    dispatch({ type: "CANCEL_ORDER_PROCESS" });

    const response = await connectApi.post("/api/customer/cancelOrder", {order_id: order_id});

    dispatch({ type: "CANCEL_ORDER_SUCCESS", payload: response.data });
}

export const resetPaymentLink = () => async (dispatch) => {
    dispatch({ type: "RESET_PAYMENT_LINK" });
}
