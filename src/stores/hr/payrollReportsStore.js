import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import { handleError } from '@/stores/handleError';
import {
  PAYROLL_REPORTS_DASHBOARD,
  PAYROLL_REPORTS_PERIOD,
  PAYROLL_REPORTS_EMPLOYEE_HISTORY,
  PAYROLL_REPORTS_FREELANCERS
} from '@/api/Api';

export const usePayrollReportsStore = defineStore('payroll-reports', () => {
  const dashboardData = ref(null);
  const periodData = ref([]);
  const employeeHistory = ref([]);
  const freelancerSummary = ref(null);
  const loading = ref(false);

  const fetchPayrollDashboard = async (params) => {
    loading.value = true;
    try {
      const res = await apiClient.get(PAYROLL_REPORTS_DASHBOARD, { params });
      dashboardData.value = res.data?.data ?? res.data;
      return dashboardData.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPayrollPeriod = async (params) => {
    loading.value = true;
    try {
      const res = await apiClient.get(PAYROLL_REPORTS_PERIOD, { params });
      periodData.value = res.data?.data ?? res.data ?? [];
      return periodData.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchEmployeeHistory = async (id, params) => {
    loading.value = true;
    try {
      const res = await apiClient.get(PAYROLL_REPORTS_EMPLOYEE_HISTORY(id), { params });
      employeeHistory.value = res.data?.data ?? res.data ?? [];
      return employeeHistory.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchFreelancerSummary = async (params) => {
    loading.value = true;
    try {
      const res = await apiClient.get(PAYROLL_REPORTS_FREELANCERS, { params });
      freelancerSummary.value = res.data?.data ?? res.data;
      return freelancerSummary.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    dashboardData,
    periodData,
    employeeHistory,
    freelancerSummary,
    loading,
    fetchPayrollDashboard,
    fetchPayrollPeriod,
    fetchEmployeeHistory,
    fetchFreelancerSummary
  };
});
