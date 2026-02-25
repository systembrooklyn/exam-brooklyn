import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_CALC,
  PAYROLL_STATUS_UPDATE,
  PAYROLL_DETAILS,
  PAYROLL_ACTIONABLE,
} from "@/api/Api";

export const useHrPayrollStore = defineStore("hr-payroll", () => {
  const payrolls = ref([]);
  const payrollDetails = ref(null);
  const actionablePayrolls = ref([]);
  const loading = ref(false);

  const calculatePayroll = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_CALC, payload);
      notyf.success(response.data.message || "Payroll calculated successfully");
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePayrollStatus = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_STATUS_UPDATE, payload);
      notyf.success(response.data.message || "Payroll status updated");
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPayrollDetails = async (employee_id, payroll_month) => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_DETAILS, {
        params: { employee_id, payroll_month },
      });
      payrollDetails.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getActionablePayrolls = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_ACTIONABLE);
      actionablePayrolls.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    payrolls,
    payrollDetails,
    actionablePayrolls,
    loading,
    calculatePayroll,
    updatePayrollStatus,
    getPayrollDetails,
    getActionablePayrolls,
  };
});
