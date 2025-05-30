import React, {useCallback, useEffect, useRef} from 'react';
import {formatVietnameseCurrency} from '../../../locales/currencyFormat.js';
import {formatDateTime} from '../../../locales/dateFormat.js';
import {createPaymentLink, customerCancelOrder} from "../../../redux/action/paymentAction.js";
import {useDispatch, useSelector} from "react-redux";
import {usePopup} from "../../../hooks/contexts/popupContext/popupState.jsx";
import SpinnerLoading from "../../../components/loading/SpinnerLoading.jsx";
import {useTranslation} from "react-i18next";
import OrderDetailReviewPopup from '../../../components/popup/OrderDetailReviewPopup.jsx';
import {BiCommentDots} from "react-icons/bi";
import {notify} from "../../../layouts/notification/notify.jsx";

const OrderList = ({orders, refetchOrder}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    // const {openPopup} = usePopup();

    const {currentPopup, openPopup, closePopup, switchPopup} = usePopup();

    const {paymentLink, loading} = useSelector(state => state.payment);
    const currentIndexRef = useRef(null); // Use useRef to store index

    const payNow = async (index) => {
        try {
            currentIndexRef.current = index;
            dispatch(createPaymentLink(orders[index].order_id));
        } catch (error) {
            console.error('Error fetching checkout URL:', error);
        }
    };

    const handleReviewClick = (item, product_id) => {
        openPopup({popupName: 'orderDetailReview', orderDetail: item, productId: product_id});
    };

    const cancelOrder = async (index) => {
        if (confirm('Are you sure you want to delete this cart?')) {
            await dispatch(customerCancelOrder(orders[index].order_id)).then(() => {
                notify('success', 'Order has been canceled successfully');
                refetchOrder();
            }).catch(() => {
                notify('error', 'Error occurred while canceling order');
            });
        }
    }

    useEffect(() => {
        if (paymentLink !== undefined && paymentLink) {
            openPopup({popupName: 'qrPayment', paymentLink: paymentLink, order: orders[currentIndexRef.current]});
        }

        // reset to open 1 order continuously
        return () => {
            dispatch({type: 'RESET_PAYMENT_LINK'}); // Dispatch an action to reset the state
        };

    }, [paymentLink]);

    // orders = [
    // {
    //     order_id: "5dd57e53-2ae7-11f0-96e3-c4efbb5e3d83",
    //     order_number: "1",
    //     date_created: "2025-05-28 16:06:36",
    //     host_id: "716b3011-2ae6-11f0-96e3-c4efbb5e3d83",
    //     payment_method: "Cash",
    //     payment_status: "paid",
    //     receiver_name: "an",
    //     count_product: 1,
    //     status: "Completed",
    //     total_price: 10000.00,
    //     order_date: "2025-05-28 16:06:36",
    //     rate: 2,
    //     feedback: "good",
    //     note: "",
    //     order_detail: [
    //         {
    //             id: "e67988e9-2ae7-11f0-96e3-c4efbb5e3d83",
    //             order_detail_number: "1",
    //             product_id: "5a4d7925-3bab-11f0-a70d-c4efbb5e3d83",
    //             product_name: "chicken soup2",
    //             product_price: 10000.00,
    //             size: "S",
    //             quantity: 1,
    //             image: null,
    //             note: "no pepper",
    //             total_price: 10000.00,
    //             count_topping: 0,
    //         },
    //         {
    //             id: "a617811c-3bcc-11f0-a4c0-c4efbb5e3d83",
    //             order_detail_number: "1",
    //             product_id: "e62fe461-2ae6-11f0-96e3-c4efbb5e3d83",
    //             product_name: "Chicken Soup",
    //             product_price: 102.00,
    //             size: "S",
    //             quantity: 1,
    //             image: null,
    //             note: "no",
    //             total_price: 102.00,
    //             count_topping: 0,
    //         }
    //     ]
    // }
// ];

    return (<div className="flex mt-4 shadow-lg rounded-lg">
            <div
                className="scrollbar-thin w-full gap-6 grid overflow-y-auto rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                {orders !== undefined && orders.length > 0 ? (orders.map((order, index) =>
                    (<div key={order.order_id}
                          className="w-[100%] h-full border flex flex-col justify-between border-gray-300 p-5 rounded-xl shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300 ease-in-out">

                            {/* Basic order info */}
                            {/*<div className="order-info flex w-full justify-between items-center">*/}
                            {/*    <p className="text-lg font-semibold flex items-center gap-2">*/}
                            {/*        #{order.order_number}*/}
                            {/*        <span*/}
                            {/*            className="text-sm font-normal text-gray-500">- {formatDateTime(order.order_date)}</span>*/}
                            {/*    </p>*/}
                            {/*    <span className={`text-md font-semibold px-3 py-1 rounded-full*/}
                            {/*        ${order.status === "Completed" ? "bg-green-200 text-green-800" : order.status === "Pending" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}>*/}
                            {/*        {order.status}*/}
                            {/*    </span>*/}
                            {/*</div>*/}
                            {/* Basic order info */}
                            {/* Basic order info */}
                            <div className="order-info flex w-full justify-between items-center">
                                {/* Order Number & Date */}
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        #{order.order_number}
                                        <span
                                            className="text-sm font-normal text-gray-500">- {formatDateTime(order.order_date)}</span>
                                    </p>

                                    {/* Payment Method */}
                                    <span className={`text-sm font-medium px-2 py-1 rounded-lg shadow-sm
                                    ${order.payment_method === "Cash" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                                    {order.payment_method === 'Cash' ? '🛵' + t('ORDERS.DETAIL_ORDER.PAYMENT_METHODS.COD') : '💳' + t('ORDERS.DETAIL_ORDER.PAYMENT_METHODS.ONLINE')}
                                </span>
                                </div>

                                <span className={`text-sm font-medium px-2 py-0.5 rounded-md shadow-sm
                                ${order.status === "Wait For Approval" ? "bg-[#f26d78] text-white" :
                                    order.status === "Completed" ? "bg-green-200 text-green-800" :
                                    order.status === "Cancelled" ? "bg-red text-white" :
                                            "bg-yellow-200 text-yellow-800"}`}>
                                {order.status}
                            </span>
                            </div>


                            {/* Order details */}
                            <div className="overflow-y-auto w-full h-full scrollbar-thin mt-3">
                                {order.order_detail.map((item) => (
                                    <div key={item.id} className="order-item rounded-xl w-full last:pb-4">
                                        <div
                                            className="flex h-full p-2 w-full items-center bg-white shadow-sm rounded-lg">
                                            {/* Product image */}
                                            <div className="w-[10%] min-w-[60px]">
                                                <img src={item.image || 'storage_fail/build/assets/Product/empty-image.png'}
                                                    alt="Product"
                                                    className="w-full shadow-md rounded-lg aspect-square"/>
                                            </div>
                                            {/* Product info */}
                                            <div className="flex flex-col w-full pl-3">
                                                <span
                                                    className="text-md font-semibold text-gray-700">{item.product_name} ({item.size}) {/*item.product_id*/}</span>
                                                {item.count_topping !== 0 && (<span
                                                    className="text-xs text-gray-500">+ {item.count_topping} toppings</span>)}
                                                <span
                                                    className="text-xs text-gray-500">{t('ORDERS.DETAIL_ORDER.QUANTITY')}: {item.quantity}</span>
                                                {item.note &&
                                                    <span
                                                        className="text-xs text-gray-400">{t('ORDERS.DETAIL_ORDER.NOTE')}: {item.note}</span>}
                                            </div>
                                            {/* Price */}
                                            <div
                                                className="font-semibold text-md text-green-600 px-3 py-3">{formatVietnameseCurrency(item.total_price)}</div>
                                            {/* Review button */}
                                            {order.status === "Completed" && (
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleReviewClick(item, item.product_id)}
                                                        className="hover:bg-stone-300 relative shadow-md inline-flex items-center px-2 py-2 rounded-md border-gray-20"
                                                    >
                                                        <BiCommentDots size={25}/>
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ))}
                                <div className="text-gray-600">
                                    <p className="text-gray-600 text-md mt-2">{t('ORDERS.DETAIL_ORDER.NOTE')}: {order.note}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            {order.status === "Wait For Approval" &&
                            <div className="mt-2">
                                {/* Total price and buttons */}
                                <div className="w-full flex justify-between items-center">
                                    <p className="text-gray-600 text-md">
                                        {t('ORDERS.DETAIL_ORDER.TOTAL')} ({order.count_product} {t('ORDERS.DETAIL_ORDER.PRODUCTS')}): <span
                                        className="font-bold text-lg text-green-500">{formatVietnameseCurrency(order.total_price)}</span>
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => cancelOrder(index)}
                                            className="text-sm mr-2 bg-gray text-red-600 font-semibold hover:text-red-700 hover:bg-red transition-all px-3 py-1 rounded-full shadow-2xl"
                                        >
                                            {t('ORDERS.DETAIL_ORDER.CANCEL')}
                                        </button>
                                        {order.payment_status === 'pending' && order.payment_method === 'Banking' && (
                                            <button
                                                onClick={() => payNow(index)}
                                                className="text-sm bg-green-500 text-white font-semibold hover:bg-green-600 transition-all px-3 py-1 rounded-full"
                                            >
                                                {/*Pay now*/}
                                                {loading && currentIndexRef.current === index ?
                                                    <SpinnerLoading/> : t('ORDERS.DETAIL_ORDER.PAY_NOW')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                    ))) : (<div className="flex flex-col items-center justify-center w-full h-full">
                        <img src="/storage/build/assets/no-data-found.png" alt="No data" className="w-80 opacity-60"/>
                        <span className="text-gray-500 mt-2">{t('ORDERS.NO_ORDERS')}</span>
                    </div>
                )}
            </div>
            {currentPopup?.popupName === 'orderDetailReview' && (
                <OrderDetailReviewPopup
                    isVisible={currentPopup?.popupName === 'orderDetailReview'}
                    orderDetail={currentPopup?.orderDetail}
                    productId={currentPopup?.productId}
                />
            )}
        </div>

    );
};

export default OrderList;
