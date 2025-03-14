import React, { useState } from 'react';
import {useTranslation} from "react-i18next";

const FilterPopup = ({ isVisible, closePopup, onApplyFilters }) => {
    const {t} = useTranslation();

    const [filterSearch, setFilterSearch] = useState({
        minPrice: '',
        maxPrice: '',
        // tag: [],
        // fromDate: '',
        // toDate: '',
    });

    const listTag = [
        { id: 't01', name: 'Summer' },
        { id: 't02', name: 'Winter' },
        { id: 't03', name: 'Hot' },
        { id: 't04', name: 'Cold' },
        { id: 't05', name: 'Sweet' },
        { id: 't06', name: 'Sour' },
        { id: 't07', name: 'Cool' },
    ];

    const toggleTag = (id) => {
        setFilterSearch((prev) => {
            const newTags = prev.tag.includes(id)
                ? prev.tag.filter((tagId) => tagId !== id)
                : [...prev.tag, id];
            return { ...prev, tag: newTags };
        });
    };

    const clearAll = () => {
        setFilterSearch({
            minPrice: '',
            maxPrice: '',
            // tag: [],
            // fromDate: '',
            // toDate: '',
        });
    };

    const applyFilters = () => {
    if (filterSearch.maxPrice && filterSearch.minPrice && parseFloat(filterSearch.maxPrice) < parseFloat(filterSearch.minPrice)) {
        alert('Max price should be greater than or equal to Min price');
        return;
    }
    onApplyFilters(filterSearch);
    closePopup();
};

    if (!isVisible) return null;

    return (
        <div className="overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closePopup}>
            <div className="bg-white rounded-lg shadow-lg w-[80%] lg:w-[25%] p-6 space-y-6 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-4">
                    <p onClick={closePopup} className="text-gray-600 text-sm font-bold cursor-pointer hover:text-gray-800">{t('MENU.FILTERS.CANCEL')}</p>
                    <h2 className="text-black text-2xl font-semibold">{t('MENU.FILTERS.FILTER_PRODUCTS')}</h2>
                    <p onClick={clearAll} className="text-red-500 text-sm font-bold cursor-pointer hover:text-red-700">{t('MENU.FILTERS.CLEAR_ALL')}</p>
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t('MENU.FILTERS.PRICE_RANGE')}</label>
                    <div className="flex flex-col gap-2">
                        <input
                            type="number"
                            value={filterSearch.minPrice}
                            onChange={(e) => setFilterSearch({ ...filterSearch, minPrice: e.target.value })}
                            placeholder={t('MENU.FILTERS.MIN_PRICE')}
                            className="w-full border border-gray-100 rounded p-3 text-sm focus:ring-2 focus:ring-[#6B4226]"
                            min={1000}
                            step={500}
                        />
                        <input
                            type="number"
                            value={filterSearch.maxPrice}
                            onChange={(e) => setFilterSearch({ ...filterSearch, maxPrice: e.target.value })}
                            placeholder={t('MENU.FILTERS.MAX_PRICE')}
                            className="w-full border border-gray-100 rounded p-3 text-sm focus:ring-2 focus:ring-[#6B4226]"
                            min={1000}
                            step={500}
                        />
                    </div>
                </div>

                {/*<div>*/}
                {/*    <label className="block text-gray-700 font-semibold mb-2">Date Range</label>*/}
                {/*    <div className="flex flex-col gap-2">*/}
                {/*        <input*/}
                {/*            type="date"*/}
                {/*            value={filterSearch.fromDate}*/}
                {/*            onChange={(e) => setFilterSearch({ ...filterSearch, fromDate: e.target.value })}*/}
                {/*            className="w-full border border-gray-100 rounded p-3 text-sm focus:ring-2 focus:ring-[#6B4226]"*/}
                {/*            placeholder="From Date"*/}
                {/*        />*/}
                {/*        <input*/}
                {/*            type="date"*/}
                {/*            value={filterSearch.toDate}*/}
                {/*            onChange={(e) => setFilterSearch({ ...filterSearch, toDate: e.target.value })}*/}
                {/*            className="w-full border border-gray-100 rounded p-3 text-sm focus:ring-2 focus:ring-[#6B4226]"*/}
                {/*            placeholder="To Date"*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div>*/}
                {/*    <label className="block text-gray-700 font-semibold mb-2">Tags</label>*/}
                {/*    <div className="flex flex-wrap gap-2">*/}
                {/*        {listTag.map((tag) => (*/}
                {/*            <button*/}
                {/*                key={tag.id}*/}
                {/*                onClick={() => toggleTag(tag.id)}*/}
                {/*                className={`px-4 py-2 text-sm rounded-full border transition-all ${*/}
                {/*                    filterSearch.tag.includes(tag.id)*/}
                {/*                        ? 'bg-[#6B4226] text-white border-transparent'*/}
                {/*                        : 'bg-gray-200 text-gray-700 border-gray-100 hover:bg-gray-300'*/}
                {/*                }`}*/}
                {/*            >*/}
                {/*                {tag.name}*/}
                {/*            </button>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="flex justify-end">
                    <button onClick={applyFilters} className="w-full sm:w-auto justify-center inline-flex bg-secondary text-white focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        {t('MENU.FILTERS.APPLY')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterPopup;
