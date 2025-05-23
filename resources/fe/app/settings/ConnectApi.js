    import axios from "axios";
    import {getAuth} from "firebase/auth";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8080",
      headers: {Accept: "application/json" , "Content-Type": "application/json"},
    });

    // Tự động thêm Firebase ID Token vào headers
    instance.interceptors.request.use(async (config) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken(); // Lấy Firebase Token
            config.headers.Authorization = `Bearer ${token}`; // Gửi lên API
        }

        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    export default instance;
