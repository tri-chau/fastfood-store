import MainRoutes from "./app/routes/MainRoutes.jsx";
import React from "react";
import {store} from "./app/redux/store";
import {Provider} from "react-redux";
import ReactDOM from "react-dom/client";
import {AuthProvider} from "./app/hooks/contexts/authContext/index.jsx";
import {PopupProvider} from "./app/hooks/contexts/popupContext/popupState.jsx";
import i18n from "./app/locales/i18n/i18n.ts";
import {I18nextProvider} from 'react-i18next';
import ChatPopup from "./app/components/popup/ChatPopup.jsx";
import {PusherProvider} from "./app/modules/pusher/pusher.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <AuthProvider>
            <I18nextProvider i18n={i18n}>
                <PopupProvider>
                    <PusherProvider>
                        <MainRoutes/>
                        <ChatPopup/>
                    </PusherProvider>
                </PopupProvider>
            </I18nextProvider>
        </AuthProvider>
    </Provider>
);
