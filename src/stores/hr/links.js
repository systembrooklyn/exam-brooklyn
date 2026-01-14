import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_LINKING } from "@/api/Api";

export const useHrLinksStore = defineStore("hr-links", () => {
  const links = ref([]);
  const loading = ref(false);

  const getEmployeeJobDeps = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_LINKING);
      links.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const linkEmployeeJobDep = async (
    payload,
    { showNotification = true, refresh = true } = {}
  ) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_LINKING, payload);
      if (showNotification) {
        notyf.success(response.data.message || "Linked successfully");
      }
      if (refresh) {
        await getEmployeeJobDeps();
      }
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployeeJobDep = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(`${PAYROLL_LINKING}/${id}`, payload);
      notyf.success(response.data.message || "Link updated successfully");
      await getEmployeeJobDeps();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmployeeJobDep = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_LINKING}/${id}`);
      notyf.success(response.data.message || "Link deleted successfully");
      await getEmployeeJobDeps();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    links,
    loading,
    getEmployeeJobDeps,
    linkEmployeeJobDep,
    updateEmployeeJobDep,
    deleteEmployeeJobDep,
  };
});
