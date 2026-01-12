import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { PAYROLL_VACATION_BALANCES } from "@/api/Api";

export const useHrVacationBalancesStore = defineStore("hr-vacation-balances", {
  state: () => ({
    vacationBalances: [],
    loading: false,
  }),

  actions: {
    async getVacationBalances() {
      this.loading = true;
      try {
        const response = await apiClient.get(PAYROLL_VACATION_BALANCES);
        this.vacationBalances = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getVacationBalance(id) {
      try {
        const response = await apiClient.get(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createVacationBalance(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(
          PAYROLL_VACATION_BALANCES,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance created successfully"
        );
        await this.getVacationBalances();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateVacationBalance(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PAYROLL_VACATION_BALANCES}/${id}`,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance updated successfully"
        );
        await this.getVacationBalances();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteVacationBalance(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        notyf.success(
          response.data.message || "Vacation Balance deleted successfully"
        );
        await this.getVacationBalances();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
