import {
    ADMIN_GET_CATEGORIES_FAIL,
    ADMIN_GET_CATEGORIES_PROCESS, ADMIN_GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES_FAIL,
    GET_CATEGORIES_PROCESS,
    GET_CATEGORIES_SUCCESS,
} from "../constant/categoriesType";

import connectApi from "../../../settings/ConnectApi.js";

export const getCategories = () => async (dispatch) => {
    try {
        dispatch({type: GET_CATEGORIES_PROCESS});

        const {data} = await connectApi.get("/api/categories/options/all");

        dispatch({type: GET_CATEGORIES_SUCCESS, payload: data});
    } catch (error) {
        dispatch({type: GET_CATEGORIES_FAIL, payload: error});
    }
};

export const createCategory = (category) => async (dispatch) => {
    try {
        dispatch({type: GET_CATEGORIES_PROCESS});

        const {data} = await connectApi.post("/api/admin/categories/add", category);

        dispatch({type: GET_CATEGORIES_SUCCESS, payload: data});
    } catch (error) {
        dispatch({type: GET_CATEGORIES_FAIL, payload: error});
    }
};

export const adminGetAllCategories = () => async (dispatch) => {
    try {
        dispatch({type: ADMIN_GET_CATEGORIES_PROCESS});

        const {data} = await connectApi.get("/api/admin/categories/all");

        dispatch({type: ADMIN_GET_CATEGORIES_SUCCESS, payload: data});
    } catch (error) {
        dispatch({type: ADMIN_GET_CATEGORIES_FAIL, payload: error});
    }
}
