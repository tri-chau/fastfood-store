import {
    CREATE_PAYMENT_LINK_PROCESS, CREATE_PAYMENT_LINK_SUCCESS,
    FETCH_DISTRICTS_PROCESS,
    FETCH_DISTRICTS_SUCCESS,
    FETCH_PROVINCES_PROCESS,
    FETCH_PROVINCES_SUCCESS, FETCH_WARDS_PROCESS, FETCH_WARDS_SUCCESS, RESET_PAYMENT_LINK
} from "../constant/paymentType.js";


const provinces = {
    provinces: null,
    loading: false
};

const districts = {
    districts: null,
    loading: false
};

const wards = {
    wards: null,
    loading: false
};

const payment = {
    paymentLink: null,
    loading: false
}

export const provinceReducer = (state = provinces, action) => {
    switch (action.type) {
        case FETCH_PROVINCES_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case FETCH_PROVINCES_SUCCESS:
            return {
                ...state,
                provinces: action.payload.data,
                loading: false,
            };

        default:
            return state;
    }
}

export const districtReducer = (state = districts, action) => {
    switch (action.type) {
        case FETCH_DISTRICTS_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case FETCH_DISTRICTS_SUCCESS:
            return {
                ...state,
                districts: action.payload.data,
                loading: false,
            };

        default:
            return state;
    }
}

export const wardReducer = (state = wards, action) => {
    switch (action.type) {
        case FETCH_WARDS_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case FETCH_WARDS_SUCCESS:
            return {
                ...state,
                wards: action.payload.data,
                loading: false,
            };

        default:
            return state;
    }
}

export const paymentReducer = (state = payment, action) => {
    switch (action.type) {
        case CREATE_PAYMENT_LINK_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case CREATE_PAYMENT_LINK_SUCCESS:
            return {
                ...state,
                paymentLink: action.payload.checkoutUrl,
                loading: false,
            };

        case RESET_PAYMENT_LINK:
            return {
                ...state,
                paymentLink: null,
                loading: false,
            };

        default:
            return state;
    }
}
