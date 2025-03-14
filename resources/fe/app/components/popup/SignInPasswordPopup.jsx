import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {resetStatus} from '../../redux/action/userAction.js';
import SpinnerLoading from '../loading/SpinnerLoading.jsx';
import {doSignInWithEmailAndPassword, doSignInWithGoogle} from "../../modules/firebase/auth.js";
import {notify} from "../../layouts/Notification/notify.jsx";
import {useTranslation} from "react-i18next";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {fetchCart} from "../../redux/action/cartAction.js";

const SignInPasswordPopup = ({isVisible, switchPopup}) => {
    const inputRef = useRef({email: '', password: ''});
    const dispatch = useDispatch();
    const {loading, success, fail, message} = useSelector((state) => state.user);

    const [isSigningIn, setIsSigningIn] = useState(false);

    const {t} = useTranslation();

    const {closePopup} = usePopup();

    const handleChangeInput = (e) => {
        const {name, value} = e.target;
        inputRef.current[name] = value; // Lưu giá trị vào ref nhưng không làm rerender
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                const data = await doSignInWithEmailAndPassword(inputRef.current.email, inputRef.current.password);
                setIsSigningIn(false);
                closePopup();
                await dispatch(fetchCart());
                notify('success', t('LOGIN.LOGIN_SUCCESS'));
            } catch (error) {
                setIsSigningIn(false);
                notify('error', t('LOGIN.LOGIN_FAILED'));
            }
            finally {
                await dispatch(fetchCart());
            }
        }
    };

    const handleLoginWithGoogle = async () => {
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                const data = await doSignInWithGoogle();
                if (data) {
                    switchPopup({popupName: 'addPhone', registerData: data});
                    setIsSigningIn(false);
                } else {
                    setIsSigningIn(false);
                    closePopup();
                    notify('success', t('LOGIN.LOGIN_SUCCESS'));
                }
            } catch (error) {
                setIsSigningIn(false);
                notify('error', t('LOGIN.LOGIN_FAILED'));
            }
            finally {
                await dispatch(fetchCart());
            }
        }
    }

    useEffect(() => {
        if (success) {
            dispatch(resetStatus());
            closePopup();
        } else if (fail) {
            dispatch(resetStatus());
        }
    }, [success, fail]);

    if (!isVisible) return null;

    return (
        <div className="overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closePopup}>
            <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-1/2 lg:w-1/3 p-6"
                 onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">{t('LOGIN.LOGIN')}</h2>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email"
                               className="block text-sm font-medium text-gray-700">{t('LOGIN.EMAIL')}</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            onChange={handleChangeInput}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                            placeholder={t('LOGIN.PLACEHOLDER_EMAIL')}
                        />
                    </div>
                    <div>
                        <label htmlFor="password"
                               className="block text-sm font-medium text-gray-700">{t('LOGIN.PASSWORD')}</label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={handleChangeInput}
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                                placeholder={t('LOGIN.PLACEHOLDER_PASSWORD')}
                            />
                            {/* eye for password */}
                            {/*<span className="absolute inset-y-0 right-4 flex items-center cursor-pointer">*/}
                            {/*    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24"*/}
                            {/*         stroke="currentColor">*/}
                            {/*        <path*/}
                            {/*            d="M12 4.5C16.4183 4.5 20.209 7.493 21.542 12C20.2087 16.507 16.418 19.5 12 19.5C7.58172 19.5 3.791 16.507 2.458 12C3.79132 7.493 7.582 4.5 12 4.5Z"/>*/}
                            {/*        <path*/}
                            {/*            d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z"/>*/}
                            {/*    </svg>*/}
                            {/*</span>*/}
                        </div>
                    </div>
                    <div className="text-right">
                        <a href="#" className="text-sm text-blue-500 hover:underline">{t('LOGIN.FORGOT_PASSWORD')}?</a>
                    </div>
                    <button type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        {loading ? <SpinnerLoading/> : t('LOGIN.LOGIN')}
                    </button>
                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-700">{t('LOGIN.DON_T_HAVE_ACCOUNT')} </span>
                        <a href="#" onClick={() => switchPopup({popupName: 'register'})}
                           className="text-sm text-blue-500 hover:underline">{t('LOGIN.REGISTER_NOW')}</a>
                    </div>
                </form>
                <div className="space-y-4">

                    {/*    Button Google Login */}
                    <div className='flex flex-row text-center w-full'>
                        <div className='border-b-2 mb-2.5 mr-2 w-full'></div>
                        <div className='text-sm font-bold w-fit'>{t('LOGIN.OR')}</div>
                        <div className='border-b-2 mb-2.5 ml-2 w-full'></div>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={(e) => {
                            handleLoginWithGoogle(e)
                        }}
                        className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium  ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100'}`}>
                        <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path
                                    d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                                    fill="#4285F4"/>
                                <path
                                    d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                                    fill="#34A853"/>
                                <path
                                    d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                                    fill="#FBBC04"/>
                                <path
                                    d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                                    fill="#EA4335"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        {isSigningIn ? t('LOGIN.LOGINING') : t('LOGIN.LOGIN_WITH_GOOGLE')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInPasswordPopup;
