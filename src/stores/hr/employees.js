import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_EMPLOYEES } from "@/api/Api";

export const useHrEmployeesStore = defineStore("hr-employees", () => {
  const employees = ref([]);
  const loading = ref(false);

  const getEmployees = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_EMPLOYEES);
      employees.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getEmployee = async (id) => {
    try {
      const response = await apiClient.get(`${PAYROLL_EMPLOYEES}/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createEmployee = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_EMPLOYEES, payload);
      notyf.success(response.data.message || "Employee created successfully");
      await getEmployees();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployee = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_EMPLOYEES}/${id}`,
        payload
      );
      notyf.success(response.data.message || "Employee updated successfully");
      await getEmployees();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmployee = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_EMPLOYEES}/${id}`);
      notyf.success(response.data.message || "Employee deleted successfully");
      await getEmployees();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    employees,
    loading,
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
});
