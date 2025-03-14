import React, {useEffect, useRef, useState} from "react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

const Banner = () => {
    const images = import.meta.glob('/resources/fe/app/assets/Banner/*.{png,jpg,jpeg,svg}', {eager: true});
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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToTop();
    }, []);

    // style={{ backgroundImage: "url('/build/assets/Banner.svg')" }}
    return (
        <section
            className="relative h-[480px] w-[1200px] flex items-center justify-center bg-cover bg-center mx-auto mt-8 rounded-2xl">
            {/* Left Arrow Button */}
            <button
                onClick={() => {
                    currentImageIndexRef.current = (currentImageIndexRef.current - 1 + imageList.length) % imageList.length;
                    if (imageRef.current) {
                        imageRef.current.src = imageList[currentImageIndexRef.current];
                    }
                }}
                className="absolute left-8 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">
                <FaArrowLeft/>
            </button>

            {/* Image */}
            <img
                ref={imageRef}
                src={imageList[0] || "@/assets/imageList/empty-image.jpg"}
                alt="Product Image"
                className="w-[1200px] h-[480px] object-cover rounded-lg"
            />

            {/* Right Arrow Button */}
            <button
                onClick={() => {
                    currentImageIndexRef.current = (currentImageIndexRef.current + 1) % imageList.length;
                    if (imageRef.current) {
                        imageRef.current.src = imageList[currentImageIndexRef.current];
                    }
                }}
                className="absolute right-8 inset-y-1/2 transform -translate-y-1/2 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300">
                <FaArrowRight/>
            </button>
        </section>
    );
};

export default Banner;

