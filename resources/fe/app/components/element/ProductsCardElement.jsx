/* eslint-disable react/style-prop-object */
import {toast} from "react-toastify";
import {BsEye} from "react-icons/bs";
import React, {useCallback, useEffect, useState} from "react";
import ButtonElement from "./ButtonElement.jsx";
import {MdFavorite} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import ReviewScoreElement from "./ReviewScoreElement.jsx";
import {useDispatch, useSelector} from "react-redux";
import {addToCart, resetStatus} from "../../redux/action/cartAction.js";
import {formatVietnameseCurrency} from "../../locales/currencyFormat.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";

const ProductsCardElement = ({listProduct}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {cart, loading, success, fail} = useSelector((state) => state.cart);

    const {openPopup} = usePopup();

    const handleCart = (e) => {
        const id = e.target.value;
        dispatch(addToCart(id, 1));
    };

    const handleOpenDetailProduct = useCallback((product_id) => {
        return () => {
            openPopup({popupName: 'details', productId: product_id});
        };
    }, [openPopup]);

    const buttonStyle =
        "btn w-full h-[50px]  text-white text-xs md:text-[16px] bg-secondary absolute cursor-pointer group-hover:bottom-0 -bottom-14 ";

    return (
        listProduct?.map(category => (
            <div key={category.category_id}>
                <div
                    >
                    {category.product_list.map(product => (
                        <div key={product.product_id} className="p-4 cursor-pointer">
                            <div
                                className="bg-gray-200/50 rounded-md relative mb-4 max-h-[250px] group overflow-hidden">
                                <img
                                    src={product.product_image || "/build/assets/Product/empty-image.png"}
                                    alt="Product"
                                    className="w-full shadow-lg rounded-lg aspect-square "/>
                                <ButtonElement
                                    value={product.product_id}
                                    action={handleOpenDetailProduct(product.product_id)}
                                    style={buttonStyle}
                                    title="Add to Cart"
                                />
                            </div>

                            <div className="product_content flex flex-row justify-between mt-4 ">
                                <div className="product_label">
                                    <h3 className="font-bold text-black truncate w-52">{product.product_name}</h3>
                                    <p className="text-gray-600 text-xs lg:text-sm">{formatVietnameseCurrency(product.product_price)}</p>
                                </div>
                                <div className="flex justify-center items-center mb-3 lg:mb-0">
                                    <button onClick={handleOpenDetailProduct(product.product_id)}
                                            className="add_btn flex justify-center items-center p-1 bg-[#f26d78] hover:bg-[#C15760]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24" strokeWidth="1.5" stroke="white"
                                             className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M12 4.5v15m7.5-7.5h-15"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))
    );
};
export default ProductsCardElement;
