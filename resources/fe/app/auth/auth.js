// filepath: c:\xampp\htdocs\fastfood-store2\resources\fe\app\auth\auth.js
const isDevelopment = process.env.NODE_ENV === "development";

export const getCurrentUser = () => {
    if (isDevelopment) {
        return {
            id: 1,
            name: "Admin",
            email: "admin@admin.com",
            role: "admin", // or "admin" based on your needs
        }; // Mock user data
    }
    // Actual authentication logic
    return JSON.parse(localStorage.getItem("user"));
};