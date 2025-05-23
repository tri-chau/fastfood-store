import {auth} from "./firebase";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithCustomToken,
    signOut,
    updateProfile
} from "firebase/auth";
import axios from "axios";
import {notify} from "../../layouts/Notification/notify.jsx";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
        const {user} = await signInWithPopup(auth, provider);

        // Gửi UID lên server kiểm tra xem user đã có trong database chưa
        const {data} = await axios.post('/api/auth/check-firebase-user', {firebase_uid: user.uid});


        // Nếu user chưa có trong database, yêu cầu nhập thêm thông tin
        if (!data.existed) {
            // tra ve du lieu de register
            return {
                // accessToken: user.accessToken,
                firebase_uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                auth_type: 'google',
            };
        }
    } catch (error) {
        notify('error', 'Google Login failed');
    }
}

export const doSignInWithCustomToken = async (token) => {
    return signInWithCustomToken(auth, token)
}

export const doSignOut = async () => {
    return signOut(auth)
}

export const doUpdateProfile = async (displayName, photoURL) => {
    return updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
    })
}

let logoutTimer;

const resetLogoutTimer = () => {
    clearTimeout(logoutTimer);

    logoutTimer = setTimeout(() => {
        doSignOut();
    }, 30 * 60 * 1000);
};

// Reset the timer on any user interaction
['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'].forEach(event => {
    window.addEventListener(event, resetLogoutTimer);
});

// Initialize the timer when the page loads
resetLogoutTimer();



// export const doPasswordReset = async (email) => {
//     return sendPasswordResetEmail(auth, email)
// }
//
// export const doPasswordUpdate = async (password) => {
//     return updatePassword(auth.currentUser, password)
// }
//
// export const doSendEmailVerification = async () => {
//     return sendEmailVerification(auth.currentUser, {
//         url: `${window.location.origin}/login`
//     });
// }


