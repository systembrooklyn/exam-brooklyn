import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_SHIFTS } from "@/api/Api";

export const useHrShiftsStore = defineStore("hr-shifts", () => {
  const shifts = ref([]);
  const loading = ref(false);

  const getShifts = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_SHIFTS);
      shifts.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getShift = async (id) => {
    try {
      const response = await apiClient.get(`${PAYROLL_SHIFTS}/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createShift = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_SHIFTS, payload);
      notyf.success(response.data.message || "Shift created successfully");
      await getShifts();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateShift = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(`${PAYROLL_SHIFTS}/${id}`, payload);
      notyf.success(response.data.message || "Shift updated successfully");
      await getShifts();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteShift = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_SHIFTS}/${id}`);
      notyf.success(response.data.message || "Shift deleted successfully");
      await getShifts();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    shifts,
    loading,
    getShifts,
    getShift,
    createShift,
    updateShift,
    deleteShift,
  };
});
