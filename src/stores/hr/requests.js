import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_REQUESTS,
  PAYROLL_REQUESTS_ME,
  PAYROLL_REQUESTS_PENDING,
  PAYROLL_APPROVE_REQUEST,
  PAYROLL_REJECT_REQUEST,
  PAYROLL_APPROVED_VACATIONS,
} from "@/api/Api";

export const useHrRequestsStore = defineStore("hr-requests", () => {
  const requests = ref([]);
  const loading = ref(false);
  /** Which list the UI last loaded: refresh after approve/reject must match it. */
  const listSource = ref("me");

  const setListSource = (source) => {
    listSource.value = source === "pending" ? "pending" : "me";
  };

  const refreshCurrentList = async () => {
    if (listSource.value === "pending") await getPendingRequests();
    else await getMyRequests();
  };

  const getMyRequests = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_REQUESTS_ME);
      // Map nested structure if necessary (message/data wrapper)
      requests.value = response.data.data.map((item) =>
        item.data ? { ...item.data } : item,
      );
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPendingRequests = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_REQUESTS_PENDING);
      // Map nested structure if necessary (message/data wrapper)
      requests.value = response.data.data.map((item) =>
        item.data ? { ...item.data } : item,
      );
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRequest = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_REQUESTS, payload);
      notyf.success(response.data.message || "Request submitted");
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveRequest = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_APPROVE_REQUEST(id));
      notyf.success(response.data.message || "Request approved");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const rejectRequest = async (id, reason = null) => {
    loading.value = true;
    try {
      const payload = reason ? { note: reason } : {};
      const response = await apiClient.post(
        PAYROLL_REJECT_REQUEST(id),
        payload,
      );
      notyf.success(response.data.message || "Request rejected");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getApprovedVacations = async (employeeId) => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_APPROVED_VACATIONS, {
        params: { employee_id: employeeId },
      });
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    requests,
    loading,
    listSource,
    setListSource,
    getMyRequests,
    getPendingRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    getApprovedVacations,
  };
});
