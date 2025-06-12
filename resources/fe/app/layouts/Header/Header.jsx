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
import ChatPopup from "../../components/popup/ChatPopup.jsx";

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

    const firebaseId = auth?.currentUser?.uid; //firebase id

    const handleNavMenu = () => {
        setOpenMenu(!openMenu);
    };

    const handleAdminNavigation = (route) => {
        navigate(route);
    };

    const handleCartClick = useCallback((e) => {
        if (!userLoggedIn)
            openPopup({popupName: 'login'});
        else
            openPopup({popupName: 'cartDrawer'});
    }, [openPopup]);

    const handleSupportClick = useCallback(
        (e) => {
            console.log("handleSupportClick called, userLoggedIn:", userLoggedIn, "isPremiumUser:", isPremiumUser, "currentPopup:", currentPopup);
            if (userLoggedIn && isPremiumUser) {
                navigate("/admin/conversations");
            } else if (!userLoggedIn) {
                console.log("Opening login popup");
                openPopup({ popupName: "login" });
            } else {
                console.log("Opening chat popup, firebaseId:", firebaseId);
                openPopup({ popupName: "chat" });
            }
        },
        [openPopup, userLoggedIn, isPremiumUser, navigate, firebaseId]
    );

    useEffect(() => {
        if (userLoggedIn && !isPremiumUser) {
            dispatch(fetchCart());
        }
    }, [dispatch]);

    // return (
    //     <header className="bg-white fixed top-0 w-full z-10 px-2 border-b">
    //         <div className="container mx-auto">
    //             <div className="flex items-center justify-between py-4 max-h-[70px] w-full">
    //                 {/* Left: Logo */}
    //                 <div
    //                     className="lg:flex hidden items-center text-xl font-semibold tracking-wider space-x-2 whitespace-nowrap"
    //                     onClick={() => navigate("/")}>
    //                     <Link to="/" className="flex items-center space-x-2">
    //                         <img
    //                             src="/storage/build/assets/Logo.jpg"
    //                             alt="logo"
    //                             className="h-auto max-h-12 w-auto"
    //                         />
    //                         <span>Los Pollos Hermanos</span>
    //                     </Link>
    //                 </div>
    //
    //                 {/* Center: Search box */}
    //                 <div className="flex-1 flex justify-center px-2">
    //                     <div className="w-full max-w-md">
    //                         <SearchInputElement />
    //                     </div>
    //                 </div>
    //
    //                 {/* Right: Hỗ trợ KH + Menu */}
    //                 <div className="flex items-center space-x-4 min-w-max">
    //                     <button
    //                         className="btn btn-outline-primary whitespace-nowrap"
    //                         onClick={handleSupportClick}
    //                     >
    //                         Hỗ trợ khách hàng
    //                     </button>
    //
    //                     <NavMenuElement
    //                         handleNavMenu={handleNavMenu}
    //                         openMenu={openMenu}
    //                         userLoggedIn={userLoggedIn}
    //                         switchPopup={switchPopup}
    //                     />
    //
    //                     {/* Buttons (Cart, Profile, Menu) */}
    //                     <div className="flex flex-row justify-center items-center space-x-3 min-w-max">
    //                         {/* Cart button */}
    //                         {!isPremiumUser &&
    //                             <button className="relative" onClick={handleCartClick}>
    //                                 <BsCart3 className="text-lg lg:text-xl"/>
    //                                 {cartQuantity > 0 && (
    //                                     <span
    //                                         className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#f26d78] rounded-full">
    //                                     {cartQuantity}
    //                                 </span>
    //                                 )}
    //                             </button>}
    //
    //                         {/* Profile button */}
    //                         {userLoggedIn && (
    //                             <div className="relative flex items-center">
    //                                 <button onClick={() => openPopup({popupName: 'logout'})} className="px-2 text-lg">
    //                                     <MdSettings/>
    //                                 </button>
    //                             </div>
    //                         )}
    //
    //                         {/* Select Profile button popup */}
    //                         {currentPopup?.popupName === 'logout' && (
    //                             <UserSetting isVisible={currentPopup?.popupName === 'logout'}/>
    //                         )}
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //
    //         {/* ALL pop up*/}
    //
    //         {/* login pop up */}
    //         {currentPopup?.popupName === 'login' &&
    //             <SignInPasswordPopup isVisible={currentPopup?.popupName === 'login'}
    //                                  closePopup={closePopup} switchPopup={switchPopup}/>}
    //
    //         {/* register popup */}
    //         {currentPopup?.popupName === 'register' &&
    //             <RegisterPopup isVisible={currentPopup?.popupName === 'register'}
    //                            closePopup={closePopup} switchPopup={switchPopup}/>
    //         }
    //
    //         {/* Add phone number when user login by Google first time */}
    //         {currentPopup?.popupName === 'addPhone' &&
    //             <AddPhoneNumberPopup isVisible={currentPopup?.popupName === 'addPhone'}
    //                                  registerData={currentPopup.registerData}/>}
    //         {/* Select available cart when user add product to cart */}
    //         {currentPopup?.popupName === 'cartSelection' &&
    //             <CartSelectionPopup isVisible={currentPopup?.popupName === 'cartSelection'}
    //                                 cartData={currentPopup?.cartData}
    //                                 product={currentPopup?.product}
    //                                 resetState={currentPopup?.resetState}/>}
    //         {/* cart drawer */}
    //         {currentPopup?.popupName === 'cartDrawer' &&
    //             <CartDrawerPopup isVisible={currentPopup?.popupName === 'cartDrawer'}/>}
    //
    //         {/* Add Detail product popup opened from Menu */}
    //         {currentPopup?.popupName === 'details' &&
    //             <DetailProductPopup isVisible={currentPopup?.popupName === 'details'} isEdit={false}/>}
    //
    //         {/* Update Detail product pop up opened from CartDrawer */}
    //         {currentPopup?.popupName === 'details' && currentPopup?.productDetailInCart && (
    //             <DetailProductPopup
    //                 isVisible={currentPopup?.popupName === 'details'}
    //                 isEdit={true}
    //                 productDetailInCart={currentPopup?.productDetailInCart}
    //             />
    //         )}
    //         {/* QR payment popup */}
    //         {currentPopup?.popupName === 'qrPayment' && currentPopup?.paymentLink &&
    //             <QRPaymentPopup isVisible={currentPopup?.popupName === 'qrPayment'}
    //                             paymentLink={currentPopup?.paymentLink} cart={currentPopup?.order}/>}
    //
    //         {currentPopup?.popupName === "chat" && (
    //             <ChatPopup
    //                 isVisible={currentPopup?.popupName === "chat"}
    //                 closePopup={closePopup}
    //                 firebaseId={firebaseId}
    //             />
    //         )}
    //
    //     </header>
    // );

    return (
        <header className="bg-white fixed top-0 w-full z-10 px-2 border-b">
            <div className="container mx-auto">
                <div className="flex items-center justify-between py-4 max-h-[70px] w-full">
                    {/* Left: Logo */}
                    <div
                        className="lg:flex hidden items-center text-xl font-semibold tracking-wider space-x-2 whitespace-nowrap"
                        onClick={() => navigate("/")}>
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src="/storage/build/assets/Logo.jpg"
                                alt="logo"
                                className="h-auto max-h-12 w-auto"
                            />
                            <span>Los Pollos</span>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between w-full px-4">
                        {/* Left: Buttons */}
                        <div className="flex items-center space-x-4">
                            {userLoggedIn && isPremiumUser && (
                                <>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleAdminNavigation("/admin/products")}
                                    >
                                        Sản phẩm
                                    </button>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleAdminNavigation("/admin/categories")}
                                    >
                                        Danh mục
                                    </button>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleAdminNavigation("/admin/orders")}
                                    >
                                        Hóa đơn
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Center: Search Box */}
                        <div className="flex justify-center flex-1">
                            <div className="max-w-md w-full">
                                <SearchInputElement />
                            </div>
                        </div>

                        {/* Right: Empty (hoặc user icon, profile, v.v.) */}
                        <div className="w-[150px]"></div> {/* để giữ cân bằng layout nếu cần */}
                    </div>


                    {/* Right: Menu (hidden for admin) */}
                    <button
                        className="btn btn-outline-primary whitespace-nowrap"
                        onClick={handleSupportClick}
                    >
                        Hỗ trợ khách hàng
                    </button>
                    {!userLoggedIn || (userLoggedIn && !isPremiumUser) ? (
                        <div className="flex items-center space-x-4 min-w-max">
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
                                        <button onClick={() => openPopup({ popupName: 'logout' })} className="px-2 text-lg">
                                            <MdSettings />
                                        </button>
                                    </div>
                                )}

                                {/* Select Profile button popup */}
                                {currentPopup?.popupName === 'logout' && (
                                    <UserSetting isVisible={currentPopup?.popupName === 'logout'} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4 min-w-max">
                            {/* Buttons (Cart, Profile, Menu) for admin */}
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
                                        <button onClick={() => openPopup({ popupName: 'logout' })} className="px-2 text-lg">
                                            <MdSettings />
                                        </button>
                                    </div>
                                )}

                                {/* Select Profile button popup */}
                                {currentPopup?.popupName === 'logout' && (
                                    <UserSetting isVisible={currentPopup?.popupName === 'logout'} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ALL pop up */}
            {/* login pop up */}
            {currentPopup?.popupName === 'login' &&
                <SignInPasswordPopup isVisible={currentPopup?.popupName === 'login'}
                                     closePopup={closePopup} switchPopup={switchPopup} />}

            {/* register popup */}
            {currentPopup?.popupName === 'register' &&
                <RegisterPopup isVisible={currentPopup?.popupName === 'register'}
                               closePopup={closePopup} switchPopup={switchPopup} />
            }

            {/* Add phone number when user login by Google first time */}
            {currentPopup?.popupName === 'addPhone' &&
                <AddPhoneNumberPopup isVisible={currentPopup?.popupName === 'addPhone'}
                                     registerData={currentPopup.registerData} />}

            {/* Select available cart when user add product to cart */}
            {currentPopup?.popupName === 'cartSelection' &&
                <CartSelectionPopup isVisible={currentPopup?.popupName === 'cartSelection'}
                                    cartData={currentPopup?.cartData}
                                    product={currentPopup?.product}
                                    resetState={currentPopup?.resetState} />}

            {/* cart drawer */}
            {currentPopup?.popupName === 'cartDrawer' &&
                <CartDrawerPopup isVisible={currentPopup?.popupName === 'cartDrawer'} />}

            {/* Add Detail product popup opened from Menu */}
            {currentPopup?.popupName === 'details' &&
                <DetailProductPopup isVisible={currentPopup?.popupName === 'details'} isEdit={false} />}

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
                                paymentLink={currentPopup?.paymentLink} cart={currentPopup?.order} />}

            {currentPopup?.popupName === "chat" && (
                <ChatPopup
                    isVisible={currentPopup?.popupName === "chat"}
                    closePopup={closePopup}
                    firebaseId={firebaseId}
                />
            )}
        </header>
    );
};

export default Header;
