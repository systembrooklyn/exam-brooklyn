import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import {
  PAYROLL_EMPLOYEE_ADJUSTMENTS,
  PAYROLL_EMPLOYEE_ADJUSTMENT_BY_ID,
} from "@/api/Api";

export const useHrEmployeeAdjustmentsStore = defineStore(
  "hr-employee-adjustments",
  () => {
    const adjustments = ref([]);
    const loading = ref(false);

    const getAdjustments = async (params = {}) => {
      loading.value = true;
      try {
        const query = {};
        if (params.employee_id != null && params.employee_id !== "") {
          const employeeId = Number(params.employee_id);
          if (Number.isFinite(employeeId) && employeeId > 0) {
            query.employee_id = employeeId;
          }
        }
        if (params.month) {
          query.month = String(params.month).slice(0, 7);
        }

        const response = await apiClient.get(PAYROLL_EMPLOYEE_ADJUSTMENTS, {
          params: query,
        });
        adjustments.value = response.data?.data ?? [];
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const getAdjustment = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.get(
          PAYROLL_EMPLOYEE_ADJUSTMENT_BY_ID(id),
        );
        return response.data?.data ?? response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const createAdjustment = async (payload) => {
      loading.value = true;
      try {
        const response = await apiClient.post(
          PAYROLL_EMPLOYEE_ADJUSTMENTS,
          payload,
        );
        notyf.success(response.data?.message || "Adjustment added successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const updateAdjustment = async (id, payload) => {
      loading.value = true;
      try {
        const response = await apiClient.put(
          PAYROLL_EMPLOYEE_ADJUSTMENT_BY_ID(id),
          payload,
        );
        notyf.success(
          response.data?.message || "Adjustment updated successfully",
        );
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteAdjustment = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.delete(
          PAYROLL_EMPLOYEE_ADJUSTMENT_BY_ID(id),
        );
        notyf.success(
          response.data?.message || "Adjustment deleted successfully",
        );
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      adjustments,
      loading,
      getAdjustments,
      getAdjustment,
      createAdjustment,
      updateAdjustment,
      deleteAdjustment,
    };
  },
);
