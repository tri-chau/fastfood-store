import React, {useRef, useState} from 'react';
import SpinnerLoading from '../../../components/loading/SpinnerLoading.jsx';
import {doSignInWithCustomToken, doSignInWithEmailAndPassword} from "../../../modules/firebase/auth.js";
import {notify} from "../../../layouts/Notification/notify.jsx";
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const Login = () => {
    const inputRef = useRef({email: '', password: ''});
    const [isSigningIn, setIsSigningIn] = useState(false);
    const navigate = useNavigate();

    const handleChangeInput = (e) => {
        const {name, value} = e.target;
        inputRef.current[name] = value; // Lưu giá trị vào ref nhưng không làm rerender
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                // Sign in with email and password to get firebase_uid
                const {user} = await doSignInWithEmailAndPassword(inputRef.current.email, inputRef.current.password);

                // get custom token from server by firebase_uid
                const {data} = await axios.post('/api/auth/getCustomToken', {firebase_uid: user.uid});

                if (data) {
                    await doSignInWithCustomToken(data.custom_token);
                }

                setIsSigningIn(false);
                navigate('/admin/products');
                notify('success', 'Login successfully');
            } catch (error) {
                setIsSigningIn(false);
                notify('error', 'Login failed');
            }
        }
    };

    return (
        <div className="inset-0 bg-gray-50 flex items-center justify-center mt-20 mb-30">
            <div
                className="w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Sign In</h2>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email"
                               className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            onChange={handleChangeInput}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Enter your email address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"
                               className="block text-sm font-medium text-gray-700 dark:text-white">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={handleChangeInput}
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <a href="#" className="text-sm text-blue-500 hover:underline dark:text-primary-500">Forgot
                            Password?</a>
                    </div>
                    <button type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        {isSigningIn ? <SpinnerLoading/> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
