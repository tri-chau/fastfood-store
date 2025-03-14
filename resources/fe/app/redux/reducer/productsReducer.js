import {
    GET_PRODUCT_PROCESS,
    GET_PRODUCT_SUCCESS,
    GET_PRODUCTS_BY_CATEGORY_PROCESS,
    GET_PRODUCTS_BY_CATEGORY_SUCCESS,
    GET_PRODUCTS_PROCESS,
    GET_PRODUCTS_SUCCESS,
    INPUT_RESULT_PROCESS,
    INPUT_RESULT_SUCCESS,
    SEARCH_RESULT_PROCESS,
    SEARCH_RESULT_SUCCESS,
} from "../constant/productType";

const product = {
    product: [],
    loading: false,
};

const products = {
    product: [],
    products: [],
    // total: 0,
    loading: false,
};

const inputResults = {
    inputResults: [],
    loading: false,
};

const searchResults = {
    searchResults: [],
    loading: false,
};

const categoryProducts = {
    categoryProducts: [],
    loading: false,
};

// 1. get a single product by id
export const productReducer = (state = product, action) => {
    switch (action.type) {
        case GET_PRODUCT_PROCESS:
            return {...state, loading: true};

        case GET_PRODUCT_SUCCESS:
            // console.log("product reducer", action.payload.data);
            return {
                ...state,
                product: action.payload.data,
                loading: false,
            };


        default:
            return state;
    }
};

// 2. get all products
export const productsReducer = (state = products, action) => {
    switch (action.type) {
        case GET_PRODUCTS_PROCESS:
            return {...state, loading: true};

        case GET_PRODUCTS_SUCCESS: {
            const products = action.payload.data;
            const total = action.payload.products_count;
            const hasMore = action.payload.pagination.has_more;
            const topping_data = action.payload.topping_data;
            // const firstProductId = action.payload.pagination.first_product_id;
            // const lastProductId = action.payload.pagination.last_product_id;
            // console.log("products reducer", action.payload, total);
            return {
                ...state,
                products: products,
                topping_data: topping_data,
                total: total,
                loading: false,
                hasMore: hasMore,
            };
        }

        default:
            return state;
    }
};

// 3. get input result for product / products search
export const inputResultsReducer = (state = inputResults, action) => {
    switch (action.type) {
        case INPUT_RESULT_PROCESS:
            return {...state, loading: true, success: false, fail: false};

        case INPUT_RESULT_SUCCESS:
            return {
                ...state,
                inputResults: action.payload.data,
                loading: false,
            };

        default:
            return state;
    }
};

// 4. get product / products by search
export const searchResultsReducer = (state = searchResults, action) => {
    switch (action.type) {
        case SEARCH_RESULT_PROCESS:
            return {...state, loading: true};

        case SEARCH_RESULT_SUCCESS:
            return {
                ...state,
                searchResults: action.payload,
                loading: false,
            };

        default:
            return state;
    }
};

// 5. get all products by categories
export const categoryProductsReducer = (state = categoryProducts, action) => {
    switch (action.type) {
        case GET_PRODUCTS_BY_CATEGORY_PROCESS:
            return {...state, loading: true};

        case GET_PRODUCTS_BY_CATEGORY_SUCCESS:
            return {
                ...state,
                categoryProducts: action.payload,
                loading: false,
            };

        default:
            return state;
    }
};
