import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

const PREFIX = "payroll-system";

export const useHrEmployeesStore = defineStore("hr-employees", {
  state: () => ({
    employees: [],
    loading: false,
  }),

  actions: {
    async getEmployees() {
      this.loading = true;
      try {
        const response = await apiClient.get(`${PREFIX}/employees`);
        // Assuming same structure { message, data: [] }
        this.employees = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async getEmployee(id) {
      try {
        const response = await apiClient.get(`${PREFIX}/employees/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createEmployee(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(`${PREFIX}/employees`, payload);
        notyf.success(response.data.message || "Employee created successfully");
        await this.getEmployees();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateEmployee(id, payload) {
      this.loading = true;
      try {
        const response = await apiClient.put(
          `${PREFIX}/employees/${id}`,
          payload
        );
        notyf.success(response.data.message || "Employee updated successfully");
        await this.getEmployees();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteEmployee(id) {
      this.loading = true;
      try {
        const response = await apiClient.delete(`${PREFIX}/employees/${id}`);
        notyf.success(response.data.message || "Employee deleted successfully");
        await this.getEmployees();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
