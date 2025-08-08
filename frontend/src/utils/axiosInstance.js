import axios from "axios";
import {store} from "../redux/store";
import { logout } from "../redux/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // important for cookies
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login"; // redirect immediately
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
