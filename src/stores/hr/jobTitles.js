import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrJobTitlesStore = defineStore("hr-job-titles", {
  state: () => ({
    jobTitles: [],
    loading: false,
  }),

  actions: {
    async getJobTitles() {
      this.loading = true;
      try {
        const response = await apiClient.get(`${PREFIX}/job-titles`);
        this.jobTitles = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getJobTitle(id) {
      try {
        const response = await apiClient.get(`${PREFIX}/job-titles/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createJobTitle(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(`${PREFIX}/job-titles`, payload);
        notyf.success(
          response.data.message || "Job Title created successfully"
        );
        await this.getJobTitles();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateJobTitle(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PREFIX}/job-titles/${id}`,
          payload
        );
        notyf.success(
          response.data.message || "Job Title updated successfully"
        );
        await this.getJobTitles();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteJobTitle(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`${PREFIX}/job-titles/${id}`);
        notyf.success(
          response.data.message || "Job Title deleted successfully"
        );
        await this.getJobTitles();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
