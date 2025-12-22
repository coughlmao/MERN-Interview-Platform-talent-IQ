import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // browser will send cookies to server automatically on every req
});

export default axiosInstance;
