import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";

import { PAYROLL_EMPLOYEES } from "@/api/Api";

export const useHrEmployeesStore = defineStore("hr-employees", {
  state: () => ({
    employees: [],
    loading: false,
  }),

  actions: {
    async getEmployees() {
      this.loading = true;
      try {
        const response = await apiClient.get(PAYROLL_EMPLOYEES);
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
        const response = await apiClient.get(`${PAYROLL_EMPLOYEES}/${id}`);
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    async createEmployee(payload) {
      this.loading = true;
      try {
        const response = await apiClient.post(PAYROLL_EMPLOYEES, payload);
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
          `${PAYROLL_EMPLOYEES}/${id}`,
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
        const response = await apiClient.delete(`${PAYROLL_EMPLOYEES}/${id}`);
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
