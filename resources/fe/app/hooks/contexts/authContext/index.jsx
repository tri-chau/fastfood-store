import {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../../../modules/firebase/firebase.js"
import {onAuthStateChanged, signInWithCustomToken, getIdToken} from "firebase/auth"

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        console.log('AuthProvider: Starting auth state check...');
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        setLoading(true);
        console.log('AuthProvider: User state changed:', user ? user.uid : 'No user');
        if (user) {
            setCurrentUser(user);
            setUserLoggedIn(true);

            // Lấy token
            try {
                const idToken = await getIdToken(user);
                setToken(idToken);
                console.log('AuthProvider: Token fetched:', idToken);
            } catch (error) {
                console.error('AuthProvider: Error getting ID token:', error);
                setToken(null);
            }

            const isEmail = user.providerData.some(
                (provider) => provider.providerId === "password"
            );
            setIsEmailUser(isEmail);

            const isGoogle = user.providerData.some(
                (provider) => provider.providerId === "google.com"
            );
            setIsGoogleUser(isGoogle);

            const tokenResult = await user.getIdTokenResult();
            console.log('Firebase token claims:', tokenResult.claims);
            console.log('premiumAccount:', tokenResult.claims.premiumAccount);
            const premiumAccount = tokenResult.claims.premiumAccount;
            console.log('isPremiumUser:', !!premiumAccount);
            setIsPremiumUser(!!premiumAccount);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
            setToken(null);
            setIsEmailUser(false);
            setIsGoogleUser(false);
            setIsPremiumUser(false);
        }
        setLoading(false);
        console.log('AuthProvider: Loading finished, loading:', false);
    }




    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, initializeUser);
    //     return unsubscribe;
    // }, []);
    //
    // async function initializeUser(user) {
    //     if (user) {
    //         setCurrentUser({...user});
    //
    //         // check if provider is email and password login
    //         const isEmail = user.providerData.some(
    //             (provider) => provider.providerId === "password");
    //         setIsEmailUser(isEmail);
    //
    //         // check if the auth provider is google or not
    //         //   const isGoogle = user.providerData.some(
    //         //     (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
    //         //   );
    //         //   setIsGoogleUser(isGoogle);
    //
    //         setUserLoggedIn(true);
    //
    //         // check if user is premium user
    //         const token = await user.getIdTokenResult();
    //         console.log('Firebase token claims:', token.claims); // Kiểm tra claims
    //         console.log('premiumAccount:', token.claims.premiumAccount);
    //         const premiumAccount = token.claims.premiumAccount;
    //         console.log('isPremiumUser:', !!premiumAccount); // Kiểm tra giá trị
    //         setIsPremiumUser(!!premiumAccount);
    //
    //     } else {
    //         setCurrentUser(null);
    //         setUserLoggedIn(false);
    //     }
    //
    //     setLoading(false);
    // }

    const value = {
        currentUser,
        userLoggedIn,
        loading,
        isEmailUser,
        isGoogleUser,
        isPremiumUser,
        token
    }
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
