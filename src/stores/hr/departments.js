import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrDepartmentsStore = defineStore("hr-departments", {
  state: () => ({
    departments: [],
    loading: false,
    // error: null, // Removed as we use global handleError notification
  }),

  actions: {
    async getDepartments() {
      this.loading = true;
      try {
        const response = await apiClient.get(`${PREFIX}/departments`);
        // API returns { message: '...', data: [...] }
        this.departments = response.data.data;
        // Optional: notyf.success(response.data.message) here if we want toast on simple fetch, usually valid only for actions
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getDepartment(id) {
      try {
        const response = await apiClient.get(`${PREFIX}/departments/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createDepartment(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(`${PREFIX}/departments`, payload);
        notyf.success(
          response.data.message || "Department created successfully"
        );
        await this.getDepartments();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateDepartment(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PREFIX}/departments/${id}`,
          payload
        );
        notyf.success(
          response.data.message || "Department updated successfully"
        );
        await this.getDepartments();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteDepartment(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`${PREFIX}/departments/${id}`);
        notyf.success(
          response.data.message || "Department deleted successfully"
        );
        await this.getDepartments();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
