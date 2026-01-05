import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrShiftsStore = defineStore("hr-shifts", {
  state: () => ({
    shifts: [],
    loading: false,
  }),

  actions: {
    async getShifts() {
      this.loading = true;
      try {
        const response = await apiClient.get(`${PREFIX}/shifts`);
        this.shifts = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getShift(id) {
      try {
        const response = await apiClient.get(`${PREFIX}/shifts/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createShift(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(`${PREFIX}/shifts`, payload);
        notyf.success(response.data.message || "Shift created successfully");
        await this.getShifts();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateShift(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(`${PREFIX}/shifts/${id}`, payload);
        notyf.success(response.data.message || "Shift updated successfully");
        await this.getShifts();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteShift(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`${PREFIX}/shifts/${id}`);
        notyf.success(response.data.message || "Shift deleted successfully");
        await this.getShifts();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
