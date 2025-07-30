// 📁 src/stores/requestStore.js
import { defineStore } from "pinia";
import { ref } from "vue";



import { REQUESTS } from "../../api/Api";
import apiClient from "../../api/axiosInstance";
import { handleError } from "../handleError";

export const useRequestStore = defineStore("requestStore", () => {
  const requests = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchRequests = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(ALL_REQUESTS);
      requests.value = response.data.data;
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  const addRequest = async (request) => {
    try {
      const response = await apiClient.post(REQUESTS, request);
      requests.value.push(response.data.data);
      notyf.success("Request added successfully");
    } catch (err) {
      handleError(err);
    }
  };

  const updateRequest = async (id, updatedData) => {
    try {
      const response = await apiClient.put(`${ALL_REQUESTS}/${id}`, updatedData);
      const updatedRequest = response.data.data;

      const index = requests.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        requests.value[index] = updatedRequest;
      }

      notyf.success("Request updated successfully");
    } catch (err) {
      handleError(err);
    }
  };

  const deleteRequest = async (id) => {
    try {
      await apiClient.delete(`${ALL_REQUESTS}/${id}`);
      requests.value = requests.value.filter((r) => r.id !== id);
      notyf.success("Request deleted successfully");
    } catch (err) {
      handleError(err);
    }
  };

  return {
    requests,
    loading,
    error,
    fetchRequests,
    addRequest,
    updateRequest,
    deleteRequest,
  };
});
