import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import ButtonElement from "../element/ButtonElement.jsx";
import {getAllProducts} from "../../redux/action/productAction";
import ProductsCardLoading from "../loading/ProductsCardLoading";
import {animateScroll as scroll} from 'react-scroll';
import {formatVietnameseCurrency} from "../../locales/currencyFormat.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

const BestProducts = () => {
    const dispatch = useDispatch();
    const [limit, setLimit] = useState(4);
    const {products, loading, hasMore} = useSelector(state => state.products);
    const {openPopup} = usePopup();

    useEffect(() => {
        dispatch(getAllProducts(limit));
    }, [dispatch, limit]);

    const loadMoreProducts = () => {
        setLimit(prevLimit => prevLimit + 4);
        scroll.scrollMore(350, {duration: 300, smooth: "easeInOutQuint"});
    };

    const handleOpenDetailProduct = useCallback((product_id) => () => {
        openPopup({popupName: 'details', productId: product_id});
    }, [openPopup]);

    const images = import.meta.glob('/resources/fe/app/assets/BestProductBanner/*.{png,jpg,jpeg,svg}', {eager: true});
    const currentImageIndexRef = useRef(0); // Dùng useRef thay vì useState
    const imageRef = useRef(null); // Tham chiếu đến thẻ <img>
    const [imageList, setImageList] = useState(Object.values(images).map(img => img.default));

    // auto change imageList
    useEffect(() => {
        if (imageList.length > 0) {
            const interval = setInterval(() => {
                currentImageIndexRef.current = (currentImageIndexRef.current + 1) % imageList.length;
                if (imageRef.current) {
                    imageRef.current.src = imageList[currentImageIndexRef.current]; // Cập nhật ảnh trực tiếp
                }
            }, 3000); // 3s đổi ảnh một lần

            return () => clearInterval(interval);
        }
    }, [imageList]);

    return (
        <section className="max-w-7xl mx-auto mt-5 rounded-2xl bg-cover bg-center mb-10">
            {/* 🔹 Beautiful Section Title */}
            <div className="container mx-auto px-4">
                {products?.length === 0 ? <ProductsCardLoading/> : (
                    <div
                        className="bg-white shadow-lg flex flex-col lg:flex-row lg:w-[1200px] p-6 relative mx-auto mt-5 rounded-2xl">
                        {/* Image and Title Section */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    currentImageIndexRef.current = (currentImageIndexRef.current - 1 + imageList.length) % imageList.length;
                                    if (imageRef.current) {
                                        imageRef.current.src = imageList[currentImageIndexRef.current];
                                    }
                                }}
                                className="absolute left-1 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">
                                <FaArrowLeft/>
                            </button>

                            {/* Image */}
                            <img
                                ref={imageRef}
                                src={imageList[0] || "@/assets/imageList/empty-image.jpg"}
                                alt="Product Image"
                                className="w-[700px] h-[480px] object-cover rounded-lg mt-5"
                            />

                            {/* Right Arrow Button */}
                            <button
                                onClick={() => {
                                    currentImageIndexRef.current = (currentImageIndexRef.current + 1) % imageList.length;
                                    if (imageRef.current) {
                                        imageRef.current.src = imageList[currentImageIndexRef.current];
                                    }
                                }}
                                className="absolute right-1 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">
                                <FaArrowRight/>
                            </button>
                        </div>

                        {/* Product Grid */}
                        <div className="w-full lg:w-[500px] grid grid-cols-2 gap-4 p-4 ml-4">
                            {products?.map(category => (
                                category.product_list.map(product => (
                                    <div key={product.product_id} className=" cursor-pointer">
                                        <div
                                            className="bg-gray-200/50 rounded-md relative mb-4 h-[200px] group overflow-hidden">
                                            <img
                                                src={product.product_image || "/build/assets/Product/empty-image.png"}
                                                alt={product.product_name}
                                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                            />
                                            <ButtonElement
                                                value={product.product_id}
                                                action={handleOpenDetailProduct(product.product_id)}
                                                style="btn absolute bottom-0 w-full h-[50px] bg-[#f26d78] text-white text-xs md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                title="Add to Cart"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div>
                                                <h3 className="font-bold text-black truncate w-40">{product.product_name}</h3>
                                                <p className="text-gray-600 text-xs lg:text-sm">{formatVietnameseCurrency(product.product_price)}</p>
                                            </div>
                                            <button
                                                onClick={handleOpenDetailProduct(product.product_id)}
                                                className="p-2 bg-[#f26d78] hover:bg-[#C15760] text-white rounded-full transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M12 4.5v15m7.5-7.5h-15"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>
                )}
                {/*{hasMore && (*/}
                {/*    <div className="flex justify-center items-center mt-6">*/}
                {/*        <ButtonElement*/}
                {/*            style="btn bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-80 transition-all duration-300"*/}
                {/*            loading={loading}*/}
                {/*            action={loadMoreProducts}*/}
                {/*            title="More Products"*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </section>
    );
};

export default BestProducts;
