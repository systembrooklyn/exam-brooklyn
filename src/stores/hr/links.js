import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrLinksStore = defineStore("hr-links", {
  state: () => ({
    links: [],
    loading: false,
  }),

  actions: {
    async getEmployeeJobDeps() {
      this.loading = true;
      try {
        const response = await apiClient.get(
          `${PREFIX}/employee-job-departments`
        );
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
        const response = await apiClient.post(
          `${PREFIX}/employee-job-departments`,
          payload
        );
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
          `${PREFIX}/employee-job-departments/${id}`,
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
        const response = await apiClient.delete(
          `${PREFIX}/employee-job-departments/${id}`
        );
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
