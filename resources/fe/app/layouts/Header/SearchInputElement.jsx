import debounce from "lodash/debounce";
import {useDispatch, useSelector} from "react-redux";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {getInputResult} from "../../redux/action/productAction";
import SpinnerLoading from "../../components/loading/SpinnerLoading";
import DetailProductPopup from "../../components/popup/DetailProductPopup.jsx";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {useTranslation} from "react-i18next";

const SearchInputElement = () => {
    const dispatch = useDispatch();
    const [results, setResults] = useState([]);
    const [closeInput, setCloseInput] = useState(false);
    const [searchParams, setSearchParams] = useState("");
    const {inputResults, loading} = useSelector((state) => state.inputResults);
    const [currentPopup, setCurrentPopup] = useState(null);
    const selectedProduct = useSelector(state => state.product.product);
    const inputContainerRef = useRef(null);
    const {openPopup, closePopup} = usePopup();
    const {t} = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputContainerRef.current && !inputContainerRef.current.contains(event.target)) {
                setCloseInput(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [inputContainerRef]);

    const handleInput = (event) => {
        setCloseInput(true);
        setSearchParams(event.target.value);
    };

    const handleSearchClick = (searchParams) => {
        setCloseInput(false);
        openPopup({popupName: 'details', productId: searchParams});
        // navigate(`/product/search/${searchParams}`);
        // goi popup detail product

    };

    const debounceSearch = useCallback(
        debounce((searchParams) => {
            dispatch(getInputResult(searchParams));
        }, 500),
        []
    );

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents default action
        }
    };

    useEffect(() => {
        if (searchParams) {
            setResults([]);
            debounceSearch(searchParams);
        }
    }, [searchParams, debounceSearch]);

    return (
        <div ref={inputContainerRef}
             className="w-full max-w-[300px] md:max-w-[450px] lg:max-w-[550px] flex flex-row items-center relative">
            {currentPopup === 'details' && (
                <DetailProductPopup isVisible={currentPopup === 'details'} selectedProduct={selectedProduct}
                                    onClose={closePopup}
                                    isEdit={false} id="detail-product"/>)}
            <form className="flex w-full items-center">
                <input
                    type="search"
                    className="block outline-none w-full py-2 px-2 md:px-5 text-sm text-gray-900 border border-gray-300 rounded-lg "
                    placeholder={t("HEADER.SEARCH_FOR_PRODUCTS")}
                    value={searchParams}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    required
                />
                {/*<MdSearch className="absolute right-5 cursor-pointer" />*/}
            </form>

            <div
                className={`${
                    searchParams && closeInput ? "h-auto" : "h-0"
                } absolute  w-[380px] md:w-[450px] lg:w-[550px] md:max-h-[300px] bg-white rounded-md top-12  shadow-xl transition-all duration-300 overflow-y-auto`}
            >
                <div className="flex flex-col gap-y-4 py-4 px-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <SpinnerLoading/>
                        </div>
                    ) : inputResults.length === 0 ? (
                        <div className="flex items-center justify-center">
                            <span>{t('HEADER.NO_PRODUCTS_FOUND')}</span>
                        </div>
                    ) : (
                        inputResults.map((result, index) => {
                            return (
                                <button
                                    onClick={() => handleSearchClick(result.id)}
                                    className="flex items-center"
                                    key={index}
                                >
                                    {result.name.slice(0, 30) + "..."}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchInputElement;
