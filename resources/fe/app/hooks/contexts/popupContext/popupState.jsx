import {useState, createContext, useContext} from "react";
import {getSingleProduct} from "../../../redux/action/productAction.js";
import {useDispatch} from "react-redux";
import Cookies from "js-cookie";

const PopupContext = createContext();

export const PopupProvider = ({children}) => {
    const [currentPopup, setCurrentPopup] = useState(null);
    const [popupData, setPopupData] = useState(null);
    const dispatch = useDispatch();

    const openPopup = (inputData) => {
        const popupData = {popupName: inputData.popupName};

        Object.entries(inputData).forEach(([key, value]) => {
            popupData[key] = value;
        });

        if (inputData.popupName === 'details' && inputData.productId) {
            dispatch(getSingleProduct(inputData.productId)).then(() => {
                setCurrentPopup(popupData);
            });
        } else
            setCurrentPopup(popupData);
    };

    const closePopup = () => {
        setCurrentPopup(null);
    };

    const switchPopup = async (inputData) => {
        // switch popup tu header khong co san data nen phai goi openPopup
        if (inputData.popupName === 'details' && inputData.productDetail && inputData.refretch && inputData.switchPopupFromCartDrawer) {
            // openPopup(popupName, productDetail.product_id, productDetail, refretch, switchPopupFromCartDrawer);
        } else if (inputData.popupName === 'addPhone' && inputData.registerData) {
            setCurrentPopup(
                {
                    popupName: inputData.popupName,
                    registerData: inputData.registerData
                }
            );
        } else
            setCurrentPopup({popupName: inputData.popupName});
    };

    // return {currentPopup, setCurrentPopup, openPopup, closePopup, switchPopup};
    return (
        <PopupContext.Provider value={{currentPopup, openPopup, closePopup, switchPopup}}>
            {children}
        </PopupContext.Provider>
    );
};

export const usePopup = () => useContext(PopupContext);

