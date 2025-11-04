import { defineStore } from "pinia";
import { ref } from "vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import notyf from "@/components/global/notyf";
import apiClient from "../api/axiosInstance";
import {
  FORGOT_PASSWORD,
  LOGIN,
  RESET_PASSWORD,
  USER_BY_TOKEN,
} from "../api/Api";
import { handleError } from "./handleError";

export const useAuthStore = defineStore("authStore", () => {
  const token = ref(null);
  const user = ref(null);
  const permissions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const forgotSuccess = ref("");
  const router = useRouter();


  const restoreTokenFromCookies = () => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      token.value = savedToken;
    }
  };

 
  const getUserByToken  = async () => {
    if (!token.value) return;
    try {
      const response = await apiClient.get(USER_BY_TOKEN, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = response.data.User;
      permissions.value = response.data.permissions || [];
    } catch (err) {
      logout();
    }
  };

  // ✅ Login
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(LOGIN, { email, password });
      token.value = response.data.token;

    
      Cookies.set("token", token.value, { expires: 7, path: "/" });

      
      await getUserByToken ();

      notyf.success("Logged in successfully");
      router.push("/systems");
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };


  const logout = async () => {
    loading.value = true;
    try {
      await apiClient.post("logout");
      notyf.success("Logged out successfully");
    } catch (err) {
      handleError(err);
    } finally {
      token.value = null;
      user.value = null;
      permissions.value = [];
      loading.value = false;

      Cookies.remove("token");

      router.push({ name: "login" });
    }
  };

  // ✅ Forgot password
  const forgotPassword = async (email) => {
    forgotSuccess.value = null;
    loading.value = true;
    try {
      const response = await apiClient.post(FORGOT_PASSWORD, { email });
      notyf.success(response.data.message);
      forgotSuccess.value = response.data.message;
    } catch (err) {
      handleError(err);
      forgotSuccess.value = null;
    } finally {
      loading.value = false;
    }
  };

  // ✅ Reset password
  const resetPassword = async (form) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post(RESET_PASSWORD, form, {
        headers: { "Content-Type": "application/json" },
      });

      notyf.success("Password reset successfully");
      router.push({ name: "login" });
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  const hasPermission = (permissionName) => {
    return permissions.value.includes(permissionName);
  };


  const initAuth = async () => {
    restoreTokenFromCookies();
    if (token.value) {
      await getUserByToken ();
    }
  };

  return {
    token,
    user,
    permissions,
    loading,
    error,
    forgotSuccess,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUserByToken ,
    hasPermission,
    initAuth,
  };
});
