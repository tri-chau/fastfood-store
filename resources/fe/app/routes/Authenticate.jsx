import React from "react";
import {Navigate} from "react-router-dom";
import SignInPasswordPopup from "../components/popup/SignInPasswordPopup.jsx";
import {useAuth} from "../hooks/contexts/authContext/index.jsx";

const NonUserAuth = ({children}) => {
    const {userLoggedIn} = useAuth();
    if (userLoggedIn) {
        return <Navigate to="/"/>;
    } else if (!userLoggedIn) {
        return children;
    }
};

const UserAuth = ({children}) => {
    const {userLoggedIn, isPremiumUser} = useAuth();
    if (userLoggedIn && !isPremiumUser) {
        return children;
    } else if (!userLoggedIn) {
        return <SignInPasswordPopup/>;
    }
};

const AdminAuth = ({children}) => {
    const {userLoggedIn, isPremiumUser} = useAuth();
    if (userLoggedIn && isPremiumUser) {
        return children;
    } else {
        return <Navigate to="/login"/>;
    }
}


export {UserAuth, NonUserAuth, AdminAuth};
