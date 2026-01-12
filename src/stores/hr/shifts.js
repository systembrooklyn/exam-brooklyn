import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

import { PAYROLL_SHIFTS } from "@/api/Api";

export const useHrShiftsStore = defineStore("hr-shifts", {
  state: () => ({
    shifts: [],
    loading: false,
  }),

  actions: {
    async getShifts() {
      this.loading = true;
      try {
        const response = await apiClient.get(PAYROLL_SHIFTS);
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
        const response = await apiClient.get(`${PAYROLL_SHIFTS}/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createShift(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(PAYROLL_SHIFTS, payload);
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
        const response = await apiClient.put(
          `${PAYROLL_SHIFTS}/${id}`,
          payload
        );
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
        const response = await apiClient.delete(`${PAYROLL_SHIFTS}/${id}`);
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
