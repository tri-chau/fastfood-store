import {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {userRegister} from '../../redux/action/userAction.js';
import SpinnerLoading from '../loading/SpinnerLoading.jsx';
import {notify} from "../../layouts/Notification/notify.jsx";
import {doSignOut} from "../../modules/firebase/auth.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {useTranslation} from "react-i18next";

const AddPhoneNumberPopup = ({isVisible, registerData}) => {
    const inputRef = useRef({phone: '',});
    const dispatch = useDispatch();
    const {loading, success, fail, message} = useSelector((state) => state.user);

    const handleChangeInput = (e) => {
        const {name, value} = e.target;
        inputRef.current[name] = value; // Lưu giá trị vào ref nhưng không làm rerender
    };

    const {closePopup} = usePopup();

    const {t} = useTranslation();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // prepare data
            const input = {
                name: registerData.displayName,
                email: registerData.email,
                phone_number: inputRef.current.phone,
                password: '', // password is empty because user login with google
                c_password: '',
                auth_type: registerData.auth_type,
            }

            // save user in database
            await dispatch(userRegister(input, registerData.firebase_uid)).then(() => {
                closePopup();
                notify('success', 'Login successfully');
            }).catch(async (error) => {
                await doSignOut();
                notify('error', error.message); // Show error message from API
            });

        } catch (error) {
            notify('error', 'Login failed');
        }

    };

    if (!isVisible) return null;

    return (
        <div className="overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
             onClick={() => {
                 closePopup();
                 doSignOut();
             }}>
            <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-1/2 lg:w-1/3 p-6"
                 onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">{t('REGISTER.ADD_PHONE.TITLE')}</h2>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('REGISTER.ADD_PHONE.PHONE')}</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            onChange={handleChangeInput}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                            placeholder={t('REGISTER.ADD_PHONE.PLACEHOLDER_PHONE')}
                            required={true}
                        />
                    </div>
                    <button type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        {loading ? <SpinnerLoading/> : t('REGISTER.ADD_PHONE.ADD')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPhoneNumberPopup;
