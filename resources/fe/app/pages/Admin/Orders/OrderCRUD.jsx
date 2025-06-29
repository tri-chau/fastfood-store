import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {formatDateTime} from '../../../locales/dateFormat.js';
import {formatVietnameseCurrency} from '../../../locales/currencyFormat.js';
import {Drawer, Modal} from 'flowbite';
import {useDispatch, useSelector} from "react-redux";
import {
    adminDeleteOrder,
    adminUpdateOrder,
    getAllOrdersAdmin,
    getSearchOrdersAdmin
} from "../../../redux/action/orderAction.js";
import {notify} from "../../../layouts/Notification/notify.jsx";
import provinceJson from "../../../locales/tinh_tp.json";
import districtJson from "../../../locales/quan_huyen.json";
import {fetchWards} from "../../../redux/action/paymentAction.js";
import order from "../../Order/Order.jsx";
import debounce from "lodash/debounce";

const OrderCRUD = () => {
    const dispatch = useDispatch();
    const wards = useSelector(state => state.wards.wards); // Lấy wards từ Redux
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [searchText, setSearchText] = useState('');



    const {orders: list, loading: getOrderLoading} = useSelector(state => state.orders);

    const [form, setForm] = useState({
        order_number: '',
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
        payment_method: 'Banking',
        order_status: 'Wait for Approval',
        order_total: 0,
        // team_id: '',
    });

    const [formEdit, setFormEdit] = useState({
        id: '',
        order_number: '',
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
        payment_method: 'Banking',
        payment_status: 'pending',
        order_status: 'Wait for Approval',
        order_total: 0,
        // team_id: '',
        street: '',
        wardId: '',
        districtId: '',
        provinceId: '',
    });

    const [showDrawer, setShowDrawer] = useState(false);
    const [createDrawerInstance, setCreateDrawerInstance] = useState(null);
    const [updateDrawerInstance, setUpdateDrawerInstance] = useState(null);
    const [deleteModalInstance, setDeleteModalInstance] = useState(null);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleEditChange = (e) => {
        const {name, value} = e.target;
        setFormEdit({...formEdit, [name]: value});
    };

    useEffect(() => {
        fetchData();

        const $createDrawer = document.getElementById('create-order-modal');
        const $updateDrawer = document.getElementById('drawer-update-order');
        const $deleteModal = document.getElementById('delete-modal');

        const drawerOptions = {
            placement: 'left', backdrop: true, bodyScrolling: false, onHide: () => setShowDrawer(false),
        };
        const modalOptions = {
            backdrop: 'dynamic', closable: true,
        };

        setCreateDrawerInstance(new Drawer($createDrawer, drawerOptions));
        setUpdateDrawerInstance(new Drawer($updateDrawer, drawerOptions));
        setDeleteModalInstance(new Modal($deleteModal, modalOptions));
    }, []);

    const fetchData = async () => {
        try {
            if (searchText.trim() !== '') {
                await dispatch(getSearchOrdersAdmin(searchText));
            } else {
                await dispatch(getAllOrdersAdmin());
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [searchText]); // Mỗi khi searchText thay đổi, gọi lại fetchData



    const handleCreateOrder = async () => {
        try {
            await store.dispatch('orders/createOrder', {...form});
            notify({
                group: "foo", title: "Success", text: "Order created successfully!",
            }, 4000);
            resetForm();
            fetchData();
        } catch (error) {
            notify({
                group: "foo", title: "Error", text: "An error occurred while creating the order.",
            }, 2000);
            console.error(error);
        }
    };

    const handleOpenModal = () => {
        if(createDrawerInstance) {
            createDrawerInstance.show();
        }
    }

    const handleUpdateOrder = async (e) => {
        try {
            const payload = { ...formEdit };
            payload.receiver_address = `${formEdit.street}, ${formEdit.wardId}, ${formEdit.districtId}, ${formEdit.provinceId}`;
            await dispatch(adminUpdateOrder(formEdit.id, formEdit)).then(() => {
                updateDrawerInstance.hide();
                notify('success', 'Order updated successfully!');
                resetForm();
                fetchData();
            });
        } catch (error) {
            notify('error', 'An error occurred while updating the order.');
        }
    };

    // Định nghĩa các hàm ánh xạ trong file
    const getProvinceName = (provinceId) => {
        const province = provinceJson.find(
            (p) => p.ProvinceID.toString() === provinceId?.toString()
        );
        return province ? province.ProvinceName : provinceId;
    };

    const getDistrictName = (districtId) => {
        const district = Object.values(districtJson).find(
            (d) => d.DistrictID.toString() === districtId?.toString()
        );
        return district ? district.DistrictName : districtId;
    };

    // Hàm lấy tên phường
    const getWardName = (wardId) => {
        if (!wards) return wardId; // fallback là ID
        const found = wards.find(w => w.WardCode === wardId || w.WardCode == wardId);
        return found ? found.WardName : wardId;
    };

    // const openUpdateModal = (order) => {
    //     const [street, wardId, districtId, provinceId] = order.receiver_address.split(', ').map(part => part.trim());
    //
    //     setSelectedOrder({
    //         ...order,
    //         street,
    //         wardId,
    //         districtId,
    //         provinceId
    //     });
    //
    //     // Fetch lại wards nếu district khác với currentWards
    //     if (!wards || wards.length === 0 || wards[0].district_id !== districtId) {
    //         console.log('Fetching wards for district:', districtId);
    //         dispatch(fetchWards(districtId));
    //     }
    // };

    //fixing
    const openUpdateModal = (order) => {
        const addressParts = order.receiver_address.split(',').map(part => part.trim());
        const [street, wardInfo, districtInfo, provinceInfo] = addressParts;

        let districtIdToUse;
        let provinceIdToUse;

        // --- Xử lý District ---
        if (isNaN(parseInt(districtInfo))) { // Nếu districtInfo là Tên
            const foundDistrict = Object.values(districtJson).find(d => d.DistrictName === districtInfo);
            if (foundDistrict) {
                districtIdToUse = foundDistrict.DistrictID;
            } else {
                alert(`Lỗi: Không tìm thấy ID cho quận/huyện "${districtInfo}"`);
                return;
            }
        } else { // Nếu districtInfo là ID
            districtIdToUse = districtInfo;
        }

        // --- Xử lý Province ---
        if (isNaN(parseInt(provinceInfo))) { // Nếu provinceInfo là Tên
            const foundProvince = provinceJson.find(p => p.ProvinceName === provinceInfo);
            if (foundProvince) {
                provinceIdToUse = foundProvince.ProvinceID;
            } else {
                alert(`Lỗi: Không tìm thấy ID cho tỉnh/thành phố "${provinceInfo}"`);
                return;
            }
        } else { // Nếu provinceInfo là ID
            provinceIdToUse = provinceInfo;
        }

        // Tạo object selectedOrder đã được chuẩn hóa
        const standardizedOrder = {
            ...order,
            street: street,
            wardId: wardInfo, // ward vẫn có thể là Tên, sẽ được xử lý ở useEffect
            districtId: districtIdToUse, // Luôn là ID
            provinceId: provinceIdToUse, // Luôn là ID
        };

        setSelectedOrder(standardizedOrder);

        // Fetch wards bằng districtId đã được chuẩn hóa
        if (!wards || wards.length === 0 || String(wards[0]?.DistrictID) !== String(districtIdToUse)) {
            dispatch(fetchWards(districtIdToUse));
        }
    };


    // useEffect(() => {
    //
    //     // Guard 1: Kiểm tra các state cần thiết
    //     if (!selectedOrder || !wards || wards.length === 0) {
    //         return;
    //     }
    //     // Lấy ID để so sánh
    //     const currentWardsDistrictId = wards[0]?.DistrictID;
    //     const selectedDistrictId = selectedOrder.districtId;
    //
    //     // Guard 2: So sánh ID
    //     if (String(selectedDistrictId) === String(currentWardsDistrictId)) {
    //         const provinceName = getProvinceName(selectedOrder.provinceId);
    //         const districtName = getDistrictName(selectedOrder.districtId);
    //         const wardName = getWardName(selectedOrder.wardId);
    //         const fullAddress = `${selectedOrder.street}, ${wardName}, ${districtName}, ${provinceName}`;
    //
    //         setFormEdit({
    //             id: selectedOrder.id,
    //             order_number: selectedOrder.order_number,
    //             receiver_name: selectedOrder.receiver_name,
    //             receiver_phone: selectedOrder.receiver_phone,
    //             receiver_address: fullAddress,
    //             payment_method: selectedOrder.payment_method,
    //             order_status: selectedOrder.order_status,
    //             order_total: selectedOrder.order_total,
    //             team_id: selectedOrder.team_id,
    //         });
    //
    //         if (updateDrawerInstance) {
    //             updateDrawerInstance.show();
    //         } else {
    //             console.error('LỖI: updateDrawerInstance không tồn tại vào lúc cần gọi!');
    //         }
    //     }
    //     // Đừng quên comment dòng này lại nhé
    //     // setSelectedOrder(null);
    //
    // }, [wards, selectedOrder, updateDrawerInstance]);



    //working
    useEffect(() => {
        // Guard 1: Nếu một trong các state cần thiết chưa sẵn sàng, không làm gì cả.
        if (!selectedOrder || !wards || wards.length === 0) {
            return;
        }

        // Lấy ID từ API (có thể là undefined nếu wards rỗng)
        const currentWardsDistrictId = wards[0]?.DistrictID;
        const selectedDistrictId = selectedOrder.districtId;

        // Guard 2: Chỉ thực thi khi dữ liệu wards đã load khớp với order đang được chọn.
        // Dùng String() để đảm bảo so sánh an toàn giữa các kiểu dữ liệu.
        if (String(selectedDistrictId) === String(currentWardsDistrictId)) {

            // Tất cả điều kiện đã thỏa mãn, tiến hành tạo địa chỉ và hiển thị form
            const provinceName = getProvinceName(selectedOrder.provinceId);
            const districtName = getDistrictName(selectedOrder.districtId);

            let finalWardId;
            let finalWardName;

            // Xử lý wardId, vì nó có thể vẫn đang là Tên
            if (!isNaN(parseInt(selectedOrder.wardId))) {
                finalWardId = selectedOrder.wardId;
                finalWardName = getWardName(finalWardId);
            } else {
                const foundWard = wards.find(w => w.WardName === selectedOrder.wardId);
                if (foundWard) {
                    finalWardId = foundWard.WardCode;
                    finalWardName = foundWard.WardName;
                } else {
                    finalWardId = "Không tìm thấy";
                    finalWardName = "Không tìm thấy";
                }
            }


            const wardName = getWardName(selectedOrder.wardId);
            const fullAddress = `${selectedOrder.street}, ${wardName}, ${districtName}, ${provinceName}`;

            setFormEdit({
                id: selectedOrder.id,
                order_number: selectedOrder.order_number,
                receiver_name: selectedOrder.receiver_name,
                receiver_phone: selectedOrder.receiver_phone,
                receiver_address: fullAddress,
                payment_method: selectedOrder.payment_method,
                payment_status: selectedOrder.payment_status,
                order_status: selectedOrder.order_status,
                order_total: selectedOrder.order_total,
                team_id: selectedOrder.team_id,
                street: selectedOrder.street,
                wardId: finalWardId,
                districtId: selectedOrder.districtId,
                provinceId: selectedOrder.provinceId,
            });

            if (updateDrawerInstance) {
                updateDrawerInstance.show();
            }
        }

    }, [wards, selectedOrder, updateDrawerInstance]);


    // useEffect(() => {
    //     if (selectedOrder && wards && wards.length > 0) {
    //         const provinceName = getProvinceName(selectedOrder.provinceId);
    //         const districtName = getDistrictName(selectedOrder.districtId);
    //         const wardName = getWardName(selectedOrder.wardId);
    //
    //         const fullAddress = `${selectedOrder.street}, ${wardName}, ${districtName}, ${provinceName}`;
    //         setFormEdit({
    //             id: selectedOrder.id,
    //             order_number: selectedOrder.order_number,
    //             receiver_name: selectedOrder.receiver_name,
    //             receiver_phone: selectedOrder.receiver_phone,
    //             receiver_address: fullAddress,
    //             payment_method: selectedOrder.payment_method,
    //             order_status: selectedOrder.order_status,
    //             order_total: selectedOrder.order_total,
    //             team_id: selectedOrder.team_id,
    //         });
    //
    //         if (updateDrawerInstance) {
    //             updateDrawerInstance.show();
    //         }
    //
    //         // Reset selectedOrder sau khi hiển thị modal
    //         setSelectedOrder(null);
    //     }
    // }, [wards, selectedOrder, updateDrawerInstance]);


    const handleDeleteOrder = async (id) => {
        try {
            await dispatch(adminDeleteOrder(formEdit.id)).then(() => {
                deleteModalInstance.hide();
                updateDrawerInstance.hide();
                notify('success', 'Order deleted successfully!');
                resetForm();
                fetchData();
            });
        } catch (error) {
            notify('error', 'An error occurred while deleting the order.');
        }
    };

    const openDeleteModal = (id) => {
        setFormEdit({id: id});
        if (deleteModalInstance) {
            deleteModalInstance.show();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn reload trang
        if (searchText.trim() !== '') {
            dispatch(getSearchOrdersAdmin(searchText));
            console.log('handle submit with text:', searchText);
        } else {
            dispatch({ type: 'GET_ORDERS_SEARCH_SUCCESS', payload: [] });
        }
    };


    const resetForm = () => {
        setForm({
            id: '',
            order_number: '',
            receiver_name: '',
            receiver_phone: '',
            receiver_address: '',
            payment_method: 'Banking',
            order_status: 'Wait for Approval',
            order_total: 0,
            team_id: '',
        });
    };

    return (
        <>
            <section className="p-3 sm:p-5 antialiased h-full w-full">
                <div className="mx-auto max-w-screen-2xl px-4 lg:px-12">
                    <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                        <div
                            className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                            <div className="flex-1 flex items-center space-x-2">
                                <h5>
                                    {/*<span className="text-gray-500">{store.getters['i18n/t']('LBL_ALL_ORDER')}: </span>*/}
                                    <span className="dark:text-white">123456</span>
                                </h5>
                                <h5 className="text-gray-500 dark:text-gray-400 ml-1">1-100 (436)</h5>
                                <button type="button" className="group" data-tooltip-target="results-tooltip">
                                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                         className="h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                         viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    <span className="sr-only">More info</span>
                                </button>
                                <div id="results-tooltip" role="tooltip"
                                     className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                    Showing 1-100 of 436 results
                                    <div className="tooltip-arrow" data-popper-arrow=""></div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex flex-col md:flex-row items-stretch md:items-center md:space-x-3 space-y-3 md:space-y-0 justify-between mx-4 py-4 border-t dark:border-gray-700">
                            <div className="w-full md:w-1/2 mb-4 justify-center">
                                <form className="flex items-center" onSubmit={handleSubmit}>
                                    <label htmlFor="simple-search" className="sr-only">Search</label>
                                    <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                                 fill="currentColor" viewBox="0 0 20 20"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd"
                                                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="simple-search"
                                            placeholder="Search for Orders"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div
                                className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                {/*<button*/}
                                {/*    // v-show="store.getters.hasPermission({'module': moduleName, 'action': 'create'})"*/}
                                {/*        onClick={() => handleOpenModal()}*/}
                                {/*        type="button" id="createOrderButton" data-modal-target="create-order-modal"*/}
                                {/*        data-modal-toggle="create-order-modal"*/}
                                {/*        className="flex items-center justify-center text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary focus:outline-none dark:focus:ring-primary-800">*/}
                                {/*    <svg className="h-3.5 w-3.5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20"*/}
                                {/*         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">*/}
                                {/*        <path clipRule="evenodd" fillRule="evenodd"*/}
                                {/*              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>*/}
                                {/*    </svg>*/}
                                {/*    Add Order*/}
                                {/*</button>*/}
                                <div id="filterDropdown"
                                     className="z-10 hidden px-3 pt-1 bg-white rounded-lg shadow w-80 dark:bg-gray-700 right-0">
                                    <div className="flex items-center justify-between pt-2">
                                        <h6 className="text-sm font-medium text-black dark:text-white">Filters</h6>
                                        <div className="flex items-center space-x-3">
                                            <a href="#"
                                               className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Save
                                                view</a>
                                            <a href="#"
                                               className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline">Clear
                                                all</a>
                                        </div>
                                    </div>
                                    <div className="pt-3 pb-2">
                                        <label htmlFor="input-group-search" className="sr-only">Search</label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                     aria-hidden="true"
                                                     fill="currentColor" viewBox="0 0 20 20"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd"
                                                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                            <input type="text" id="input-group-search"
                                                   className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                   placeholder="Search keywords..."/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead
                                    className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            <input id="checkbox-all" type="checkbox"
                                                   className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" className="p-4">Order</th>
                                    <th scope="col" className="p-4">Created At</th>
                                    <th scope="col" className="p-4">Total</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4">Source</th>
                                    <th scope="col" className="p-4">Payment Status</th>
                                    <th scope="col" className="p-4">Payment Method</th>
                                    {/*<th scope="col" className="p-4">Created By</th>*/}
                                    {/*<th scope="col" className="p-4">Branch</th>*/}
                                </tr>
                                </thead>
                                <tbody>
                                {/* Order information */}
                                {!getOrderLoading && list && list?.map((order) => (
                                    <tr key={order.id} className="border-t dark:border-gray-800">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <input id={`checkbox-table-search-${order.id}`} type="checkbox"
                                                       onClick={(e) => e.stopPropagation()}
                                                       className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                <label htmlFor={`checkbox-table-search-${order.id}`}
                                                       className="sr-only">checkbox</label>
                                            </div>
                                        </td>
                                        <td className="p-4">{order.order_number}</td>
                                        <td className="p-4">{formatDateTime(order.created_at)}</td>
                                        <td className="p-4">{formatVietnameseCurrency(order.order_total)}</td>
                                        <td className="p-4">{order.order_status}</td>
                                        <td className="p-4">{order.source}</td>
                                        <td className="p-4">{order.payment_status}</td>
                                        <td className="p-4">{order.payment_method}</td>

                                        {/*Truong hop nhan vien la nguoi tao don*/}
                                        {/*<td className="p-4">{order.created_by_name}</td>*/}
                                        {/*<td className="p-4">{order.team_name}</td>*/}

                                        {/* update, delete button */}
                                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center space-x-3 justify-end">

                                                {/* update */}
                                                <button
                                                    // v-show="store.getters.hasPermission({'module': moduleName, 'action': 'edit', 'created_by': order.created_by})"
                                                    type="button" onClick={() => openUpdateModal(order)}
                                                    data-drawer-target="drawer-update-order"
                                                    data-drawer-show="drawer-update-order"
                                                    className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-primary rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-stone-300 dark:focus:ring-primary-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                                                         viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path
                                                            d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                                                        <path fillRule="evenodd"
                                                              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                              clipRule="evenodd"/>
                                                    </svg>
                                                </button>

                                                {/* delete */}
                                                <button
                                                    // v-show="store.getters.hasPermission({'module': moduleName, 'action': 'delete', 'created_by': order.created_by})"
                                                    type="button" onClick={() => openDeleteModal(order.id)}
                                                    className="flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1"
                                                         viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd"
                                                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-2 0v6a1 1 0 002 0V7z"
                                                              clipRule="evenodd"/>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t dark:border-gray-800">
                            <div className="flex items-center space-x-3">
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200 hover:underline">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         className="h-4 w-4 mr-1.5 -ml-1 text-gray-400 dark:text-gray-400"
                                         viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                                    </svg>
                                    Previous
                                </button>
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200 hover:underline">
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         className="h-4 w-4 ml-1.5 -mr-1 text-gray-400 dark:text-gray-400"
                                         viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M14.707 12.707a1 1 0 01-1.414 0L10 8.414l-3.293 4.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200 hover:underline">
                                    1
                                </button>
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                                    2
                                </button>
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                                    3
                                </button>
                                <button type="button"
                                        className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                                    4
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            );

            {/* Create Order Modal */}
            <div id="create-order-modal" tabIndex="-1" aria-hidden="true"
                 className="fixed top-0 right-0 z-999 w-full h-screen max-w-3xl p-4 overflow-y-auto transition-transform -translate-x-full bg-white dark:bg-gray-800">
                {/*<div className="relative p-4 w-full max-w-3xl h-full md:h-auto z-9999">*/}
                    {/*<div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">*/}
                        <div
                            className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Order</h3>
                            <button type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-toggle="create-order-modal"
                                    onClick={() => createDrawerInstance.hide()}>
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                                e.preventDefault();handleCreateOrder(form);
                            }}>
                            <div className="grid gap-4 mb-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="order_number"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order
                                        Number</label>
                                    <input name="order_number" value={form.order_number} onChange={handleChange}
                                           type="text" id="order_number"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                           placeholder="Order Number" required/>
                                </div>
                                <div>
                                    <label htmlFor="receiver_name"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Receiver
                                        Name</label>
                                    <input name="receiver_name" value={form.receiver_name} onChange={handleChange}
                                           type="text" id="receiver_name"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                           placeholder="Receiver Name" required/>
                                </div>
                                <div>
                                    <label htmlFor="receiver_phone"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Receiver
                                        Phone</label>
                                    <input name="receiver_phone" value={form.receiver_phone} onChange={handleChange}
                                           type="text" id="receiver_phone"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                           placeholder="Receiver Phone" required/>
                                </div>
                                <div>
                                    <label htmlFor="receiver_address"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Receiver
                                        Address</label>
                                    <input name="receiver_address" value={form.receiver_address} onChange={handleChange}
                                           type="text" id="receiver_address"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                           placeholder="Receiver Address" required/>
                                </div>
                                <div>
                                    <label htmlFor="payment_method"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Payment
                                        Method</label>
                                    <select name="payment_method" value={form.payment_method} onChange={handleChange}
                                            id="payment_method"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required>
                                        <option value="Banking">Banking</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="order_status"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order
                                        Status</label>
                                    <select name="order_status" value={form.order_status} onChange={handleChange}
                                            id="order_status"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required>
                                        <option value="Wait for Approval">Wait for Approval</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Delivering">Delivering</option>
                                        {/*<option value="Delivered">Delivered</option>*/}
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="order_total"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order
                                        Total</label>
                                    <input name="order_total" value={form.order_total} onChange={handleChange}
                                           type="number" id="order_total"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                           placeholder="Order Total" required/>
                                </div>
                                {/*<div>*/}
                                {/*    <label htmlFor="team_id"*/}
                                {/*           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Branch</label>*/}
                                {/*    <select name="team_id" value={form.team_id} onChange={handleChange} id="team_id"*/}
                                {/*            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"*/}
                                {/*            required>*/}
                                {/*        {teams.map((team) => (*/}
                                {/*            <option key={team.id} value={team.id}>{team.name}</option>))}*/}
                                {/*    </select>*/}
                                {/*</div>*/}
                            </div>
                            <div className="items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                                <button type="submit"
                                        className="w-full sm:w-auto justify-center text-white inline-flex bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary dark:focus:ring-primary-800">
                                    Add Order
                                </button>
                                <button data-modal-toggle="create-order-modal" type="button"
                                        className="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                    <svg className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    Discard
                                </button>
                            </div>
                        </form>
                    {/*</div>*/}
                {/*</div>*/}
            </div>

            {/* Edit Order Drawer */}
            <form action="#" id="drawer-update-order"
                  className="fixed top-0 right-0 z-999 w-full h-screen max-w-3xl p-4 overflow-y-auto transition-transform -translate-x-full bg-white dark:bg-gray-800"
                  tabIndex="-1" aria-labelledby="drawer-update-order-label" aria-hidden="true">
                <h5 id="drawer-label"
                    className="inline-flex items-center mb-6 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
                    Edit Order
                </h5>
                <button type="button" data-drawer-dismiss="drawer-update-order" aria-controls="drawer-update-order"
                        onClick={() => updateDrawerInstance.hide()}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"/>
                    </svg>
                    <span className="sr-only">Close menu</span>
                </button>
                <div className="grid gap-4 sm:grid-cols-1 sm:gap-6">
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div className="grid gap-4 sm:col-span-2 md:gap-6 sm:grid-cols-1">
                            <div>
                                <label htmlFor="order_number"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Order Number
                                </label>
                                <input
                                    name="order_number"
                                    value={formEdit.order_number}
                                    onChange={handleEditChange}
                                    type="text"
                                    id="order_number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Order Number"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="receiver_name"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Receiver Name
                                </label>
                                <input
                                    name="receiver_name"
                                    value={formEdit.receiver_name}
                                    onChange={handleEditChange}
                                    type="text"
                                    id="receiver_name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Receiver Name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="receiver_phone"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Receiver Phone
                                </label>
                                <input
                                    name="receiver_phone"
                                    value={formEdit.receiver_phone}
                                    onChange={handleEditChange}
                                    type="text"
                                    id="receiver_phone"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Receiver Phone"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="receiver_address"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Receiver Address
                                </label>
                                <input
                                    name="receiver_address"
                                    value={formEdit.receiver_address}
                                    onChange={handleEditChange}
                                    type="text"
                                    id="receiver_address"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Receiver Address"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="payment_method"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Payment Method
                                </label>
                                <select
                                    name="payment_method"
                                    value={formEdit.payment_method}
                                    onChange={handleEditChange}
                                    id="payment_method"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                >
                                    <option value="Banking">Banking</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="payment_status"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Payment Status
                                </label>
                                <select
                                    name="payment_status"
                                    value={formEdit.payment_status}
                                    onChange={handleEditChange}
                                    id="payment_status"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="order_status"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Order Status
                                </label>
                                <select
                                    name="order_status"
                                    value={formEdit.order_status}
                                    onChange={handleEditChange}
                                    id="order_status"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                >
                                    <option value="Wait for Approval">Wait for Approval</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Delivering">Delivering</option>
                                    {/*<option value="Delivered">Delivered</option>*/}
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="order_total"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Order Total
                                </label>
                                <input
                                    name="order_total"
                                    value={formEdit.order_total}
                                    onChange={handleEditChange}
                                    type="number"
                                    id="order_total"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Order Total"
                                    required
                                />
                            </div>
                            {/*<div>*/}
                            {/*    <label htmlFor="team_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">*/}
                            {/*        Branch*/}
                            {/*    </label>*/}
                            {/*    <select*/}
                            {/*        name="team_id"*/}
                            {/*        value={formEdit.team_id}*/}
                            {/*        onChange={handleEditChange}*/}
                            {/*        id="team_id"*/}
                            {/*        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"*/}
                            {/*        required*/}
                            {/*    >*/}
                            {/*        {teams.map((team) => (<option key={team.id} value={team.id}>*/}
                            {/*            {team.name}*/}
                            {/*        </option>))}*/}
                            {/*    </select>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 sm:w-1/2">
                    <button onClick={() => handleUpdateOrder(formEdit)} type="button"
                            className="text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary dark:focus:ring-primary-800">
                        Update Order
                    </button>
                    <button onClick={() => handleDeleteOrder(formEdit.id)} type="button"
                            className="text-red-600 inline-flex justify-center items-center hover:text-white border border-red-600 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                        <svg aria-hidden="true" className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </form>


            {/* Delete Modal */}
            <div id="delete-modal" tabIndex="-1"
                 className="fixed top-0 left-0 right-0 z-999 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center">
                <div className="relative w-full h-auto max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button type="button"
                                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                                data-modal-toggle="delete-modal"
                                onClick={() => deleteModalInstance.hide()}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                        <div className="p-6 text-center">
                            <svg aria-hidden="true" className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete this Order?
                            </h3>
                            <button data-modal-toggle="delete-modal" type="button"
                                    onClick={() => handleDeleteOrder(formEdit.id)}
                                    className="text-white bg-red hover:bg-rose-600 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                                Yes, I'm sure
                            </button>
                            <button data-modal-toggle="delete-modal" type="button"
                                    onClick={() => deleteModalInstance.hide()}
                                    className="text-gray-500 bg-white hover:bg-stroke focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                No, cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default OrderCRUD;
