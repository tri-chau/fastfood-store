import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatVietnameseCurrency } from '../../locales/currencyFormat.js';
import { addProductToCart, fetchCart, resetCart, updateProductInCart } from "../../redux/action/cartAction.js";
import { useAuth } from "../../hooks/contexts/authContext/index.jsx";
import { usePopup } from "../../hooks/contexts/popupContext/popupState.jsx";
import { notify } from "../../layouts/Notification/notify.jsx";
import SpinnerLoading from "../loading/SpinnerLoading.jsx";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { formatDate } from '../../locales/dateFormat.js';

import connectApi from '../../../settings/ConnectApi.js';

const DetailProductPopup = ({ isVisible, isEdit, productDetailInCart }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const selectedProduct = useSelector(state => state.product.product);

    // Find the correct size from selectedProduct.size_list
    // use state for size
    const initialSize = useMemo(() => {
        return selectedProduct?.size_list?.find(size => size.name === productDetailInCart?.size) || {
            name: 'S',
            price: '0'
        };
    }, [selectedProduct, productDetailInCart]);
    const [selectedSize, setSelectedSize] = useState(initialSize);

    // use state for topping
    const [selectedToppings, setSelectedToppings] = useState(
        (selectedProduct?.topping_list || []).map(topping => ({
            ...topping,
            is_selected: productDetailInCart?.toppings?.some(moreTopping => moreTopping.topping_id === topping.id) || false,
        }))
    );

    // use state for quantity and note
    const [quantity, setQuantity] = useState(productDetailInCart?.quantity || 1);
    const [note, setNote] = useState(productDetailInCart?.note || '');

    // use state for handling add product to cart
    const { cartData, loading } = useSelector(state => state.cart);
    const [product, setProduct] = useState({});
    // const {currentPopup, openPopup, closePopup, switchPopup} = usePopupState();

    // use state for auto calculate total price
    const [totalPrice, setTotalPrice] = useState(0);
    const selectedToppingsKey = useRef(0);

    // use state for auto change images
    const currentImageIndexRef = useRef(0); // Dùng useRef thay vì useState
    const imageRef = useRef(null); // Tham chiếu đến thẻ <img>
    const [images, setImages] = useState([]);

    const { userLoggedIn } = useAuth();
    const { openPopup, closePopup, switchPopup } = usePopup();

    // reset state after add product to cart
    const resetState = async () => {
        setSelectedSize(initialSize);
        setSelectedToppings(
            (selectedProduct?.topping_list || []).map(topping => ({
                ...topping,
                is_selected: false,
            }))
        );
        setQuantity(1);
        setNote('');
        await dispatch(resetCart());
        setProduct({});
    }

    // change quantity
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    // handle topping click
    const handleToppingClick = useCallback((topping) => {
        setSelectedToppings((prev) => {
            const exists = prev.find((t) => t.id === topping.id);
            if (exists) {
                return prev.map((t) =>
                    t.id === topping.id ? { ...t, is_selected: !t.is_selected } : t
                );
            }
            return [...prev, { ...topping, is_selected: true }];
        });
    }, []);

    // handle add to cart
    const addToCart = async () => {
        if (!selectedProduct) {
            console.error('Selected product is not defined');
            return;
        }
        // check login
        if (!userLoggedIn)
            return switchPopup({ popupName: 'login' });

        // start loading

        // get available carts
        await dispatch(fetchCart());
    };

    // ngan chan render lan dau cho cartData
    const isFirstRenderForListCart = useRef(true);

    // dispatch xong fetchCart thi setProduct
    useEffect(() => {
        if (isFirstRenderForListCart.current) {
            isFirstRenderForListCart.current = false;
            return;
        }
        // khi resetState thi useEffect nay se chay, ngan chan no
        if (!cartData) return;
        const newProduct = {
            product_id: selectedProduct.id,
            total_price: totalPrice,
            size: selectedSize.name,
            toppings_id: selectedToppings.filter(topping => topping.is_selected).map(topping => topping.id),
            note: note,
            quantity: quantity,
        };

        setProduct(newProduct);
    }, [cartData]);

    // ngan chan render lan dau cho product
    const isFirstRenderForProduct = useRef(true);

    // setProduct xong thi addProductToCart
    useEffect(() => {
        if (isFirstRenderForProduct.current) {
            isFirstRenderForProduct.current = false;
            return;
        }

        // neu dang cap nhat thi khong add vao cart
        if (isEdit) return;

        // khi resetState thi useEffect nay se chay, ngan chan no
        if (!product) return;

        if (cartData && cartData.length === 0) {
            dispatch(addProductToCart(product)).then(() => {
                notify('success', 'Add product to cart successfully');
                resetState();
                closePopup();
            });
            // notify('success', 'Add product to cart successfully');
            // resetState();
            // closePopup();
        } else {
            openPopup({ popupName: 'cartSelection', product: product, cartData: cartData, resetState: resetState });
        }
    }, [product]);

    useEffect(() => {
        selectedToppingsKey.current += 1;
    }, [selectedToppings]);

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!selectedProduct?.id) return;
            try {
                const { data } = await connectApi.get(`/api/reviews/by-product/${selectedProduct.id}`);
                setReviews(data.data || []);
            } catch (error) {
                setReviews([]);
            }
        };
        if (isVisible && selectedProduct?.id) {
            fetchReviews();
        }
    }, [isVisible, selectedProduct]);

    const averageRating = reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

    const saveEditing = async () => {
        if (!selectedProduct) {
            notify('error', 'Selected product is not defined');
            return;
        }

        const updatedProduct = {
            order_id: productDetailInCart.order_id,
            order_detail_id: productDetailInCart.id,
            size: selectedSize.name,
            toppings_id: selectedToppings.filter(topping => topping.is_selected).map(topping => topping.id),
            quantity: quantity,
            note: note,
            total_price: totalPrice,
        };

        try {
            const result = await dispatch(updateProductInCart(updatedProduct));
            notify('success', 'Update product successfully');
            fetchCart();
            openPopup({ popupName: 'cartDrawer' });
        } catch (error) {
            notify('error', 'Update product failed');
        }
    };

    const handleClosePopup = () => {
        if (isEdit) {
            openPopup({ popupName: 'cartDrawer' });
        } else {
            closePopup();
        }
    }

    // auto calculate total price
    useEffect(() => {
        let total = parseFloat(selectedProduct?.price?.replace(/[^0-9.-]+/g, "")) || 0;

        if (selectedSize && selectedSize.price) {
            total += parseFloat(selectedSize.price.replace(/[^0-9.-]+/g, ""));
        }

        selectedToppings.forEach(topping => {
            if (topping.is_selected) {
                total += parseFloat(topping.price.replace(/[^0-9.-]+/g, ""));
            }
        });

        total *= quantity;
        setTotalPrice(total);
    }, [selectedProduct, selectedSize, selectedToppings, quantity]);

    // stop background scroll
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Clean up in case the component is unmounted while visible
        return () => {
            document.body.style.overflow = '';
        };
    }, [isVisible]);

    // get images from selectedProduct
    useEffect(() => {
        if (selectedProduct) {
            console.log('selectedProduct', selectedProduct);
            setImages([
                selectedProduct.image_url,
                ...(selectedProduct.productDetailImages || []).map(img => img.image_url)
            ]);
        }
    }, [selectedProduct]);

    // auto change images
    // useEffect(() => {
    //     if (images.length > 1) {
    //         const interval = setInterval(() => {
    //             currentImageIndexRef.current = (currentImageIndexRef.current + 1) % images.length;
    //             if (imageRef.current) {
    //                 imageRef.current.src = images[currentImageIndexRef.current]; // Cập nhật ảnh trực tiếp
    //             }
    //         }, 3000); // 3s đổi ảnh một lần nêu có nhiều hơn 1 ảnh
    //
    //         return () => clearInterval(interval);
    //     }
    // }, [images]);

    if (!isVisible) return null;

    return (
        <div className="overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[1300px] h-[600px] relative flex z-9999"
                onClick={(e) => e.stopPropagation()}>
                {/* Left Section (ảnh) */}
                <div
                    className="border flex-col items-center justify-center overflow-y-auto transition-transform-translate-x-full w-[640px]"
                    style={{ maxHeight: '600px' }} // Optional: ensures max height for scrolling
                >
                    <div className="shadow-lg h-[580px] h-[600px] overflow-hidden rounded-l-lg flex items-center justify-center relative">
                        {/*/!* Left Arrow Button *!/*/}
                        {/*<button*/}
                        {/*    onClick={() => {*/}
                        {/*        if (images.length === 1) return;*/}
                        {/*        currentImageIndexRef.current = (currentImageIndexRef.current - 1 + images.length) % images.length;*/}
                        {/*        if (imageRef.current) {*/}
                        {/*            imageRef.current.src = images[currentImageIndexRef.current];*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    className="absolute left-8 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">*/}
                        {/*    <FaArrowLeft />*/}
                        {/*</button>*/}

                        {/* Image */}
                        <img
                            ref={imageRef}
                            src={images[0] || "/build/assets/Product/empty-image.png"}
                            alt="Product Image"
                            className="w-[550px] h-[550px] object-cover aspect-square rounded-lg"
                        />

                        {/*/!* Right Arrow Button *!/*/}
                        {/*<button*/}
                        {/*    onClick={() => {*/}
                        {/*        if (images.length === 1) return;*/}
                        {/*        currentImageIndexRef.current = (currentImageIndexRef.current + 1) % images.length;*/}
                        {/*        if (imageRef.current) {*/}
                        {/*            imageRef.current.src = images[currentImageIndexRef.current];*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    className="absolute right-8 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">*/}
                        {/*    <FaArrowRight />*/}
                        {/*</button>*/}
                    </div>

                    <div className="flex flex-col px-6 mt-4 w-[600px] rounded-l-lg">
                        <h3 className="text-[30px] font-bold mb-2">{t('DETAIL_PRODUCT.REVIEWS_SECTION')}</h3>

                        {/* display average rating */}
                        {averageRating && (
                            <div className="mb-2 text-[20px] font-semibold">
                                <span className="font-semibold">{averageRating}</span>
                                <span className="font-serif text-yellow-500 ml-2">
                                    {"★".repeat(Math.round(averageRating))}
                                </span>
                            </div>
                        )}

                        {reviews && reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review?.id} className="mb-2 p-2 border border-[#002a86] rounded">
                                    <span className="font-semibold mr-2 text-[#002a86]">
                                        {review.customer_name || "Ẩn danh"}
                                    </span>
                                    <div className="flex flex-row flex-wrap items-center mt-4 w-full">
                                        <span className="font-semibold italic">
                                            {formatDate(review?.created_at)}
                                        </span>
                                        {review?.is_edited === 1 && (
                                            <span className="text-[18px] font-serif text-stone-400 ml-2">
                                                {"(edited)"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-yellow-500">{"★".repeat(review?.rating)}</div>
                                    <div>{review?.comment}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[20px] py-5 text-[#9f1000]">
                                { t('DETAIL_PRODUCT.NO_REVIEWS') }
                            </div>
                        )}
                    </div>
                </div>

                {/*right*/}
                <div className="flex flex-col w-[700px] pr-6 pl-6 pt-4 pb-2">
                    {/*name and price*/}
                    <div className="flex flex-row items-center justify-between h-[16%]">
                        <div className="w-full lg:w-2/3">
                            <h2 className="text-[#002a86] text-2xl lg:text-3xl font-semibold mb-2">{selectedProduct?.name}</h2>
                            <p className="text-[#002a86] text-lg lg:text-xl">{formatVietnameseCurrency(selectedProduct?.price)}</p>
                        </div>
                        <div className="h-full">
                            <button onClick={handleClosePopup} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/*product selection*/}
                    <div className="flex w-full h-[74%]">
                        <div className="w-full flex flex-col justify-start mb-2">
                            {/*Size*/}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[#002a86] font-semibold text-lg">{t('DETAIL_PRODUCT.SIZE')}</p>
                                </div>
                                <div className="flex space-x-4">
                                    {selectedProduct?.size_list.map(size => (
                                        <button
                                            key={size.name}
                                            className={`px-4 py-2 rounded-lg text-xs md:text-[16px] font-medium transition-all
                                                focus:ring-2 focus:ring-[#002a86] focus:ring-offset-2
                                                ${selectedSize.name === size.name ? 'bg-[#fccc00] font-semibold text-[#9f1000] shadow-md' : 'bg-stone-100 text-[#002a86] hover:bg-stone-300 shadow-md'}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/*Topping */}
                            <div className="mb-5">
                                <p className="text-[#002a86] font-bold text-lg mb-2">{t('DETAIL_PRODUCT.TOPPING')}</p>
                                <div className="flex space-x-4">
                                    {selectedProduct?.topping_list.length !== 0 ? (
                                        selectedProduct?.topping_list.map((topping) => {
                                            const isSelected = selectedToppings.some((t) => t.id === topping.id && t.is_selected);
                                            return (
                                                <button
                                                    key={topping.id + selectedToppingsKey.current}
                                                    className={`px-4 py-2 rounded-lg text-xs md:text-[16px] font-medium transition-all focus:ring-2 focus:ring-[#002a86] focus:ring-offset-2
                                                    ${isSelected
                                                            ? "bg-[#fccc00] font-semibold text-[#9f1000] shadow-md"
                                                            : "bg-stone-100 text-[#002a86] hover:bg-stone-300 shadow-md"
                                                        }`}
                                                    onClick={() => handleToppingClick(topping)}>
                                                    {topping.name}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <span>{t('DETAIL_PRODUCT.NO_TOPPING')}</span>
                                    )}
                                </div>
                            </div>

                            {/*Quantity*/}
                            <div className="mb-4 flex items-center space-x-4">
                                {/* Text "Quantity" */}
                                <p className="text-[#002a86] font-bold text-lg">{t('DETAIL_PRODUCT.QUANTITY')}</p>

                                {/* Buttons and Input in a Row */}
                                <div className="relative flex items-center space-x-2">
                                    <button
                                        type="button"
                                        id="decrement-button"
                                        onClick={decreaseQuantity}
                                        className="flex items-center justify-center bg-stone-100 dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-stone-300 border border-[#002a86] rounded-lg h-8 w-8 focus:ring-[#002a86] focus:ring-2 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="h-4 w-4 text-[#002a86]"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                        </svg>
                                    </button>

                                    <input
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        type="text"
                                        id="quantity-input"
                                        aria-describedby="helper-text-explanation"
                                        className="bg-gray-50 border border-gray-300 rounded-lg text-center text-gray-900 text-sm w-16 py-1.5 focus:ring-2 focus:ring-gray-100 focus:outline-none"
                                    />

                                    <button
                                        type="button"
                                        id="increment-button"
                                        onClick={increaseQuantity}
                                        className="flex items-center justify-center bg-stone-100 dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-stone-300 border border-[#002a86] rounded-lg h-8 w-8 focus:ring-[#002a86] focus:ring-2 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="h-4 w-4 text-[#002a86]"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>


                            {/*Note */}
                            <div className="mb-4">
                                <p className="text-[#002a86] font-bold text-lg mb-2">{t('DETAIL_PRODUCT.NOTE')}</p>
                                <div className="flex flex-wrap grid-cols-4 gap-1">
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        id="description"
                                        rows="4"
                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder={t('DETAIL_PRODUCT.EXAMPLE_NOTE')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Total price and add cart button*/}
                    <div className="flex justify-end items-center space-x-4 h-[10%]">
                        <div>
                            <span className="mr-3">
                                {t('DETAIL_PRODUCT.TOTAL')}: {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </span>
                            {!isEdit ? (
                                <button onClick={addToCart}
                                    className="bg-[#fccc00] text-[#002a86] hover:bg-[#ffe77f] px-4 py-2 rounded-full font-bold">
                                    {/*Add to cart*/}
                                    {loading ? <SpinnerLoading /> : t('DETAIL_PRODUCT.ADD_TO_CART')}
                                </button>
                            ) : (
                                <button onClick={saveEditing}
                                    className="bg-[#fccc00] text-[#002a86] hover:bg-[#ffe77f] px-4 py-2 rounded-full font-bold">
                                    {loading ? <SpinnerLoading /> : t('DETAIL_PRODUCT.EDIT_CONFIRM')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailProductPopup;
