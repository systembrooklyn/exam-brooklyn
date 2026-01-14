import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_VACATION_BALANCES } from "@/api/Api";

export const useHrVacationBalancesStore = defineStore(
  "hr-vacation-balances",
  () => {
    const vacationBalances = ref([]);
    const loading = ref(false);

    const getVacationBalances = async () => {
      loading.value = true;
      try {
        const response = await apiClient.get(PAYROLL_VACATION_BALANCES);
        vacationBalances.value = response.data.data;
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const getVacationBalance = async (id) => {
      try {
        const response = await apiClient.get(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    };

    const createVacationBalance = async (payload) => {
      loading.value = true;
      try {
        const response = await apiClient.post(
          PAYROLL_VACATION_BALANCES,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance created successfully"
        );
        await getVacationBalances();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const updateVacationBalance = async (id, payload) => {
      loading.value = true;
      try {
        const response = await apiClient.put(
          `${PAYROLL_VACATION_BALANCES}/${id}`,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance updated successfully"
        );
        await getVacationBalances();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteVacationBalance = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.delete(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        notyf.success(
          response.data.message || "Vacation Balance deleted successfully"
        );
        await getVacationBalances();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      vacationBalances,
      loading,
      getVacationBalances,
      getVacationBalance,
      createVacationBalance,
      updateVacationBalance,
      deleteVacationBalance,
    };
  }
);
