import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
    withCredentials: true,
});

export default axiosInstance;