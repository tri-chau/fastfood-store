import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import connectApi from "../../../settings/ConnectApi.js";
import {createPaymentLink, fetchDistricts, fetchWards, resetPaymentLink} from "../../redux/action/paymentAction.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import SpinnerLoading from "../loading/SpinnerLoading.jsx";
import {notify} from "../../layouts/Notification/notify.jsx";
import {useNavigate} from "react-router-dom";
import provinceJson from "../../locales/tinh_tp.json";
import {useTranslation} from "react-i18next";

const PaymentDetailPopup = ({isVisible, index, cart, refetchData}) => {
    const [socketStatus, setSocketStatus] = useState(false);
    const [voucherModalVisible, setVoucherModalVisible] = useState(false);
    const [dayAfterTomorrow, setDayAfterTomorrow] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [deliveryAmount, setDeliveryAmount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showPaynowButton, setShowPaynowButton] = useState(false);

    const [form, setForm] = useState({
        province: '',
        district: '',
        ward: '',
        street: '',
        receiverName: '',
        phoneNumber: '',
        note: '',
        paymentMethod: 'Cash',
        branch: '',
        voucher: '',
        voucher_shipping: '',
    });
    const [vouchers, setVouchers] = useState([]);
    const [deliveryDiscount, setDeliveryDiscount] = useState(0);
    const [deliveryDiscountName, setDeliveryDiscountName] = useState('');
    const [discountName, setDiscountName] = useState('');

    // fetch provinces, districts, wards
    const dispatch = useDispatch();
    const districts = useSelector(state => state.districts.districts);
    const wards = useSelector(state => state.wards.wards);
    const [provinces, setProvinces] = useState([]);

    const {openPopup, closePopup} = usePopup();

    // show QR code
    const {loading, paymentLink} = useSelector(state => state.payment);
    const navigate = useNavigate();

    // const history = useHistory();
    let socket = null;

    const {t} = useTranslation();

    // useEffect(() => {
    //     const date = new Date();
    //     date.setDate(date.getDate() + 2);
    //     setDayAfterTomorrow(`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`);
    //     dispatch(fetchProvinces());
    //     initSocketListener();
    //     return () => cleanupSocket();
    // }, []);

    useEffect(() => {
        // dispatch(fetchProvinces());
        setProvinces(provinceJson);
    }, []);

    // fetch districts when province is selected
    useEffect(() => {
        if (form.province !== '') {
            dispatch(fetchDistricts(form.province));
        }
    }, [form.province]);

    // fetch wards when district is selected
    useEffect(() => {
        if (form.district !== '') {
            dispatch(fetchWards(form.district));
        }
    }, [form.district]);

    // Tu ship nen chua can
    const fetchShippingFee = async (teamId) => {
        try {
            const response = await axios.get('/api/ghn/shipping-fee', {
                params: {
                    team_id: teamId,
                    to_ward_code: form.ward.toString(),
                    to_district_id: form.district.toString(),
                    insurance_value: cart.total_price,
                },
            });
            setDeliveryAmount(response.data.data.total);
        } catch (error) {
            console.error('Error fetching shipping fee:', error);
            notify({group: "foo", title: "Error", text: "Failed to fetch shipping fee. Please try again."}, 4000);
        }
    };

    // chua cap nhat tinh nang nay
    const fetchVouchers = async (teamId) => {
        try {
            const response = await axios.get('/api/vouchers/loadCustomerVoucher', {params: {team_id: teamId}});
            setVouchers(response.data.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            notify({group: "foo", title: "Error", text: "Failed to fetch vouchers. Please try again."}, 4000);
        }
    };

    const chooseVoucher = (voucherId) => {
        setForm({...form, voucher: form.voucher === voucherId ? '' : voucherId});
    };

    const chooseVoucherShipping = (voucherId) => {
        setForm({...form, voucher_shipping: form.voucher_shipping === voucherId ? '' : voucherId});
    };

    const applyVoucher = () => {
        if (form.voucher !== '') {
            const voucher = vouchers.discount.find(v => v.id === form.voucher);
            if (voucher.discount_type === 'percent') {
                let value = (cart.total_price * voucher.discount_percent) / 100;
                setDiscountAmount(value > voucher.limit_per_order ? voucher.limit_per_order : value);
            } else {
                setDiscountAmount(voucher.discount_amount);
            }
            setDiscountName(voucher.voucher_code);
        }

        if (form.voucher_shipping !== '') {
            const voucher = vouchers.shipping_fee.find(v => v.id === form.voucher_shipping);
            if (voucher.discount_type === 'percent') {
                let value = (cart.total_price * voucher.discount_percent) / 100;
                setDeliveryDiscount(value > voucher.limit_per_order ? voucher.limit_per_order : value);
            } else {
                setDeliveryDiscount(voucher.discount_amount);
            }
            setDeliveryDiscountName(voucher.voucher_code);
        }

        setVoucherModalVisible(false);
        notify({group: "foo", title: "Success", text: "Voucher applied successfully!"}, 4000);
    };

    const proceedOrder = async () => {
        try {
            setIsProcessing(true);
            const orderData = {
                order_id: cart.order_id,
                receiver_name: form.receiverName,
                receiver_address: `${form.street}, ${form.ward}, ${form.district}, ${form.province}`,
                payment_method: form.paymentMethod,
                // branch: form.branch,
                voucher: form.voucher,
                voucher_shipping: form.voucher_shipping,
                note: form.note,
                province: form.province,
                district: form.district,
                ward: form.ward,
                street: form.street,
                phone_number: form.phoneNumber,
                shipping_fee: deliveryAmount - deliveryDiscount,
                discount_number: discountAmount,
                order_total: cart.total_price - discountAmount + deliveryAmount,
            };

            const response = await connectApi.post('/api/orders/proceed', orderData);

            if (response.status === 200) {
                notify('success', 'Order proceeded successfully');
                if (form.paymentMethod === 'Banking') {
                    setShowPaynowButton(true);
                }
                setShowSuccess(true);
                setTimeout(() => setShowButtons(true), 1000);
            } else {
                notify('error', 'An error occurred while proceeding with the order. Please try again.');
            }
            setIsProcessing(false);
            // dispatch({ type: 'setCartCount', payload: store.customerInfo.count_cart - 1 });
        } catch (error) {
            notify('error', 'An error occurred while proceeding with the order. Please try again.');
            setIsProcessing(false);
        }
    };

    const closePaymentDetail = () => {
        refetchData();
        closePopup(index);
    };

    const showOrderDetail = () => {
        closePopup();
        navigate('/orders'); // Navigate to order page
    };

    const getCheckoutUrl = async () => {
        try {
            dispatch(createPaymentLink(cart.order_id));
        } catch (error) {
            notify('error', 'An error occurred while creating payment link. Please try again.');
        }
    };

    useEffect(() => {
        if (paymentLink !== undefined && paymentLink !== null) {
            openPopup({popupName: 'qrPayment', paymentLink: paymentLink, order: cart});
        }
        dispatch(resetPaymentLink());
    }, [paymentLink]);

    // const initSocketListener = () => {
    //     const socketURL = "https://socket.dotb.cloud/";
    //     socket = io.connect(socketURL, {path: "", transports: ["websocket"], reconnection: true});
    //
    //     socket.on('connect', () => {
    //         console.log('Socket server is live!');
    //         socket.emit('join', `triggerPaymentStatus/${cart.order_id}`);
    //     });
    //
    //     socket.on('error', () => {
    //         console.log('Cannot connect to socket server!');
    //     });
    //
    //     socket.on('event-phenikaa', (msg) => {
    //         console.log('Socket message:', msg);
    //         if (msg.success) {
    //             if (!socketStatus) {
    //                 let message = 'Successfully pay for order ' + cart.name + ' with amount ' + formatVietnameseCurrency(cart.total_price);
    //                 notify('success', message);
    //                 closePopup();
    //
    //                 setShowPaynowButton(false);
    //                 setSocketStatus(true);
    //                 navigate('/order'); // Navigate to order page
    //             }
    //         } else {
    //             notify('error', 'Payment failed. Please try again.');
    //         }
    //     });
    // };

    const cleanupSocket = () => {
        if (socket) {
            socket.disconnect();
            socket = null;
            console.log('Socket disconnected');
        }
    };

    return (
        <div>
            {showSuccess ? (
                <div className="flex flex-col h-full w-full justify-center items-center mt-55">
                    <div className="success-animation">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <span className="text-xl mt-4 flex flex-col items-center">
                        {socketStatus ? t('DETAIL_PAYMENT.PAY_SUCCESS') : t('DETAIL_PAYMENT.PLACE_ORDER_SUCCESS')}
                        {showPaynowButton && t('DETAIL_PAYMENT.REQUEST_TO_PAY')}
                    </span>
                    {showButtons && (
                        <div className="flex gap-2 pt-4">
                            <button onClick={closePaymentDetail}
                                    className="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-500">
                                {t('DETAIL_PAYMENT.CLOSE')}
                            </button>
                            <button className="bg-[#f26d78] text-white px-4 py-2 rounded-full font-bold"
                                    onClick={showOrderDetail}>
                                {t('DETAIL_PAYMENT.VIEW_ORDER')}
                            </button>
                            {form.paymentMethod === 'Banking' && showPaynowButton && (
                                <button className="bg-[#ABBA7C] text-white px-4 py-2 rounded-full font-bold"
                                        onClick={getCheckoutUrl}>
                                    {loading ? <SpinnerLoading/> : t('DETAIL_PAYMENT.PAY_NOW')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <section className={`relative bg-gray-100 ${isVisible ? 'block' : 'hidden'}`}>
                    <div className="mx-auto max-w-screen-xl pr-6 pl-6 bg-gray-100 relative min-h-[744px]">
                        <div className="flex flex-col mt-2 justify-center bg-gray-100 items-center sm:mt-4 gap-4">
                            <div className="flex gap-2 bg-gray-100 w-full">

                                {/* Address */}
                                <div
                                    className="bg-white shadow-lg w-[70%] lg:max-w-md h-full divide-y divide-gray-200 overflow-hidden rounded-lg dark:divide-gray-700 dark:border-gray-700 xl:max-w-2xl">
                                    <div className="space-y-1 p-5 pt-4">
                                        <div className="flex w-full justify-between">
                                            <div className="flex gap-1 items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth="1.5" stroke="#f26d78" className="size-6 mb-[2px]">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                                                </svg>
                                                <label
                                                    className="font-bold text-[#f26d78] dark:text-white">{t('DETAIL_PAYMENT.DELIVERY_ADDRESS')}</label>
                                            </div>
                                            {/*<button className="hover:bg-gray-100 text-[#f26d78] text-sm p-1 rounded-lg" onClick={saveAddress}>*/}
                                            {/*    Save*/}
                                            {/*</button>*/}
                                        </div>
                                        <div className="mt-4">
                                            <div className="grid grid-cols-2 gap-2">

                                                {/* Select Province*/}
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.PROVINCE')}</label>
                                                    <select value={form.province} onChange={(e) => setForm({
                                                        ...form,
                                                        province: e.target.value,
                                                        district: '',
                                                        ward: ''
                                                    })}
                                                            className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                        <option
                                                            value="">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.SELECT_PROVINCE')}</option>
                                                        {provinces?.map((province) => (
                                                            <option key={province.ProvinceID}
                                                                    value={province.ProvinceID}>
                                                                {province.ProvinceName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Select District*/}
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.DISTRICT')}</label>
                                                    <select value={form.district} onChange={(e) => setForm({
                                                        ...form,
                                                        district: e.target.value,
                                                        ward: ''
                                                    })}
                                                            className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                        <option
                                                            value="">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.SELECT_DISTRICT')}</option>
                                                        {districts?.filter(d => d.ProvinceID.toString() === form.province.toString()).map((district) => (
                                                            <option key={district.DistrictID}
                                                                    value={district.DistrictID}>
                                                                {district.DistrictName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {/* Select Ward */}
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white mt-2">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.WARD')}</label>
                                                    <select value={form.ward}
                                                            onChange={(e) => setForm({...form, ward: e.target.value})}
                                                            className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                        <option
                                                            value="">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.SELECT_WARD')}</option>
                                                        {wards?.map((ward) => (
                                                            <option key={ward.WardCode} value={ward.WardCode}>
                                                                {ward.WardName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Street */}
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.STREET')}</label>
                                                    <input type="text" value={form.street}
                                                           onChange={(e) => setForm({...form, street: e.target.value})}
                                                           className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                           placeholder={t('DETAIL_PAYMENT.DELIVERY_ADDRESSES.PLACEHOLDER_STREET')}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div
                                    className="bg-white w-[50%] shadow-lg lg:max-w-md h-full divide-y divide-gray-200 overflow-hidden rounded-lg dark:divide-gray-700 dark:border-gray-700 xl:max-w-2xl">
                                    <div className="space-y-1 p-5 pt-4">
                                        <div className="flex w-full justify-between">
                                            <div className="flex gap-1 items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth="1.5" stroke="#f26d78" className="size-6 mb-[2px]">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                                                </svg>
                                                <label
                                                    className="font-bold text-[#f26d78] dark:text-white">{t('DETAIL_PAYMENT.PAYMENT')}</label>
                                            </div>

                                            {/* Voucher */}
                                            {/*<button className="hover:bg-gray-100 text-[#f26d78] text-sm p-1 rounded-lg" onClick={() => setVoucherModalVisible(true)}>*/}
                                            {/*    Voucher*/}
                                            {/*</button>*/}
                                        </div>
                                        <div className="mt-4">
                                            {/* Receiver Information */}
                                            <div className="grid grid-cols-1 gap-2">
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.RECEIVER_NAME')}</label>
                                                    <input type="text" value={form.receiverName}
                                                           onChange={(e) => setForm({
                                                               ...form,
                                                               receiverName: e.target.value
                                                           })}
                                                           className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                           placeholder={t('DETAIL_PAYMENT.PLACEHOLDER_RECEIVER_NAME')}/>
                                                </div>
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.PHONE_NUMBER')}</label>
                                                    <input type="tel" value={form.phoneNumber}
                                                           onChange={(e) => setForm({
                                                               ...form,
                                                               phoneNumber: e.target.value
                                                           })}
                                                           pattern="[0-9]*"
                                                           className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                           placeholder={t('DETAIL_PAYMENT.PLACEHOLDER_PHONE_NUMBER')}/>
                                                </div>
                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.NOTE')}</label>
                                                    <textarea value={form.note}
                                                              onChange={(e) => setForm({...form, note: e.target.value})}
                                                              className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                              placeholder={t('DETAIL_PAYMENT.EXAMPLE_NOTE')}/>
                                                </div>

                                                <div>
                                                    <label
                                                        className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">{t('DETAIL_PAYMENT.PAYMENT_METHOD')}</label>
                                                    <select value={form.paymentMethod} onChange={(e) => setForm({
                                                        ...form,
                                                        paymentMethod: e.target.value
                                                    })}
                                                            className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                        <option
                                                            value="Cash">{t('DETAIL_PAYMENT.PAYMENT_METHODS.COD')}</option>
                                                        <option
                                                            value="Banking">{t('DETAIL_PAYMENT.PAYMENT_METHODS.ONLINE')}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Select payment method */}
                                            {/*<div className="grid grid-cols-1 gap-2">*/}
                                            {/*     show branch option */}
                                            {/*    {form.paymentMethod === 'Banking' && (*/}
                                            {/*        <div>*/}
                                            {/*            <label className="block mb-2 text-sm font-medium text-gray-500 dark:text-white">Branch</label>*/}
                                            {/*            <input type="text" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter Branch" />*/}
                                            {/*        </div>*/}
                                            {/*    )}*/}
                                            {/*</div>*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                {/* Cancel Payment */}
                                <button onClick={closePaymentDetail}
                                        className="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-500">
                                    {t('DETAIL_PAYMENT.CANCEL')}
                                </button>
                                {/* Process */}
                                <button onClick={proceedOrder}
                                        className="w-full justify-center sm:w-auto text-white inline-flex items-center bg-[#f26d78] hover:bg-[#f26d78] focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full text-sm font-medium px-5 py-2.5">
                                    {isProcessing ? <SpinnerLoading/> : t('DETAIL_PAYMENT.PROCEED_ORDER')}
                                </button>
                            </div>
                        </div>
                    </div>
                    {voucherModalVisible && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="bg-white p-4 w-[500px] h-[500px] rounded-lg">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold">Voucher</h2>
                                    <button onClick={() => setVoucherModalVisible(false)}
                                            className="text-gray-500 hover:text-gray-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold">Discount</h3>
                                            <div className="mt-2">
                                                {vouchers.discount.map((voucher) => (
                                                    <div key={voucher.id}
                                                         className="flex justify-between items-center p-2 border-b border-gray-200">
                                                        <div>
                                                            <h4 className="font-bold">{voucher.voucher_code}</h4>
                                                            <span>{voucher.description}</span>
                                                        </div>
                                                        <div>
                                                            <input type="checkbox" checked={form.voucher === voucher.id}
                                                                   onChange={() => chooseVoucher(voucher.id)}/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Shipping Fee</h3>
                                            <div className="mt-2">
                                                {vouchers.shipping_fee.map((voucher) => (
                                                    <div key={voucher.id}
                                                         className="flex justify-between items-center p-2 border-b border-gray-200">
                                                        <div>
                                                            <h4 className="font-bold">{voucher.voucher_code}</h4>
                                                            <span>{voucher.description}</span>
                                                        </div>
                                                        <div>
                                                            <input type="checkbox"
                                                                   checked={form.voucher_shipping === voucher.id}
                                                                   onChange={() => chooseVoucherShipping(voucher.id)}/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={applyVoucher}
                                            className="bg-[#f26d78] text-white px-4 py-2 rounded-full font-bold">
                                        Apply Voucher
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            )}
        </div>
    );
}


export default PaymentDetailPopup;
