import React, {useEffect, useState,} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {formatVietnameseCurrency} from '../../locales/currencyFormat.js';
import {formatDate} from '../../locales/dateFormat.js';
import {deleteCart, deleteProductInCart, deleteToppingInCart, fetchCart} from "../../redux/action/cartAction.js";
import PaymentDetailPopup from "./PaymentDetailPopup.jsx";
import SpinnerLoading from "../loading/SpinnerLoading.jsx";
import {notify} from "../../layouts/Notification/notify.jsx";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {useTranslation} from "react-i18next";

const CartDrawerPopup = ({isVisible}) => {
    const [expandedItems, setExpandedItems] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showPaymentDetail, setShowPaymentDetail] = useState([]);
    const form = {cart_name: '', type: ''};
    const dispatch = useDispatch();

    const {cartData, loading} = useSelector(state => state.cart);

    const {openPopup, closePopup} = usePopup();
    const {t} = useTranslation();

    const closeDrawer = () => {
        closePopup();
    };

    const handleCreateCart = async () => {
        await dispatch(createCart({custom_name: form.cart_name, type: form.type}));
        if (!store.error) {
            notify({group: "foo", title: "Success", text: "Cart created successfully!"}, 4000);
            fetchData();
        }
    };

    const fetchData = async () => {
        await dispatch(fetchCart());
        // setCartData(store.allCart);
        // setShowPaymentDetail(Array(store.allCart.length).fill(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleToppings = (itemId) => {
        setExpandedItems((prev) => ({...prev, [itemId]: !prev[itemId]}));
    };

    const handleDeleteProduct = (cartId, orderDetailId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                dispatch(deleteProductInCart(cartId, orderDetailId));
                fetchData();
                notify('success', 'Delete product successfully!');
            } catch (e) {
                notify('error', 'Delete product failed!');
            }
        }
    };

    const refetchCart = () => {
        fetchData();
    }

    const handleEditProduct = async (cartId, orderDetailId) => {
        const productDetailInCart = cartData.find(cart => cart.order_id === cartId).order_detail.find(item => item.id === orderDetailId);
        // openPopup('details', {...productDetail, order_id: cartId});
        openPopup({
            popupName: 'details',
            productDetailInCart: {...productDetailInCart, order_id: cartId},
            productId: productDetailInCart.product_id
        });
    };

    const handleDeleteTopping = (cartId, orderDetailId, toppingId) => {
        if (confirm('Are you sure you want to delete this topping?')) {
            try {
                dispatch(deleteToppingInCart(cartId, orderDetailId, toppingId));
                fetchData();
                notify('success', 'Delete topping successfully!');
            } catch (e) {
                notify('error', 'Delete topping failed!');
            }
        }
    };

    const handleDeleteCart = (cartId) => {
        if (confirm('Are you sure you want to delete this cart?')) {
            try {
                dispatch(deleteCart(cartId));
                fetchData();
                notify('success', 'Delete cart successfully!');
            } catch (e) {
                notify('error', 'Delete cart failed!');
            }
        }
    };

    const togglePaymentDetail = (index) => {
        setShowPaymentDetail((prev) => {
            const newShowPaymentDetail = [...prev];
            newShowPaymentDetail[index] = !newShowPaymentDetail[index];
            return newShowPaymentDetail;
        });
    };

    const handlePaymentDetail = (index) => {
        openPopup({popupName: 'paymentDetail', cart: cartData[index], index: index, refetchData: refetchCart});
    }

    const visibleTabs = Array.isArray(cartData) ? cartData.slice(0, 4) : [];
    const hiddenTabs = Array.isArray(cartData) ? cartData.slice(4) : [];

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const selectHiddenTab = (index) => {
        const selectedTab = cartData[index];
        const newCartData = [...cartData];
        newCartData.splice(index, 1);
        newCartData.unshift(selectedTab);
        setCartData(newCartData);
        setActiveTab(0);
        setIsDropdownOpen(false);
    };

    if (!isVisible) return null;


    return (
        <div onClick={closePopup}>
            <div id="drawer-update-product"
                 className="fixed top-0 z-99 right-0 w-full h-screen max-w-3xl overflow-y-auto transition-transform-translate-x-full bg-white dark:bg-gray-800 rounded-2xl border"
                 onClick={(e) => e.stopPropagation()}>
                {/*title*/}
                <div className="drawer-header flex justify-between items-center pl-4 pr-4 pt-4 pb-2">
                    <h2 className="text-3xl font-semibold text-[#f26d78]">{t('CART.CARTS')}</h2>
                    <button onClick={closeDrawer} className="text-2xl">&times;</button>
                </div>

                <div className="ml-6 mr-6 mt-4 mb-4 border-[#f26d78] bg-gray-100 flex border-b-2 h-10 justify-between">
                    <div className="flex">
                        <button className="mr-[1px] bg-[#f26d78] text-white pl-2 pr-2 font-bold rounded-t-lg"
                                onClick={() => setIsVisible(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="size-6">
                                <path fillRule="evenodd"
                                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>
                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab"
                            role="tablist">
                            {visibleTabs.map((cart, index) => (
                                <li key={`${cart.order_id}-${index}`} role="presentation">
                                    <button
                                        className={`relative flex justify-center items-center pl-3 pr-3 rounded-t-lg border-gray-100 border-2 ${activeTab === index ? 'pb-[4px] border-[#f26d78] bg-gray-100 h-[102%] border-t-2 border-r-2 border-l-2 border-b-0 text-[#f26d78] font-bold' : 'h-[98%] hover:text-gray-600 bg-white dark:hover:text-gray-300'}`}
                                        id={`tab-${index}`}
                                        onClick={() => setActiveTab(index)}
                                        type="button"
                                        role="tab"
                                        aria-controls={`tab-content-${index}`}
                                        aria-selected={activeTab === index}
                                    >
                                        {cart.name}
                                        <div
                                            className="absolute top-[0px] right-[0px] bg-red-500 z-999 text-white text-2xs ml-2 rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                                            {cart.count_product}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {hiddenTabs.length > 0 && (
                        <div className="relative">
                            <button
                                className="trigger-dropdown inline-block bg-gray-100 p-2 rounded-full hover:text-gray-600 hover:border-gray-300 hover:bg-gray-300 dark:hover:text-gray-300"
                                onClick={toggleDropdown}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="size-5">
                                    <path fillRule="evenodd"
                                          d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                                          clipRule="evenodd"/>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div
                                    className="dropdown absolute right-0 mt-2 w-48 bg-gray-100 border border-gray-200 rounded-md shadow-lg z-10">
                                    {hiddenTabs.map((hiddenCart, hiddenIndex) => (
                                        <button
                                            key={hiddenCart.order_id}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => selectHiddenTab(hiddenIndex + visibleTabs.length)}
                                        >
                                            {hiddenCart.name} ({hiddenCart.count_product})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div id="default-tab-content">
                    {loading ? <SpinnerLoading/> : cartData?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <img src="/storage/build/assets/no-data-found.png" alt="No data"
                                 className="w-80 opacity-60"/>
                            <span className="text-gray-500 mt-2">{t('CART.NO_CARTS')}</span>
                        </div>
                    ) : (
                        cartData?.map((cart, index) => (
                            <div
                                key={cart.order_id}
                                className={`rounded-lg bg-gray-100 dark:bg-gray-800 ${activeTab === index ? '' : 'hidden'}`}
                                id={`tab-content-${index}`}
                                role="tabpanel"
                                aria-labelledby={`tab-${index}`}
                            >

                                {/*show payment popup each cart*/}
                                {showPaymentDetail[index] &&
                                    <PaymentDetailPopup cart={cart} isVisible={showPaymentDetail[index]} index={index}
                                                        refetchData={fetchData}/>}

                                {!showPaymentDetail[index] && (
                                    <div>
                                        <div className="order-summary flex justify-between pl-6 pr-6 pb-4">
                                            <div>
                                                <strong>{t('CART.CART_NAME')}:</strong> {cart.name}
                                            </div>
                                            <div>
                                                <strong>{t('CART.DATE_CREATED')}:</strong> {formatDate(cart.date_created)}
                                            </div>
                                        </div>
                                        <div className="order-items overflow-y-auto h-[745px] pl-6 pr-6 scrollbar-thin">
                                            {cart.order_detail.map((item, itemIndex) => (
                                                <div key={item.id}
                                                     className="p-3 bg-white mb-4 cursor-pointer shadow-lg hover:shadow-xl rounded-xl"
                                                     onClick={() => toggleToppings(item.id)}>
                                                    <div className="flex gap-4 h-full rounded-lg">
                                                        <div className="w-[12%]">
                                                            <img
                                                                src={item.image || '/storage/build/assets/Product/empty-image.png'}
                                                                alt="Product"
                                                                className="w-full shadow-lg rounded-lg aspect-square"/>
                                                        </div>
                                                        <div className="flex justify-between h-full w-[88%]">
                                                            <div className="flex flex-col justify-between">
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className="font-semibold">{item.product_name} ({item.size})
                                                                    </div>
                                                                    <span
                                                                        className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
                                                                </div>
                                                                <span
                                                                    className="text-sm text-gray-500">{t('CART.NOTE')}: {item.note}</span>
                                                                <span
                                                                    className="text-sm text-gray-500">{t('CART.TOPPINGS')}: {item.count_topping} toppings</span>
                                                            </div>

                                                            {/* buttons */}
                                                            <div className="flex items-start space-x-1">
                                                                {/* price */}
                                                                <div
                                                                    className="font-semibold text-right mr-5 min-w-[100px]">{formatVietnameseCurrency(item.total_price)}</div>

                                                                {/* button edit */}
                                                                <button
                                                                    className="text-gray-500 cursor-pointer hover:text-gray-700 rounded-full hover:bg-gray-200 p-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditProduct(cart.order_id, item.id);
                                                                    }}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                         viewBox="0 0 24 24" strokeWidth="1.5"
                                                                         stroke="currentColor" className="size-4">
                                                                        <path strokeLinecap="round"
                                                                              strokeLinejoin="round"
                                                                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                                                    </svg>
                                                                </button>

                                                                {/* button delete*/}
                                                                <button
                                                                    className="text-red-500 cursor-pointer hover:text-red-700 rounded-full hover:bg-red-200 p-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteProduct(cart.order_id, item.id);
                                                                    }}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                         viewBox="0 0 24 24" strokeWidth="1.5"
                                                                         stroke="currentColor" className="size-4">
                                                                        <path strokeLinecap="round"
                                                                              strokeLinejoin="round"
                                                                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {expandedItems[item.id] && (
                                                        <div className="toppings mt-2">
                                                            {item.toppings.length === 0 ? (
                                                                <div>{t('CART.NO_TOPPING')}</div>
                                                            ) : (
                                                                item.toppings.map((topping, toppingIndex) => (
                                                                    <div key={toppingIndex}
                                                                         className="shadow-item flex justify-between text-sm hover:bg-gray-100 pt-1 pl-2 pr-1 rounded-lg">
                                                                        <div
                                                                            className="w-55 overflow-hidden overflow-x-clip">{topping.name}</div>
                                                                        <div>+{formatVietnameseCurrency(topping.price)}</div>
                                                                        <button
                                                                            className="text-red-500 cursor-pointer hover:text-red-700 rounded-full hover:bg-red-200 p-1 mb-1"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteTopping(cart.order_id, item.id, topping.id);
                                                                            }}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                                 viewBox="0 0 24 24" fill="currentColor"
                                                                                 className="size-4">
                                                                                <path fillRule="evenodd"
                                                                                      d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                                                                                      clipRule="evenodd"/>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className="flex items-center justify-between h-full p-4 pl-6 pb-4 sticky bottom-0 right-0">
                                        <span
                                            className="flex h-full justify-center flex-col items-center font-semibold bg-white p-2 border border-gray-400 rounded-lg shadow-lg z-10">
                                            {t('CART.TOTAL')}: {formatVietnameseCurrency(cart.total_price)}
                                        </span>
                                            <div className="flex gap-1">
                                                <button
                                                    className="w-full justify-center sm:w-auto text-gray-500 bg-gray inline-flex items-center bg-gray-100 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full text-sm font-medium px-5 py-2.5 hover:text-gray-900 shadow-2xl"
                                                    onClick={() => handleDeleteCart(cart.order_id)}>
                                                    {t('CART.DELETE')}
                                                </button>
                                                <button
                                                    className="w-full justify-center sm:w-auto text-white inline-flex items-center bg-[#f26d78] hover:bg-[#f26d78] focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full text-sm font-medium px-5 py-2.5"
                                                    // onClick={() => togglePaymentDetail(index)}>
                                                    onClick={() => togglePaymentDetail(index)}>
                                                    {t('CART.PAYMENT_DETAIL')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
}

export default CartDrawerPopup;
