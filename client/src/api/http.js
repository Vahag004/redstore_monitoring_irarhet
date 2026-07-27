import axios from "axios";

// Set VITE_API_BASE_URL in a .env file, e.g.:
//   VITE_API_BASE_URL=http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const http = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Normalizes error messages so slices/thunks can show something sensible.
http.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Անհայտ սխալ";
        return Promise.reject(new Error(message));
    },
);

export default http;
