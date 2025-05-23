// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyCc6Zfw-kBqMaF6ltbSNtz_mm_iRXbnAGk",
    authDomain: "fast-food-store-25709.firebaseapp.com",
    projectId: "fast-food-store-25709",
    storageBucket: "fast-food-store-25709.firebasestorage.app",
    messagingSenderId: "123738092663",
    appId: "1:123738092663:web:b475fd75bfa2975b3c4272",
    measurementId: "G-RBH3PQ9J05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
