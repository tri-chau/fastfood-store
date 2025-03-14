import React, { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const CategoriesCardElement = forwardRef((props, sliderRef) => {
  const [categoriesCard, setCategoriesCard] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories/options/all");
            const categories = response.data.data.map(category => ({
          name: category.name,
            description: category.description,
          image_path: category.image_path,
        }));
        setCategoriesCard(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          initialSlide: 4,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
    ],
  };

  return (
    <Slider ref={sliderRef} {...settings}>
      {categoriesCard.map((item, index) => (
        <div className="px-2" key={index}>
          <Link to={`/customer/products/${item.name}`}>
            <div className="bg-white border-[3px] h-full border-tertiary rounded-md w-full">
              <div className="flex items-center justify-center">

                <img
                  className="h-[120px] md:h-[125px] bg-contain"
                    src={`/build/assets/category_image/${item.name}.jpg`}
                  alt={item.name}
                />
              </div>
              <div className="py-2 text-center text-[9px] md:text-sm uppercase">
                {item.description}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </Slider>
  );
});

export default CategoriesCardElement;
