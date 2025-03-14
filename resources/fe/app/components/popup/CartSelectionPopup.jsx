import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {formatVietnameseCurrency} from '../../locales/currencyFormat.js';
import {addProductToCart} from "../../redux/action/cartAction.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {formatDate} from "../../locales/dateFormat.js";
import {notify} from "../../layouts/Notification/notify.jsx";
import SpinnerLoading from "../loading/SpinnerLoading.jsx";

const CartSelectionPopup = ({isVisible, cartData, product, resetState}) => {
    const dispatch = useDispatch();
    const [selectedCarts, setSelectedCarts] = useState([]);
    const [visibleToppings, setVisibleToppings] = useState({});

    const addedProduct = useSelector(state => state.cart.product);
    const {closePopup} = usePopup();

    const [loading, setLoading] = useState(false);

    const isSelectedCart = (orderId) => {
        return selectedCarts.some(item => item.order_id === orderId);
    };

    const toggleSelectedCart = (cart) => {
        if (isSelectedCart(cart.order_id)) {
            setSelectedCarts(selectedCarts.filter(item => item.order_id !== cart.order_id));
        } else {
            if (cart.order_id === 'new') {
                setSelectedCarts([cart]);
            } else {
                setSelectedCarts(selectedCarts.filter(item => item.order_id !== 'new').concat(cart));
            }
        }
    };

    const toggleToppings = (cartId) => {
        setVisibleToppings({
            ...visibleToppings, [cartId]: !visibleToppings[cartId]
        });
    };

    const isToppingsVisible = (cartId) => {
        return visibleToppings[cartId] || false;
    };

    const addProductToCarts = () => {
        const count = selectedCarts.length;
        const cartNames = selectedCarts.map(item => item.name).join(', ');

        if (window.confirm(`Are you sure to add this product into ${count} carts: ${cartNames}`)) {
            // turn on effect loading
            setLoading(true);
            if (selectedCarts.some(item => item.order_id === 'new')) {
                dispatch(addProductToCart(product)).then(() => {
                    notify('success', 'Add product to cart successfully');
                    resetState();
                    setLoading(false);
                    closePopup();
                });
            } else {
                dispatch(addProductToCart(product, selectedCarts.map(item => item.order_id))).then(() => {
                    notify('success', 'Added product to cart successfully');
                    resetState();
                    // turn off effect loading
                    setLoading(false);
                    closePopup();
                });
            }
        }
    };

    if (!isVisible) return null;

    return (<div className="overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
                 onClick={closePopup}>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-[90%] h-auto lg:w-full relative"
             onClick={(e) => e.stopPropagation()}>

            {/* title */}
            <div className="flex flex-row items-center justify-between mb-4">
                <p className="text-black text-2xl font-semibold">Select Cart</p>
                <button onClick={closePopup} className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* cart list */}
            <div className="details_topping flex flex-col max-h-[400px] overflow-y-auto scrollbar-thin p-2">

                {/* available carts */}
                {cartData.map(cart => (
                    <div key={cart.order_id} onClick={() => toggleSelectedCart(cart)}
                         className={`flex flex-col justify-between border-b border-gray-300 py-3 m-1 shadow-lg rounded-lg p-2 relative cursor-pointer transition-all duration-200 ease-in-out ${isSelectedCart(cart.order_id) ? 'bg-[#FBD3D6]' : 'bg-white'}`}>
                        <div className="flex justify-between">
                            {/* name and created date */}
                            <div className="flex flex-col gap-2 w-2/3 ml-2">
                                <p className="text-black font-bold">{cart.name}</p>
                                <p className="text-[14px] leading-none text-gray-600">Created
                                    date: {formatDate(cart.date_created)}</p>
                            </div>
                            <button className="rounded-full bg-gray-100 hover:bg-gray-300 p-1 h-fit"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleToppings(cart.order_id);
                                    }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth="1.5" stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                                </svg>
                            </button>
                        </div>
                        {isToppingsVisible(cart.order_id) && (<div className="p-2 w-[300px]">
                            {cart.order_detail.length === 0 ? (<span
                                className="text-gray-500 text-sm">Empty cart</span>) : (cart.order_detail.map((item, index) => (
                                <div key={item.id} className="order-item mb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div
                                                className="font-semibold">{item.product_name} ({item.size})
                                            </div>
                                            <span
                                                className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="toppings mt-2 text-sm">
                                        {item.toppings.map((topping, toppingIndex) => (
                                            <div key={toppingIndex} className="flex justify-between w-full">
                                                <div>{topping.name} (+{formatVietnameseCurrency(topping.price)})</div>
                                            </div>))}
                                    </div>
                                </div>)))}
                        </div>)}
                    </div>
                ))}

                {/* option create a new cart */}
                <div onClick={() => toggleSelectedCart({order_id: 'new', name: 'New Cart'})}
                     className={`flex flex-col justify-between border-b border-gray-300 py-3 m-1 shadow-lg rounded-lg p-2 relative cursor-pointer transition-all duration-200 ease-in-out ${isSelectedCart('new') ? 'bg-[#FBD3D6]' : 'bg-white'}`}>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2 w-2/3 ml-2">
                            <p className="text-black font-bold">Create New Cart</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* confirm button */}
            <div className="filter_btn flex items-center justify-end mt-5">
                <button onClick={closePopup}
                        className="w-full justify-center sm:w-auto text-md text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900">
                    Cancel
                </button>
                <button disabled={selectedCarts.length === 0} onClick={addProductToCarts}
                        className={`active_btn ml-2 bg-[#f26d78] text-white px-4 py-2 rounded-full font-semibold ${selectedCarts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {/*Confirm*/}
                    {loading ? <SpinnerLoading/> : 'Confirm'}
                </button>
            </div>
        </div>
    </div>);
};

export default CartSelectionPopup;
