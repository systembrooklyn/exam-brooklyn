import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  FREELANCERS_BASE,
  FREELANCER_BY_ID,
  FREELANCER_PAYROLLS,
  FREELANCER_PAYROLL_BY_ID,
  FREELANCER_TOTAL_BY_MONTH
} from '@/api/Api';

export const useFreelancersStore = defineStore('freelancers-payroll', () => {
  const freelancers = ref([]);
  const currentFreelancer = ref(null);
  const payrolls = ref([]);
  const currentPayroll = ref(null);
  const monthlyTotal = ref(0);
  const loading = ref(false);
  const submitting = ref(false);

  // ── Freelancers ───────────────────────────────────────────────────────────
  const fetchFreelancers = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(FREELANCERS_BASE, { params });
      freelancers.value = res.data?.data ?? res.data ?? [];
      return freelancers.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchFreelancer = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.get(FREELANCER_BY_ID(id));
      currentFreelancer.value = res.data?.data ?? res.data;
      return currentFreelancer.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createFreelancer = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(FREELANCERS_BASE, payload);
      notyf.success('Freelancer created successfully.');
      await fetchFreelancers();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const updateFreelancer = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(FREELANCER_BY_ID(id), payload);
      notyf.success('Freelancer updated successfully.');
      if (currentFreelancer.value?.id === Number(id)) {
        currentFreelancer.value = res.data?.data ?? res.data;
      }
      await fetchFreelancers();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const deleteFreelancer = async (id) => {
    loading.value = true;
    try {
      await apiClient.delete(FREELANCER_BY_ID(id));
      notyf.success('Freelancer deleted successfully.');
      await fetchFreelancers();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Payroll Records ───────────────────────────────────────────────────────
  const fetchPayrolls = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(FREELANCER_PAYROLLS, { params });
      payrolls.value = res.data?.data ?? res.data ?? [];
      return payrolls.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPayroll = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(FREELANCER_PAYROLLS, payload);
      notyf.success('Payroll record created successfully.');
      await fetchPayrolls();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const updatePayroll = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(FREELANCER_PAYROLL_BY_ID(id), payload);
      notyf.success('Payroll record updated successfully.');
      await fetchPayrolls();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const deletePayroll = async (id) => {
    loading.value = true;
    try {
      await apiClient.delete(FREELANCER_PAYROLL_BY_ID(id));
      notyf.success('Payroll record deleted successfully.');
      await fetchPayrolls();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTotalByMonth = async (month) => {
    try {
      const res = await apiClient.get(FREELANCER_TOTAL_BY_MONTH, { params: { month } });
      monthlyTotal.value = res.data?.data?.total_net_amount ?? res.data?.total_net_amount ?? 0;
      return monthlyTotal.value;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return {
    freelancers,
    currentFreelancer,
    payrolls,
    currentPayroll,
    monthlyTotal,
    loading,
    submitting,
    fetchFreelancers,
    fetchFreelancer,
    createFreelancer,
    updateFreelancer,
    deleteFreelancer,
    fetchPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll,
    fetchTotalByMonth
  };
});
