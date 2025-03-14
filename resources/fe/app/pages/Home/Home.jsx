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
        <section className="bg-gray-100">
            {/* 1. Banner */}
            <Banner/>

            {/* 🔹 Section Separator */}
            <div className="my-12">
                <hr className="border-t-2 border-gray-300 w-3/4 mx-auto"/>
            </div>

            {/* 🔹 About Section with Title */}
            <div className="text-center">
                <p className={`inline text-3xl font-bold text-white bg-[#f26d78] text-center
                                px-5 py-2 border-4 border-[#f26d78] rounded-full
                                transition-transform duration-700 ${animate ? "scale-110" : "scale-100"}`}>
                    {t('HOME.ABOUT')}
                </p>
            </div>

            <About/>

            {/* 🔹 Section Separator */}
            <div className="my-12">
                <hr className="border-t-2 border-gray-300 w-3/4 mx-auto"/>
            </div>

            {/* 🔹 Best Products Section with Title */}
            <div className="text-center">
                <p className={`inline text-3xl font-bold text-white bg-[#f26d78] text-center
                                px-5 py-2 border-4 border-[#f26d78] rounded-full
                                transition-transform duration-700 ${animate ? "scale-110" : "scale-100"}`}>
                    {t('HOME.BEST_PRODUCTS')}
                </p>
            </div>

            <BestProducts/>
        </section>
    );
};

export default Home;

