import {
    ADD_CART_PROCESS,
    ADD_CART_SUCCESS,
    DECREASE_AMOUNT, FETCH_CART_PROCESS, FETCH_CART_SUCCESS,
    INCREASE_AMOUNT,
    REMOVE_CART_PROCESS,
    REMOVE_CART_SUCCESS,
    RESET_STATUS, UPDATE_CART_PROCESS, UPDATE_CART_SUCCESS,
} from "../constant/cartType";

// Load the initial cart state from local storage
const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
};

const cartState = {
    // cart: loadCartFromLocalStorage(),
    cartData: null,
    loading: false,
    success: false,
    fail: false,
    quantity: 0,
};

export const cartReducer = (state = cartState, action) => {
    switch (action.type) {
        case FETCH_CART_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case FETCH_CART_SUCCESS:
            return {
                ...state,
                cartData: action.payload.data,
                quantity: action.payload.data?.length,
                loading: false,
            };


        case ADD_CART_PROCESS:
            return {
                ...state,
                loading: true,
                success: false,
                fail: false,
            };

        case REMOVE_CART_PROCESS:
            return {
                ...state,
                loading: true,
                success: false,
                fail: false,
            };

        case UPDATE_CART_PROCESS:
            return {
                ...state,
                loading: true,
            };

        case UPDATE_CART_SUCCESS:
            return {
                ...state,
                loading: false,
            };

        case ADD_CART_SUCCESS: {
            return {
                ...state,
                cartData: action.payload.data,
                quantity: action.payload.data?.length,
                success: true,
                loading: false,
            };
        }

        case REMOVE_CART_SUCCESS: {
            const id = action.payload;

            return {
                ...state,
                cartData: action.payload.data,
                quantity: action.payload.data?.length,
                loading: false,
            };
        }

        case INCREASE_AMOUNT: {
            const id = action.payload;
            const cartItem = state.cart.find((item) => item.id === id);

            if (cartItem.stock < cartItem.amount + 1) {
                return {
                    ...state,
                    error: true,
                    loading: false,
                };
            } else {
                const updatedCart = state.cart.map((item) =>
                    item.id === id ? {...item, amount: item.amount + 1} : item
                );

                // Update local storage
                localStorage.setItem("cart", JSON.stringify(updatedCart));

                return {
                    ...state,
                    cartData: updatedCart,
                    loading: false,
                };
            }
        }

        case DECREASE_AMOUNT: {
            const id = action.payload;
            const updatedCart = state.cart.map((item) =>
                item.id === id ? {...item, amount: item.amount - 1} : item
            );

            // Update local storage
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            return {
                ...state,
                cartData: updatedCart,
                loading: false,
            };
        }

        case RESET_STATUS:
            return {
                cartData: null,
                loading: false,
                success: false,
                fail: false,
            };

        default:
            return state;
    }
};
