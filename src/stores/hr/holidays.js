import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_HOLIDAYS,
  PAYROLL_LINK_HOLIDAY,
  PAYROLL_UNLINK_HOLIDAY,
} from "@/api/Api";

export const useHrHolidaysStore = defineStore("hr-holidays", () => {
  const holidays = ref([]);
  const loading = ref(false);

  const getHolidays = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_HOLIDAYS);
      holidays.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createHoliday = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_HOLIDAYS, payload);
      notyf.success(response.data.message || "Holiday created successfully");
      await getHolidays();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateHoliday = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_HOLIDAYS}/${id}`,
        payload,
      );
      notyf.success(response.data.message || "Holiday updated successfully");
      await getHolidays();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteHoliday = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_HOLIDAYS}/${id}`);
      notyf.success(response.data.message || "Holiday deleted successfully");
      await getHolidays();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const linkHolidayToContract = async (holidayId, contractIds) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_LINK_HOLIDAY(holidayId), {
        contract_ids: contractIds,
      });
      notyf.success(response.data.message || "Holiday linked successfully");
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    holidays,
    loading,
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    linkHolidayToContract,
  };
});
