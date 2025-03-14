import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import ProductsCardElement from "../../../components/element/ProductsCardElement.jsx";
import ProductsCardLoading from "../../../components/loading/ProductsCardLoading.jsx";
import ProductNotFound from "../../../components/product_search/ProductNotFound.jsx";
import axios from "axios";
import {mapProducts} from "../../../components/product_details/mapProduct.jsx";

const Product = () => {
    const {categories} = useParams();
    const dispatch = useDispatch();
    const {categoryProducts, loading} = useSelector(
        (state) => state.categoryProducts
    );
    const [products, setProduct] = useState([]);


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`/api/customer/products/${categories}`);

                const products_fetched = mapProducts(response.data.data);

                setProduct(products_fetched);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        fetchProducts();
    }, []);

    return (
        <section>
            <div className="container mx-auto">
                {/* 1. navigation path info */}
                <div className="py-6 lg:py-10 px-4 text-sm ">
                    <div>Home / product / category / {categories}</div>
                </div>
                <div className="flex flex-wrap">
                    {/* 2. Product display area */}
                    <div className="flex w-full px-2 md:px-0">
                        {loading ? (
                            <ProductsCardLoading/>
                        ) : products.length === 0 ? (
                            <ProductNotFound/>
                        ) : (
                            <ProductsCardElement products={products}/>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Product;
