import React, {useCallback, useEffect, useState} from 'react';
import OrderList from './models/OrderList';
import {getAllOrders} from "../../redux/action/orderAction.js";
import {useDispatch, useSelector} from "react-redux";
import debounce from "lodash/debounce";
import SpinnerLoading from "../../components/loading/SpinnerLoading.jsx";
import {useTranslation} from "react-i18next";


const Order = () => {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const dispatchOrder = useDispatch();
    const newOrders = useSelector((state) => state.orders.orders);
    const [activeTab, setActiveTab] = useState('Wait For Approval');
    const tabs = [
        {id: 'Wait For Approval', label: t('ORDERS.WAIT_FOR_APPROVAL')},
        {id: 'In Progress', label: t('ORDERS.IN_PROGRESS')},
        {id: 'Delivering', label: t('ORDERS.DELIVERING')},
        {id: 'Delivered', label: t('ORDERS.DELIVERED')},
        {id: 'Completed', label: t('ORDERS.COMPLETED')},
        {id: 'Cancelled', label: t('ORDERS.CANCELLED')},
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    // cap nhat data sau khi fetch xong
    useEffect(() => {
        console.log('newOrders', newOrders);
    }, [newOrders]);

    const fetchOrders = useCallback(
        debounce(async () => {
            if (loading) return;
            setLoading(true);
            const form = {
                //     searchText: searchText,
                //     category_id: selectedCategory,
                //     min_price: filtersOption.minPrice,
                //     max_price: filtersOption.maxPrice,
                //     fromDate: filtersOption.fromDate,
                //     toDate: filtersOption.toDate,
                //     order: filtersOption.order,
            };

            await dispatchOrder(getAllOrders(undefined, form));
            setLoading(false);
        }, 500),
        [loading, dispatchOrder]
    );

    const onTabChange = (tab1) => {
        let activeTabNew = tabs.find((tab) => tab.id === tab1);
        setActiveTab(activeTabNew.id);
    };

    const changeSearchText = (e) => {
        if (e.key === 'Enter') {
            // Handle search text change
        }
    };

    const refreshData = async () => {
        // Refresh data
    };

    return (
        <div className="m-auto flex items-center justify-center flex-col w-[80%] h-full mt-10">
            <div className="flex p-6 gap-4 w-full h-full justify-center">
                {/* Order Tabs*/}
                <div>
                    <span className="text-gray-500 text-3xl font-bold whitespace-nowrap">{t('ORDERS.ORDER_HISTORY')}</span>
                    <div className="flex flex-col mb-4 border-gray-200 dark:border-gray-700 mt-6">
                        <ul className="flex flex-wrap flex-col gap-3 -mb-px text-sm font-semibold text-center">
                            {tabs.map((tab) => (
                                <li key={tab.id} className="me-2 flex justify-end">
                                    <button
                                        className={`hover:bg-stone-300 shadow-lg inline-flex items-center px-4 py-3 rounded-lg w-[180px] ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-stone-300'}`}
                                        id={`${tab.id}-tab`}
                                        type="button"
                                        aria-controls={`${tab.id}-content`}
                                        aria-selected={activeTab === tab.id}
                                        onClick={() => onTabChange(tab.id)}
                                    >
                                        {tab.label} {newOrders?.[tab.id]?.length > 0 && <span className="text-white bg-red rounded-full px-2 py-1 text-xs ml-2">{newOrders?.[tab.id]?.length}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Order List*/}
                <div className="flex flex-col mt-2 w-full">

                    {/* turn off filter features */}

                    {/*<div id="divToScroll" className="search flex flex-row items-center h-[38px] w-full">*/}
                    {/*      /!*  search *!/*/}
                    {/*      <div className="bg-white search_btn flex flex-row w-[71%] p-2 pl-1 h-full shadow-sm">*/}
                    {/*        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ABBA7C" className="size-8 text-gray-400">*/}
                    {/*          <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />*/}
                    {/*          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />*/}
                    {/*        </svg>*/}
                    {/*        <input type="text" value={searchTextInput} onChange={(e) => setSearchTextInput(e.target.value)} onKeyDown={changeSearchText} placeholder="Search" className="search_input bg-white h-full w-full focus:outline-none" />*/}
                    {/*      </div>*/}

                    {/*      /!*  filter *!/*/}
                    {/*      <Button pill onClick={() => openPopup('filter')} className="ml-1 text-white shadow-sm bg-[#ABBA7C] text-gray-500 h-full focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-semibold rounded-full text-sm px-4 py-2.5 me-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 inline-flex items-center">*/}
                    {/*        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25" stroke="white" className="size-5">*/}
                    {/*          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />*/}
                    {/*        </svg>*/}
                    {/*        <span className="text-white">Filter</span>*/}
                    {/*      </Button>*/}
                    {/*      /!*<FilterPopup isVisible={currentPopup === 'filter'} onApplyFilters={handleFilterUpdate} onClosePopup={closePopup} />*!/*/}

                    {/*      /!* sort *!/*/}
                    {/*        <Button pill onClick={() => setIsOpen(!isOpen)} className="ml-0.5 text-white shadow-sm bg-[#ABBA7C] text-gray-500 h-full focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-semibold rounded-full text-sm px-4 py-2.5 me-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 inline-flex items-center">*/}
                    {/*        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25" className="size-5" stroke="white">*/}
                    {/*          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />*/}
                    {/*        </svg>*/}
                    {/*        <span className="text-white">Sort</span>*/}
                    {/*        {isOpen && (*/}
                    {/*          <div className="up absolute right-0 top-[120%] z-50 bg-white shadow-lg p-4 rounded-md w-[150px] flex flex-col space-y-2">*/}
                    {/*            <div className="active flex flex-row items-center justify-between">*/}
                    {/*              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="size-4">*/}
                    {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />*/}
                    {/*              </svg>*/}
                    {/*              <div className="text-black-2 text-right text-sm font-semibold font-['Inter']">Price: Descending</div>*/}
                    {/*            </div>*/}
                    {/*            <div className="inactive flex flex-row items-center justify-between">*/}
                    {/*              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#d0d0d0" className="size-4">*/}
                    {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />*/}
                    {/*              </svg>*/}
                    {/*              <div className="text-[#d0d0d0] text-right text-sm font-semibold font-['Inter']">Price: Ascending</div>*/}
                    {/*            </div>*/}
                    {/*          </div>*/}
                    {/*        )}*/}
                    {/*      </Button>*/}

                    {/*      /!* refresh *!/*/}
                    {/*      <Button pill onClick={refreshData} className="font-semibold ml-0.5 text-white shadow-sm bg-[#ABBA7C] text-gray-500 h-full focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 rounded-full text-sm px-4 py-2.5 me-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 inline-flex items-center">*/}
                    {/*        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">*/}
                    {/*          <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" />*/}
                    {/*        </svg>*/}
                    {/*        <span className="text-white">Refresh</span>*/}
                    {/*      </Button>*/}
                    {/*</div>*/}
                    {loading ? <SpinnerLoading/> : <OrderList orders={newOrders?.[activeTab]} refetchOrder={fetchOrders}/>}
                </div>
            </div>
        </div>
    );
};

export default Order;
