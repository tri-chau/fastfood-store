import {
    GET_PRODUCTS_PROCESS,
    GET_PRODUCTS_SUCCESS,
    GET_PRODUCT_PROCESS,
    GET_PRODUCT_SUCCESS,
    SEARCH_RESULT_PROCESS,
    SEARCH_RESULT_SUCCESS,
    INPUT_RESULT_SUCCESS,
    INPUT_RESULT_PROCESS,
    GET_PRODUCTS_BY_CATEGORY_PROCESS,
    GET_PRODUCTS_BY_CATEGORY_SUCCESS,
    CREATE_PRODUCT_SUCCESS,
    CREATE_PRODUCT_PROCESS,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_PROCESS,
} from "../constant/productType";

import connectApi from "../../../settings/ConnectApi.js";

// 1. get a single product using id's
export const getSingleProduct = (id) => async (dispatch) => {
    dispatch({type: GET_PRODUCT_PROCESS});

    const {data} = await connectApi.get(`/api/customer/product/${id}`);

    dispatch({type: GET_PRODUCT_SUCCESS, payload: data});
};

// 2. get all the products with limit
export const getAllProducts = (limit, form) => async (dispatch) => {
    dispatch({type: GET_PRODUCTS_PROCESS});

    const {data} = await connectApi.get(`/api/customer/products/all?limit=${limit}`, {params: form});

    dispatch({type: GET_PRODUCTS_SUCCESS, payload: data});
};

export const adminGetAllProducts = () => async (dispatch) => {
    dispatch({type: GET_PRODUCTS_PROCESS});

    const {data} = await connectApi.get(`/api/admin/products/all`);

    dispatch({type: GET_PRODUCTS_SUCCESS, payload: data});
};

// 3. function for displaying product name as search result on input
export const getInputResult = (searchParams) => async (dispatch) => {
    dispatch({type: INPUT_RESULT_PROCESS});

    const {data} = await connectApi.get(`/api/customer/products/search?q=${searchParams}`);

    // const filteredProducts = data.products.filter((product) =>
    //   product.title.toLowerCase().includes(searchParams.toLowerCase())
    // );

    dispatch({type: INPUT_RESULT_SUCCESS, payload: data});
};

// 4. function to get product from searching parameters and filter
export const getSearchResults =
    (params, min = 0, max = 99999, avgRating = 0) =>
        async (dispatch) => {
            dispatch({type: SEARCH_RESULT_PROCESS});

            const {data} = await connectApi.get(`/products/search?q=${params}`);

            // Filter by name similarity
            const filterName = data.products.filter((product) =>
                product.title.toLowerCase().includes(params.toLowerCase())
            );

            const filterPrice = filterName.filter(
                (product) => product.price >= min && product.price <= max
            );

            const filterRating = filterPrice.filter((product) => {
                const averageReview =
                    product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                    product.reviews.length;
                return averageReview >= avgRating;
            });

            dispatch({type: SEARCH_RESULT_SUCCESS, payload: filterRating});
        };

// 5. Get the product by category
export const getProductCategories = (categories) => async (dispatch) => {
    dispatch({type: GET_PRODUCTS_BY_CATEGORY_PROCESS});

    const {data} = await connectApi.get(`/api/customer/products/category/${categories}`);

    dispatch({type: GET_PRODUCTS_BY_CATEGORY_SUCCESS, payload: data});
    return data;
};

export const CreateProduct = (formData) => async (dispatch) => {
    dispatch({type: CREATE_PRODUCT_PROCESS});

    const {data} = await connectApi.post(`/api/admin/products/add`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    dispatch({type: CREATE_PRODUCT_SUCCESS, payload: data});
}

// 7. Admin get product by id
export const adminGetProduct = (id) => async (dispatch) => {
    dispatch({type: GET_PRODUCT_PROCESS});

    const {data} = await connectApi.get(`/api/admin/products/${id}`);

    dispatch({type: GET_PRODUCT_SUCCESS, payload: data});
};

export const adminUpdateProduct = (id, formData) => async (dispatch) => {
    dispatch({type: UPDATE_PRODUCT_PROCESS});

    const {data} = await connectApi.post(`/api/admin/products/update/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    dispatch({type: UPDATE_PRODUCT_SUCCESS, payload: data});
}
