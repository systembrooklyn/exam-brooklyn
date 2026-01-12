import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

import { PAYROLL_LINKING } from "@/api/Api";

export const useHrLinksStore = defineStore("hr-links", {
  state: () => ({
    links: [],
    loading: false,
  }),

  actions: {
    async getEmployeeJobDeps() {
      this.loading = true;
      try {
        const response = await apiClient.get(PAYROLL_LINKING);
        this.links = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async linkEmployeeJobDep(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(PAYROLL_LINKING, payload);
        notyf.success(response.data.message || "Linked successfully");
        await this.getEmployeeJobDeps();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateEmployeeJobDep(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PAYROLL_LINKING}/${id}`,
          payload
        );
        notyf.success(response.data.message || "Link updated successfully");
        await this.getEmployeeJobDeps();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteEmployeeJobDep(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`${PAYROLL_LINKING}/${id}`);
        notyf.success(response.data.message || "Link deleted successfully");
        await this.getEmployeeJobDeps();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
