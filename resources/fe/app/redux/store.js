import {configureStore, combineReducers} from "@reduxjs/toolkit";
import {thunk} from "redux-thunk";
import {
    categoryProductsReducer,
    inputResultsReducer,
    productReducer,
    productsReducer,
    searchResultsReducer,
} from "./reducer/productsReducer";
import {categoriesReducer} from "./reducer/categoryReducer";
import {cartReducer} from "./reducer/cartReducer";
import {checkoutReducer} from "./reducer/checkoutReducer";
import {userReducer} from "./reducer/userReducer";
import {orderReducer, updateOrderReducer} from "./reducer/orderReducer.js";
import {districtReducer, paymentReducer, provinceReducer, wardReducer} from "./reducer/paymentReducer.js";

const reducer = combineReducers({
    products: productsReducer,
    product: productReducer,
    inputResults: inputResultsReducer,
    searchResults: searchResultsReducer,
    categoryProducts: categoryProductsReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    user: userReducer,
    orders: orderReducer,
    updateOrder: updateOrderReducer,
    provinces: provinceReducer,
    districts: districtReducer,
    wards: wardReducer,
    payment: paymentReducer,
});

export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});
