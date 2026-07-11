import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import {
  PAYROLL_DEDUCTION_TYPES,
  PAYROLL_DEDUCTION_TYPE_BY_ID,
} from "@/api/Api";

export const useHrDeductionTypesStore = defineStore(
  "hr-deduction-types",
  () => {
    const deductionTypes = ref([]);
    const loading = ref(false);

    const getDeductionTypes = async () => {
      loading.value = true;
      try {
        const response = await apiClient.get(PAYROLL_DEDUCTION_TYPES);
        deductionTypes.value = response.data?.data ?? [];
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const getDeductionType = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.get(PAYROLL_DEDUCTION_TYPE_BY_ID(id));
        return response.data?.data ?? response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const createDeductionType = async (payload) => {
      loading.value = true;
      try {
        const response = await apiClient.post(PAYROLL_DEDUCTION_TYPES, payload);
        notyf.success(response.data?.message || "Deduction type created successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const updateDeductionType = async (id, payload) => {
      loading.value = true;
      try {
        const response = await apiClient.put(PAYROLL_DEDUCTION_TYPE_BY_ID(id), payload);
        notyf.success(response.data?.message || "Deduction type updated successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteDeductionType = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.delete(PAYROLL_DEDUCTION_TYPE_BY_ID(id));
        notyf.success(response.data?.message || "Deduction type deleted successfully");
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      deductionTypes,
      loading,
      getDeductionTypes,
      getDeductionType,
      createDeductionType,
      updateDeductionType,
      deleteDeductionType,
    };
  },
);
