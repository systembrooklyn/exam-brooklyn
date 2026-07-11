import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import {
  PAYROLL_EMPLOYEE_DEDUCTIONS,
  PAYROLL_EMPLOYEE_DEDUCTION_BY_ID,
} from "@/api/Api";

export const useHrEmployeeDeductionsStore = defineStore(
  "hr-employee-deductions",
  () => {
    const employeeDeductions = ref([]);
    const loading = ref(false);

    const getEmployeeDeductions = async (params = {}) => {
      loading.value = true;
      try {
        const query = {};
        if (params.employee_id != null && params.employee_id !== "") {
          const id = Number(params.employee_id);
          if (Number.isFinite(id) && id > 0) query.employee_id = id;
        }
        if (params.payroll_month) query.payroll_month = params.payroll_month;

        const response = await apiClient.get(PAYROLL_EMPLOYEE_DEDUCTIONS, {
          params: query,
        });
        employeeDeductions.value = response.data?.data ?? [];
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const getEmployeeDeduction = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.get(PAYROLL_EMPLOYEE_DEDUCTION_BY_ID(id));
        return response.data?.data ?? response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const createEmployeeDeduction = async (payload) => {
      loading.value = true;
      try {
        const response = await apiClient.post(PAYROLL_EMPLOYEE_DEDUCTIONS, payload);
        notyf.success(response.data?.message || "Employee deduction created successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const updateEmployeeDeduction = async (id, payload) => {
      loading.value = true;
      try {
        const response = await apiClient.put(PAYROLL_EMPLOYEE_DEDUCTION_BY_ID(id), payload);
        notyf.success(response.data?.message || "Employee deduction updated successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteEmployeeDeduction = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.delete(PAYROLL_EMPLOYEE_DEDUCTION_BY_ID(id));
        notyf.success(response.data?.message || "Employee deduction deleted successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      employeeDeductions,
      loading,
      getEmployeeDeductions,
      getEmployeeDeduction,
      createEmployeeDeduction,
      updateEmployeeDeduction,
      deleteEmployeeDeduction,
    };
  },
);
