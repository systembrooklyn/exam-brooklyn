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
    console.log(payload)
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
    console.log(employee_id, payroll_month)
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

  const getActionablePayrolls = async (params = {}) => {
    loading.value = true;
    try {
      const queryParams = {};
      if (params.include_missing != null)
        queryParams.include_missing = params.include_missing;
      if (params.period_from) queryParams.period_from = params.period_from;
      if (params.period_to) queryParams.period_to = params.period_to;
      if (params.status) queryParams.status = params.status;

      const response = await apiClient.get(PAYROLL_ACTIONABLE, {
        params: queryParams,
      });

      const mainData = response.data.data || [];
      const missingData = (response.data.employees_without_payroll || []).map(
        (emp) => ({
          ...emp,
          is_missing: true,
          current_status: "no_payroll_calculated",
          period_from: params.period_from,
          period_to: params.period_to,
          employee: {
            id: emp.id,
            name: emp.name,
            fingerprint: emp.fingerprint,
          },
        }),
      );

      actionablePayrolls.value = [...mainData, ...missingData];
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
