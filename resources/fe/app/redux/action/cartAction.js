import {
    ADD_CART_PROCESS,
    ADD_CART_SUCCESS,
    REMOVE_CART_PROCESS,
    REMOVE_CART_SUCCESS,
    INCREASE_AMOUNT,
    DECREASE_AMOUNT,
    RESET_STATUS, FETCH_CART_PROCESS, FETCH_CART_SUCCESS, UPDATE_CART_PROCESS, UPDATE_CART_SUCCESS,
} from "../constant/cartType";

import connectApi from "../../../settings/ConnectApi.js";
import {getAuth} from "firebase/auth";

// 1. add product to cart by id
export const addToCart = (id, amount) => async (dispatch) => {
  dispatch({ type: ADD_CART_PROCESS });

  const { data } = await connectApi.get(`/products/${id}`);

  dispatch({ type: ADD_CART_SUCCESS, payload: { data, amount } });
};

// 2. remove product from cart by id
export const removeFromCart = (id) => async (dispatch) => {
  dispatch({ type: REMOVE_CART_PROCESS });

  dispatch({ type: REMOVE_CART_SUCCESS, payload: id });
};

// 3. increase amount of product from cart
export const increaseCart = (id) => async (dispatch) => {
  dispatch({ type: ADD_CART_PROCESS });
  dispatch({ type: INCREASE_AMOUNT, payload: id });
};

// 4. descrease amount of product from cart
export const decreaseCart = (id) => async (dispatch) => {
  dispatch({ type: ADD_CART_PROCESS });
  dispatch({ type: DECREASE_AMOUNT, payload: id });
};

// 5. Reset the status once the process is complete
export const resetStatus = () => async (dispatch) => {
  dispatch({ type: RESET_STATUS });
};

// 6. fetch cart
// export const fetchCart = () => async (dispatch) => {
//     dispatch({ type: FETCH_CART_PROCESS });
//
//     const { data } = await connectApi.get("/api/cart/fetchCart");
//     console.log(data);
//
//   dispatch({ type: FETCH_CART_SUCCESS, payload: data });
// };

export const fetchCart = () => async (dispatch) => {
    dispatch({ type: FETCH_CART_PROCESS });

    try {
        const { data } = await connectApi.get("/api/cart/fetchCart");

        dispatch({ type: FETCH_CART_SUCCESS, payload: data });
    } catch (error) {
        console.error("Error fetching cart:", error);
        // Handle error appropriately
    }
};

// 7. add product to cart
export const addProductToCart = (product, order_ids) => async (dispatch) => {
    dispatch({ type: ADD_CART_PROCESS });
    try {
        const { data } = await connectApi.post(`/api/cart/addProductToCart`, { product, order_ids });

        dispatch({ type: ADD_CART_SUCCESS, payload: data });
    } catch (error) {
        console.error("Error adding product to cart:", error);
    }
};

// 8. delete cart
export const deleteCart = (cartId) => async (dispatch) => {
    dispatch({ type: REMOVE_CART_PROCESS });
    try {
        await connectApi.delete(`/api/cart/deleteCart/${cartId}`);
        dispatch({ type: REMOVE_CART_SUCCESS });
    } catch (error) {
        console.error("Error deleting cart:", error);
    }
};

// 9. delete product from cart
export const deleteProductInCart = (cart_id, order_detail_id) => async (dispatch) => {
    dispatch({ type: REMOVE_CART_PROCESS });
    try {
        await connectApi.post(`/api/cart/removeProductFromCart`, { cart_id, order_detail_id });
        dispatch({ type: REMOVE_CART_SUCCESS });
    } catch (error) {
        console.error("Error deleting product from cart:", error);
    }
};

// 10. delete topping from cart
export const deleteToppingInCart = (cart_id, order_detail_id, topping_id) => async (dispatch) => {
    dispatch({ type: REMOVE_CART_PROCESS });
    try {
        await connectApi.post(`/api/cart/removeToppingFromCart`, { cart_id, order_detail_id, topping_id });
        dispatch({ type: REMOVE_CART_SUCCESS });
    } catch (error) {
        console.error("Error deleting topping from cart:", error);
    }
};

// 11. reset cart
export const resetCart = () => async (dispatch) => {
    dispatch({ type: RESET_STATUS });
};

// 12. update product in cart
export const updateProductInCart = (updatedProduct) => async (dispatch) => {
    dispatch({ type: UPDATE_CART_PROCESS });
    try {
        await connectApi.put(`/api/cart/updateProductInCart`, updatedProduct);
        dispatch({ type: UPDATE_CART_SUCCESS });
    } catch (error) {
        console.error("Error updating product in cart:", error);
    }
};
