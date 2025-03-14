import {useState, useEffect, useRef} from "react";
import {MdArrowDropDown, MdLanguage, MdLogout, MdOutlinePerson} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {doSignOut} from "../../modules/firebase/auth.js";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import {useTranslation} from "react-i18next";
import {notify} from "../Notification/notify.jsx";

const UserSetting = ({isVisible}) => {
    const navigate = useNavigate();
    const popupRef = useRef(null);
    const {closePopup} = usePopup();
    const {t, i18n} = useTranslation();

    const handleLogout = async () => {
        await doSignOut();
        closePopup();
        navigate("/");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                closePopup();
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible, closePopup]);

    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        closePopup();
    }

    if (!isVisible) return null;

    const [open, setOpen] = useState(false);


    return (
        <div ref={popupRef}
             className="absolute top-17 bg-white drop-shadow-lg rounded-lg px-2 py-3 z-50 transition-all transform scale-95 animate-fadeIn">
            <div className="w-38 flex flex-col gap-2">
                <button
                    // onClick={() => openPopup({popupName: 'profile'})}
                    onClick={() => notify("info", t('NOTIFICATION.NOT_AVAILABLE'))}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-stone-300 transition duration-200 shadow-2">
                    <MdOutlinePerson className="text-xl text-gray-700"/>
                    <span className="text-gray-800">{t('HEADER.PROFILE')}</span>
                </button>
                <div className="relative inline-block">
                    {/* Button */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-stone-300 transition duration-200 shadow-md bg-white">
                        <MdLanguage className="text-xl"/>
                        <span>{t('HEADER.LANGUAGE')}</span>
                        <MdArrowDropDown className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}/>
                    </button>

                    {/* Dropdown Options */}
                    {open && (
                        <div
                            className="absolute left-0 mt-1.5 w-full bg-white rounded-lg shadow-md">
                            <button className="px-4 py-2 text-left hover:bg-stone-300 cursor-pointer w-full"
                                    onClick={() => handleChangeLanguage('vi')}>
                                Tiếng Việt
                            </button>
                            <button className="px-4 py-2 text-left hover:bg-stone-300 cursor-pointer w-full"
                                    onClick={() => handleChangeLanguage('en')}>
                                English
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f26d78] text-white hover:bg-[#d85563] transition duration-200">
                    <MdLogout className="text-xl"/>
                    <span>{t('HEADER.LOGOUT')}</span>
                </button>
            </div>
        </div>
    );
};

export default UserSetting;
