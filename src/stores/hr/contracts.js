import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrContractsStore = defineStore("hr-contracts", {
  state: () => ({
    contracts: [],
    loading: false,
  }),

  actions: {
    async getContracts() {
      this.loading = true;
      try {
        const response = await apiClient.get(`${PREFIX}/contracts`);
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
        const response = await apiClient.get(`${PREFIX}/contracts/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createContract(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(`${PREFIX}/contracts`, payload);
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
          `${PREFIX}/contracts/${id}`,
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
