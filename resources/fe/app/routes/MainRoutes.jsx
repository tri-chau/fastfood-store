import React, {Suspense} from "react";
import {BrowserRouter as Router, Route, Routes, useLocation,} from "react-router-dom";
import Header from "../layouts/Header/Header.jsx";
import Footer from "../layouts/Footer/Footer.jsx";
import "react-toastify/dist/ReactToastify.css";
import {ToastContainer} from "react-toastify";
import ScrollToTop from "../layouts/ScrollToTop.jsx";
import {AdminAuth, UserAuth} from "./Authenticate.jsx";
import PageLoading from "../components/loading/PageLoading.jsx";
import PageNotFound from "../layouts/PageNotFound/PageNotFound.jsx";

// Lazy-loaded pages
const HomePage = React.lazy(() => import("../pages/Home/index.jsx"));
const AboutPage = React.lazy(() => import("../pages/About/index.jsx"));
const MenuPage = React.lazy(() => import("../pages/Menu/index.jsx"));
const OrderPage = React.lazy(() => import("../pages/Order/index.jsx"));
const LoginPage = React.lazy(() => import("../pages/Admin/Authentication/Login.jsx"));
const OrderCRUD = React.lazy(() => import("../pages/Admin/Orders/OrderCRUD.jsx"));
const CategoryCRUD = React.lazy(() => import("../pages/Admin/Categories/CategoriesCRUD.jsx"));
const ProductCRUD = React.lazy(() => import("../pages/Admin/Products/ProductCRUD.jsx"));

function MainContent() {
    const location = useLocation();
    const excludedPaths = ["/checkout", "/payment"];
    const showHeaderFooter = !excludedPaths.includes(location.pathname);

    return (
        <>
            {showHeaderFooter && <Header/>}
            <Suspense fallback={<PageLoading/>}>
                <Routes>
                    {/* customer */}
                    {/*Not and Auth*/}
                    <Route path="/" element={<HomePage/>}/>

                    {/*<Route path="/about" element={<AboutPage/>}/>*/}

                    {/*<Route path="/verify-otp" element={<VerifyPage />}/>*/}

                    <Route path="/menu" element={<MenuPage/>}/>

                    {/* Auth */}
                    <Route
                        path="/orders"
                        element={
                            <UserAuth>
                                <OrderPage/>
                            </UserAuth>
                        }
                    />

                    {/*admin*/}
                    <Route path="/admin-login" element={<LoginPage/>}/>

                    <Route
                        path="/admin/categories"
                        element={
                            <AdminAuth>
                                <CategoryCRUD/>
                            </AdminAuth>
                        }
                    />

                    <Route
                        path="/admin/products"
                        element={
                            <AdminAuth>
                                <ProductCRUD/>
                            </AdminAuth>
                        }
                    />

                    <Route
                        path="/admin/orders"
                        element={
                            <AdminAuth>
                                <OrderCRUD/>
                            </AdminAuth>
                        }
                    />

                    {/* Blank page */}
                    <Route path="*" element={<PageNotFound/>}/>

                </Routes>
            </Suspense>
            {/*        <Route*/}
            {/*            path="/userprofile"*/}
            {/*            element={*/}
            {/*                <UserAuth>*/}
            {/*                    <UserProfilePage />*/}
            {/*                </UserAuth>*/}
            {/*            }*/}
            {/*        />*/}
            {showHeaderFooter && <Footer/>}
        </>
    );
}

function MainRoutes() {
    return (
        <main className="mt-[70px] overflow-hidden">
            <Router>
                <ScrollToTop/>
                <ToastContainer
                    position="top-center"
                    autoClose={600}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    theme="light"
                />
                <MainContent/>
            </Router>
        </main>
    );
}

export default MainRoutes;
