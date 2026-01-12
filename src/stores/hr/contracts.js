import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

import { PAYROLL_CONTRACTS } from "@/api/Api";

export const useHrContractsStore = defineStore("hr-contracts", {
  state: () => ({
    contracts: [],
    loading: false,
  }),

  actions: {
    async getContracts() {
      this.loading = true;
      try {
        const response = await apiClient.get(PAYROLL_CONTRACTS);
        this.contracts = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getContract(id) {
      try {
        const response = await apiClient.get(`${PAYROLL_CONTRACTS}/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createContract(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(PAYROLL_CONTRACTS, payload);
        notyf.success(response.data.message || "Contract created successfully");
        await this.getContracts();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateContract(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PAYROLL_CONTRACTS}/${id}`,
          payload
        );
        notyf.success(response.data.message || "Contract updated successfully");
        await this.getContracts();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
