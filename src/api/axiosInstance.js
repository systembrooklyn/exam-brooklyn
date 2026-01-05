import axios from "axios";
import { BASE_URL } from "./Api";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `%c[Request] ${config.method.toUpperCase()} ${config.url}`,
      "color: #3b82f6; font-weight: bold;",
      config.data || ""
    );
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `%c[Response] ${response.config.url}`,
      "color: #10b981; font-weight: bold;",
      response.data
    );
    return response;
  },
  (error) => {
    console.error("[Response Error]", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
