import {
    GET_REVIEW_PROCESS,
    GET_REVIEW_SUCCESS,
    GET_REVIEWS_PROCESS,
    GET_REVIEWS_SUCCESS,
    GET_REVIEWS_BY_RATING_PROCESS,
    GET_REVIEWS_BY_RATING_SUCCESS,
    CREATE_REVIEW_PROCESS,
    CREATE_REVIEW_SUCCESS,
    UPDATE_REVIEW_PROCESS,
    UPDATE_REVIEW_SUCCESS,
    DELETE_REVIEW_PROCESS,
    DELETE_REVIEW_SUCCESS
} from "../constant/reviewsType.js";

import connectApi from "../../../settings/ConnectApi.js";

// 1. get a single review using id's
export const getSingleReview = (id) => async (dispatch) => {
    dispatch({type: GET_REVIEW_PROCESS});

    const {data} = await connectApi.get(`/api/customer/review/${id}`);

    dispatch({type: GET_REVIEW_SUCCESS, payload: data});
    return data;
};

export const getReview = (product_Id) => async (dispatch) => {
    dispatch({ type: GET_REVIEW_PROCESS });
    try {
        const { data } = await connectApi.get('/api/customer/review/by-product', {
            params: { product_id: product_Id }
        });
        dispatch({ type: GET_REVIEW_SUCCESS, payload: data });
        return data;
    } catch (error) {
        dispatch({ type: GET_REVIEW_SUCCESS, payload: null });
    }
};

// 2. get all the reviews with limit
export const getAllReviews = (limit, form) => async (dispatch) => {
    dispatch({type: GET_REVIEWS_PROCESS});

    const {data} = await connectApi.get(`/api/customer/reviews/all?limit=${limit}`, {params: form});

    dispatch({type: GET_REVIEWS_SUCCESS, payload: data});
    return data;
};

// export const adminGetAllReviews = () => async (dispatch) => {
//     dispatch({type: GET_REVIEWS_PROCESS});

//     const {data} = await connectApi.get(`/api/admin/reviews/all`);

//     dispatch({type: GET_REVIEWS_SUCCESS, payload: data});
// };

// 3. function for displaying review name as search result on input
    // 

// 4. function to get review from searching parameters and filter
export const getSearchResults =
    (params, min = 0, max = 99999, avgRating = 0) =>
        async (dispatch) => {

        };

// 5. Get the reviesws by rating
export const getReviewsByRating = (rating) => async (dispatch) => {
    dispatch({type: GET_REVIEWS_BY_RATING_PROCESS});

    const {data} = await connectApi.get(`/api/customer/reviews/rating/${rating}`);

    dispatch({type: GET_REVIEWS_BY_RATING_SUCCESS, payload: data});
    return data;
}

export const createReview = (formData) => async (dispatch) => {
    dispatch({type: CREATE_REVIEW_PROCESS});

    const {data} = await connectApi.post(`/api/customer/review/add`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    dispatch({type: CREATE_REVIEW_SUCCESS, payload: data});
}

export const updateReview = (id, formData) => async (dispatch) => {
    dispatch({type: UPDATE_REVIEW_PROCESS});

    const {data} = await connectApi.put(`/api/customer/review/update/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    dispatch({type: UPDATE_REVIEW_SUCCESS, payload: data});
}

export const deleteReview = (id) => async (dispatch) => {
    dispatch({type: DELETE_REVIEW_PROCESS});

    const {data} = await connectApi.delete(`/api/customer/review/delete/${id}`);

    dispatch({type: DELETE_REVIEW_SUCCESS, payload: data});
}