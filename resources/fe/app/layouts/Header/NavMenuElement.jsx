import React, {useCallback} from "react";
import {MdOutlineClose} from "react-icons/md";
import {Link, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../hooks/contexts/authContext/index.jsx";

const NavMenuElement = ({handleNavMenu, openMenu, userLoggedIn, switchPopup}) => {
    const location = useLocation();

    const {t} = useTranslation();

    const navMenuBtn = (menuPath) => `${
        location.pathname === menuPath ? "text-tertiary" : ""
    } md:px-2 lg:px-4  hover:text-tertiary transition-all duration-150`;

    // ngan auto bat
    const handleLoginClick = useCallback((e) => {
        e.preventDefault();
        switchPopup({popupName: "login"});
    });

    const auth = useAuth();
    // return user logged in or not
    const {isPremiumUser} = auth || {};

    const navMenuName = [
        {name: t('HEADER.HOME'), path: "/", visible: true},
        {name: t('HEADER.MENU'), path: "/menu", visible: true},
        {name: t('HEADER.LOGIN'), visible: !userLoggedIn && !isPremiumUser, onClick: handleLoginClick}, // Show Signin only if user array is empty
        {name: t('HEADER.ORDER'), path: "/orders", visible: userLoggedIn && !isPremiumUser},
    ];

    const handleMobileNavMenu = () => {
        if (window.innerWidth < 768) {
            handleNavMenu();
        }
    };

    return (
        <div
            className={`${openMenu ? "right-0" : "-right-full"} w-full md:w-auto h-full md:h-auto fixed md:static top-0 md:top-auto bg-[#fccc00] z-20 transition-all duration-300`}>

            <div className="block md:hidden text-black py-6 text-end px-8">
                <button onClick={handleMobileNavMenu}>
                    <MdOutlineClose className="text-4xl"/>
                </button>
            </div>

            <nav
                className="flex flex-row justify-center items-center text-2xl md:text-sm text-[#002a86] font-bold">
                {navMenuName.map((menu, index) => {
                    if (!menu.visible) return null;
                    return (
                        <Link
                            className={navMenuBtn(menu.path) + "text-[#002a86] hover:text-[#9f1000] transition-all duration-300"}
                            to={menu.path}
                            key={index}
                            onClick={menu.onClick || handleMobileNavMenu}>
                            {menu.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default NavMenuElement;
