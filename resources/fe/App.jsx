import React from "react";
import MainRoutes from "./app/routes/MainRoutes";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    return (
        <>
            <ToastContainer/>
            <MainRoutes/>;
        </>
    );

}
