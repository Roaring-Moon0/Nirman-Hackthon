import axios from "axios";
import {
  API_BASE_URL,
  ADMIN_KEY_STORAGE,
  ADMIN_AUTH_SESSION_KEY,
} from "../utils/constants";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add admin key header
axiosInstance.interceptors.request.use(
  (config) => {
    const adminKey = sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (adminKey) {
      config.headers["x-admin-key"] = adminKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Invalid admin key - clear storage
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
