import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_CONTRACTS } from "@/api/Api";

export const useHrContractsStore = defineStore("hr-contracts", () => {
  const contracts = ref([]);
  const loading = ref(false);

  const getContracts = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_CONTRACTS);
      contracts.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getContract = async (id) => {
    try {
      const response = await apiClient.get(`${PAYROLL_CONTRACTS}/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createContract = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_CONTRACTS, payload);
      notyf.success(response.data.message || "Contract created successfully");
      await getContracts();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateContract = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_CONTRACTS}/${id}`,
        payload
      );
      notyf.success(response.data.message || "Contract updated successfully");
      await getContracts();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    contracts,
    loading,
    getContracts,
    getContract,
    createContract,
    updateContract,
  };
});
