import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_DEPARTMENTS } from "@/api/Api";

export const useHrDepartmentsStore = defineStore("hr-departments", () => {
  const departments = ref([]);
  const loading = ref(false);

  const getDepartments = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_DEPARTMENTS);
      departments.value = response.data.data;
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDepartment = async (id) => {
    try {
      const response = await apiClient.get(`${PAYROLL_DEPARTMENTS}/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createDepartment = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_DEPARTMENTS, payload);
      notyf.success(response.data.message || "Department created successfully");
      await getDepartments();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDepartment = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_DEPARTMENTS}/${id}`,
        payload
      );
      notyf.success(response.data.message || "Department updated successfully");
      await getDepartments();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDepartment = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_DEPARTMENTS}/${id}`);
      notyf.success(response.data.message || "Department deleted successfully");
      await getDepartments();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    departments,
    loading,
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
