import { defineStore } from "pinia";
import { DEADLINES } from "../../api/Api";
import apiClient from "../../api/axiosInstance";
import { handleError } from "../handleError";
import { ref, computed } from "vue";

export const useDeadlinesStore = defineStore("deadlines", () => {
  const deadlines = ref([]);

  const fetchDeadlines = async (data) => {
    try {
      const response = await apiClient.post(DEADLINES, data);
      deadlines.value = response.data.data;
    } catch (error) {
      handleError(error);
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


  console.log("Grouped Deadlines by Date:", groupedByDate.value);
  

  return {
    deadlines,
    fetchDeadlines,
    groupedByDate,
  };
});
