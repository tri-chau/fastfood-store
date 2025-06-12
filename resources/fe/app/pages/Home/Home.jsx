// import React from "react";
// import Banner from "../../components/homepage/Banner";
// import BestProducts from "../../components/homepage/BestProducts";
// import Categories from "../../components/homepage/Categories";
//
// const Home = () => {
//   return (
//     <section>
//       <Banner />
//       <Categories />
//       <BestProducts />
//     </section>
//   );
// };
//
// export default Home;

import React, {useEffect, useState} from "react";
import Banner from "../../components/Home/Banner";
import BestProducts from "../../components/Home/BestProducts";
import About from "../../components/Home/About.jsx";
import { useTranslation } from 'react-i18next';


const Home = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true); // Trigger animation on first render
    }, []);

    const {t} = useTranslation('translation');

    return (
        <section className="bg-[#fccc00] text-[#002a86]">
            {/* 1. Banner */}
            <Banner/>

            {/* 🔹 Section Separator */}
            <div className="my-12">
                <hr className="border-t-2 border-[#9f1000] w-3/4 mx-auto"/>
            </div>

            {/* 🔹 About Section with Title */}
            <div className="flex items-center justify-center my-8">
                {/* Left Zigzag */}
                <svg
                    className="h-10 w-100 md:w-100 text-[#9f1000]"
                    viewBox="0 -2 240 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <polyline
                        points="0,20 20,0 40,20 60,0 80,20 100,0 120,20 140,0 160,20 180,0 200,20 220,0 240,20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                {/* Title */}
                <p className={`mx-4 inline text-3xl font-extrabold text-[#9f1000] bg-[#fccc00] text-center
                    px-8 py-2 rounded transition-transform duration-700
                    ${animate ? "scale-110" : "scale-100"}`}>
                    {t('HOME.ABOUT')}
                </p>

                {/* Right Zigzag */}
                <svg
                    className="h-10 w-100 md:w-100 text-[#9f1000]"
                    viewBox="0 -2 240 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <polyline
                        points="0,20 20,0 40,20 60,0 80,20 100,0 120,20 140,0 160,20 180,0 200,20 220,0 240,20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
            </div>

            <About/>

            {/* 🔹 Section Separator */}
            <div className="my-12">
                <hr className="border-t-2 border-[#9f1000] w-3/4 mx-auto"/>
            </div>

            {/* 🔹 Best Products Section with Title */}
            <div className="flex items-center justify-center">
                <svg
                    className="h-10 w-100 md:w-100 text-[#9f1000]"
                    viewBox="0 -2 240 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <polyline
                        points="0,20 20,0 40,20 60,0 80,20 100,0 120,20 140,0 160,20 180,0 200,20 220,0 240,20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
                
                <p className={`inline text-3xl font-bold text-[#9f1000] bg-[#fccc00] text-center mx-8
                                transition-transform duration-700 ${animate ? "scale-110" : "scale-100"}`}>
                    {t('HOME.BEST_PRODUCTS')}
                </p>
                                    {/*px-5 py-2 border-4 border-[#9f1000] rounded-full*/}

                <svg
                    className="h-10 w-100 md:w-100 text-[#9f1000]"
                    viewBox="0 -2 240 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <polyline
                        points="0,20 20,0 40,20 60,0 80,20 100,0 120,20 140,0 160,20 180,0 200,20 220,0 240,20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
            </div>

            <BestProducts/>
        </section>
    );
};

export default Home;
