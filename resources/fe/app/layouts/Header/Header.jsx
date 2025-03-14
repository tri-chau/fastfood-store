import {BsCart3} from "react-icons/bs";
import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import NavMenuElement from "./NavMenuElement.jsx";
import SearchInputElement from "./SearchInputElement.jsx";
import UserSetting from "./UserSetting.jsx";
import SignInPasswordPopup from "../../components/popup/SignInPasswordPopup.jsx";
import CartDrawerPopup from "../../components/popup/CartDrawerPopup.jsx";
import DetailProductPopup from "../../components/popup/DetailProductPopup.jsx";
import {useAuth} from "../../hooks/contexts/authContext/index.jsx";
import AddPhoneNumberPopup from "../../components/popup/AddPhoneNumberPopup.jsx";
import RegisterPopup from "../../components/popup/RegisterPopup.jsx";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import CartSelectionPopup from "../../components/popup/CartSelectionPopup.jsx";
import QRPaymentPopup from "../../components/popup/QRPaymentPopup.jsx";
import {MdSettings} from "react-icons/md";
import {fetchCart} from "../../redux/action/cartAction.js";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);

    const {currentPopup, openPopup, closePopup, switchPopup} = usePopup();

    // wait data from switch popup detailProduct
    const selectedProduct = useSelector(state => state.product.product);

    const {quantity: cartQuantity} = useSelector(state => state.cart);

    const auth = useAuth();
    // return user logged in or not
    const {userLoggedIn, isPremiumUser} = auth || {};

    const handleNavMenu = () => {
        setOpenMenu(!openMenu);
    };

    const handleCartClick = useCallback((e) => {
        if (!userLoggedIn)
            openPopup({popupName: 'login'});
        else
            openPopup({popupName: 'cartDrawer'});
    }, [openPopup]);

    useEffect(() => {
        if (userLoggedIn && !isPremiumUser) {
            dispatch(fetchCart());
        }
    }, [dispatch]);

    return (
        <header className="bg-white fixed top-0 w-full z-10 px-2 border-b">
            <div className="container mx-auto">
                <div className="flex flex-row items-center justify-between space-x-2 py-4 max-h-[70px]">
                    {/* Logo */}
                    <div
                        className="lg:flex hidden items-center text-xl font-semibold tracking-wider space-x-2 whitespace-nowrap"
                        onClick={() => navigate("/")}>
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src="/storage_fail/build/assets/logo.png"
                                alt="logo"
                                className="h-auto max-h-12 w-auto"
                            />
                            <span>BEPMETAY</span>
                        </Link>
                    </div>

                    {/* Search bar */}
                    <SearchInputElement/>

                    {/* Navigation */}
                    <div className="inline-flex justify-center items-center space-x-4 px-2 w-auto min-w-max">
                        <NavMenuElement
                            handleNavMenu={handleNavMenu}
                            openMenu={openMenu}
                            userLoggedIn={userLoggedIn}
                            switchPopup={switchPopup}
                        />

                        {/* Buttons (Cart, Profile, Menu) */}
                        <div className="flex flex-row justify-center items-center space-x-3 min-w-max">
                            {/* Cart button */}
                            {!isPremiumUser &&
                                <button className="relative" onClick={handleCartClick}>
                                    <BsCart3 className="text-lg lg:text-xl"/>
                                    {cartQuantity > 0 && (
                                        <span
                                            className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#f26d78] rounded-full">
                                                {cartQuantity}
                                        </span>
                                    )}
                                </button>}

                            {/* Profile button */}
                            {userLoggedIn && (
                                <div className="relative flex items-center">
                                    <button onClick={() => openPopup({popupName: 'logout'})} className="px-2 text-lg">
                                        <MdSettings/>
                                    </button>
                                </div>
                            )}

                            {/* Select Profile button popup */}
                            {currentPopup?.popupName === 'logout' && (
                                <UserSetting isVisible={currentPopup?.popupName === 'logout'}/>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ALL pop up*/}

            {/* login pop up */}
            {currentPopup?.popupName === 'login' &&
                <SignInPasswordPopup isVisible={currentPopup?.popupName === 'login'}
                                     closePopup={closePopup} switchPopup={switchPopup}/>}

            {/* register popup */}
            {currentPopup?.popupName === 'register' &&
                <RegisterPopup isVisible={currentPopup?.popupName === 'register'}
                               closePopup={closePopup} switchPopup={switchPopup}/>
            }

            {/* Add phone number when user login by Google first time */}
            {currentPopup?.popupName === 'addPhone' &&
                <AddPhoneNumberPopup isVisible={currentPopup?.popupName === 'addPhone'}
                                     registerData={currentPopup.registerData}/>}

            {/* Select available cart when user add product to cart */}
            {currentPopup?.popupName === 'cartSelection' &&
                <CartSelectionPopup isVisible={currentPopup?.popupName === 'cartSelection'}
                                    cartData={currentPopup?.cartData}
                                    product={currentPopup?.product}
                                    resetState={currentPopup?.resetState}/>}

            {/* cart drawer */}
            {currentPopup?.popupName === 'cartDrawer' &&
                <CartDrawerPopup isVisible={currentPopup?.popupName === 'cartDrawer'}/>}

            {/* Add Detail product popup opened from Menu */}
            {currentPopup?.popupName === 'details' &&
                <DetailProductPopup isVisible={currentPopup?.popupName === 'details'} isEdit={false}/>}

            {/* Update Detail product pop up opened from CartDrawer */}
            {currentPopup?.popupName === 'details' && currentPopup?.productDetailInCart && (
                <DetailProductPopup
                    isVisible={currentPopup?.popupName === 'details'}
                    isEdit={true}
                    productDetailInCart={currentPopup?.productDetailInCart}
                />
            )}

            {/* QR payment popup */}
            {currentPopup?.popupName === 'qrPayment' && currentPopup?.paymentLink &&
                <QRPaymentPopup isVisible={currentPopup?.popupName === 'qrPayment'}
                                paymentLink={currentPopup?.paymentLink} cart={currentPopup?.order}/>}

        </header>
    );
};

export default Header;
