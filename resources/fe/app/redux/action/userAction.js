import {
    LOGIN_PROCESS,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_PROCESS,
    LOGOUT_SUCCESS,
    GET_USER_INFO_FAIL,
    GET_USER_INFO_SUCCESS,
    RESET_STATUS,
    REGISTER_PROCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL, ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAIL, ADMIN_LOGIN_PROCESS,
} from "../constant/userType";
import Cookies from "js-cookie";
import connectApi from "../../../settings/ConnectApi.js";
import axios from "axios";

export const userLogin = (input) => async (dispatch) => {
    try {
        dispatch({type: LOGIN_PROCESS});

        const response = await connectApi.post("/api/auth/login", {
            email: input.phone,
            password: input.password,
        });

        const data = response.data;
        if (data.data.user.is_admin === 1) {
            Cookies.set("role", "admin");
        }

        Cookies.set("accessToken", data.data.accessToken, {
            expires: 15 / (24 * 60), // 15 minutes
        });

        Cookies.set("refreshToken", data.data.refreshToken, {
            expires: 30, // 30 days
        });

        dispatch({
            type: LOGIN_SUCCESS,
        });
    } catch (error) {
        dispatch({type: LOGIN_FAIL, payload: error.message});
    }
};

export const getUserInfo = () => async (dispatch) => {
    try {
        const response = await connectApi.get("/auth/me", {
            headers: {
                Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
        });

        dispatch({type: GET_USER_INFO_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: GET_USER_INFO_FAIL, payload: error});
    }
};

export const getRefreshToken = () => async (dispatch) => {
    try {
        const oldRefreshToken = Cookies.get("refreshToken");

        const response = await connectApi.post("/api/auth/refresh", {
            refreshToken: oldRefreshToken,
        });

        console.log(response.data);

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        Cookies.set("accessToken", newAccessToken, {
            expires: 15 / (24 * 60), // 15 minutes
        });

        if (newRefreshToken) {
            Cookies.set("refreshToken", newRefreshToken, {
                expires: 30, // 30 days
            });
        }

        dispatch({type: "GET_REFRESH_TOKEN_SUCCESS"});
    } catch (error) {
        dispatch({type: "GET_REFRESH_TOKEN_FAIL", payload: error.message});
    }
};

export const resetStatus = () => async (dispatch) => {
    dispatch({type: RESET_STATUS});
};

export const userRegister = (input, firebase_uid) => async (dispatch) => {
    try {
        dispatch({type: REGISTER_PROCESS});

        const response = await connectApi.post("/api/auth/register", {
            name: input.name,
            email: input.email,
            phone_number: input.phone_number,
            date_of_birth: input.date_of_birth,
            gender: input.gender,
            password: input.password,
            c_password: input.c_password,
            firebase_uid: firebase_uid,
            auth_type: input.auth_type,
        });

        dispatch({type: REGISTER_SUCCESS});
    } catch (error) {
        let errorMessage = "Something went wrong!";

        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
        }

        dispatch({type: REGISTER_FAIL, payload: error.errorMessage});

        throw new Error(errorMessage);
    }
}




