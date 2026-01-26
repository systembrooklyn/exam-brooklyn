
import { defineStore } from "pinia";
import { DEADLINES } from "../../api/Api";
import apiClient from "../../api/axiosInstance";
import { ref, computed } from "vue";
import { handleError } from "../handleError";

export const useDeadlinesStore = defineStore("deadlines", () => {
  const deadlines = ref([]);
  const error = ref(null);

  const fetchDeadlines = async (data) => {
    error.value = null;
    try {
      const response = await apiClient.post(DEADLINES, data);
      deadlines.value = response.data.data;
    } catch (err) {
    handleError(err);
      deadlines.value = [];
      console.error("Error fetching deadlines:", err);
    }
  };
 
  const groupedByDate = computed(() => {
  const result = {};

  deadlines.value.forEach(item => {
    const date = item.due_date;
    const amount = parseFloat(item.amount || "0");
    const paidAmount = parseFloat(item.paid_amount || "0");

    if (!result[date]) {
      result[date] = {
        date,
        budget: 0,
        paid: 0,
        unpaid: 0,
        cancellation: 0,
      };
    }


    result[date].budget += amount;

   
    result[date].paid += paidAmount;

 
    result[date].unpaid += (amount - paidAmount);

   
    if (item.student?.scholar_status === "canceled") {
      result[date].cancellation += amount;
    }
  });

  return Object.values(result);
});

  return {
    deadlines,
    fetchDeadlines,
    groupedByDate,
  };
});
