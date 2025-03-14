import React, {useRef, useState} from "react";
import {useDispatch} from "react-redux";
import InputElement from "../element/InputElement.jsx";
import SpinnerLoading from "../loading/SpinnerLoading.jsx";
import {userRegister} from "../../redux/action/userAction.js";
import {doCreateUserWithEmailAndPassword, doUpdateProfile} from "../../modules/firebase/auth.js";
import {notify} from "../../layouts/Notification/notify.jsx";
import {useTranslation} from "react-i18next";
import {doSignOut} from "../../modules/firebase/auth.js";


const Register = ({isVisible, closePopup, switchPopup}) => {
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const inputRef = useRef({
        name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        gender: "",
        password: "",
        c_password: ""
    });
    const [error, setError] = useState("");

    const [isRegistering, setIsRegistering] = useState(false);

    const handleChangeInput = (e) => {
        const {name, value} = e.target;
        inputRef.current[name] = value; // Lưu giá trị vào ref nhưng không làm rerender
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // check password again
        if (inputRef.current.password !== inputRef.current.c_password) {
            notify("error", t('REGISTER.SAME_PASSWORD'));
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            try {
                // register in firebase
                const userCredential = await doCreateUserWithEmailAndPassword(inputRef.current.email, inputRef.current.password);
                const user = userCredential.user;

                // update name in firebase
                const check = await doUpdateProfile(inputRef.current.name, null);

                // save user in database
                await dispatch(userRegister(inputRef.current, user.uid));

                setIsRegistering(false);
                notify("success", t('REGISTER.REGISTER_SUCCESS'));
                closePopup();
            } catch (error) {
                setIsRegistering(false);
                notify("error", error.message);
                doSignOut();
                // notify("error", t('REGISTER.REGISTER_FAILED'));
            }
        }
    };

    if (!isVisible) return null;

    const inputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary";

    return (
        <div className="overlay fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
             onClick={closePopup}>
            <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-1/2 lg:w-1/3 p-6"
                 onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">{t('REGISTER.REGISTER')}</h2>
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="name"
                               className="block text-sm font-medium text-gray-700">{t('REGISTER.FULL_NAME')}</label>
                        <InputElement
                            type="text"
                            style={inputStyle}
                            onChange={handleChangeInput}
                            placeholder={t('REGISTER.PLACEHOLDER_FULL_NAME')}
                            name="name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email"
                               className="block text-sm font-medium text-gray-700">{t('REGISTER.EMAIL')}</label>
                        <InputElement
                            type="email"
                            style={inputStyle}
                            onChange={handleChangeInput}
                            placeholder={t('REGISTER.PLACEHOLDER_EMAIL')}
                            name="email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone_number"
                               className="block text-sm font-medium text-gray-700">{t('REGISTER.PHONE_NUMBER')}</label>
                        <InputElement
                            type="tel"
                            style={inputStyle}
                            onChange={handleChangeInput}
                            placeholder={t('REGISTER.PLACEHOLDER_PHONE_NUMBER')}
                            name="phone_number"
                            required={true}
                        />
                    </div>
                    {/* Dont need data of birth and gender */}
                    {/*<div>*/}
                    {/*    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>*/}
                    {/*    <InputElement*/}
                    {/*        type="date"*/}
                    {/*        style={inputStyle}*/}
                    {/*        onChange={handleChangeInput}*/}
                    {/*        placeholder="Date of Birth"*/}
                    {/*        name="date_of_birth"*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*</div>*/}
                    {/*<div className="flex items-center mb-4">*/}
                    {/*    <label className="mr-4">Gender:</label>*/}
                    {/*    <InputElement*/}
                    {/*        type="radio"*/}
                    {/*        style="mr-2"*/}
                    {/*        onChange={handleChangeInput}*/}
                    {/*        name="gender"*/}
                    {/*        value="Male"*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*    <label className="mr-4">Male</label>*/}
                    {/*    <InputElement*/}
                    {/*        type="radio"*/}
                    {/*        style="mr-2"*/}
                    {/*        onChange={handleChangeInput}*/}
                    {/*        name="gender"*/}
                    {/*        value="Female"*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*    <label>Female</label>*/}
                    {/*</div>*/}
                    <div>
                        <label htmlFor="password"
                               className="block text-sm font-medium text-gray-700">{t('REGISTER.PASSWORD')}</label>
                        <InputElement
                            type="password"
                            style={inputStyle}
                            onChange={handleChangeInput}
                            placeholder={t('REGISTER.PLACEHOLDER_PASSWORD')}
                            name="password"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="c_password"
                               className="block text-sm font-medium text-gray-700">{t('REGISTER.CONFIRM_PASSWORD')}</label>
                        <InputElement
                            type="password"
                            style={inputStyle}
                            onChange={handleChangeInput}
                            placeholder={t('REGISTER.PLACEHOLDER_CONFIRM_PASSWORD')}
                            name="c_password"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                            {isRegistering ? <SpinnerLoading/> : t('REGISTER.REGISTER')}
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-700">{t('REGISTER.HAVE_ACCOUNT')} </span>
                        <button type="button" onClick={() => switchPopup({popupName: 'login'})}
                                className="text-sm text-blue-500 hover:underline">{t('REGISTER.LOGIN_NOW')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;


