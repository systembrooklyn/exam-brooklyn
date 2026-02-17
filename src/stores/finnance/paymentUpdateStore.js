import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../../api/axiosInstance";
import { UPDATE_PAYMENT } from "../../api/Api";
import { handleError } from "../handleError";
import notyf from "../../components/global/notyf";

export const usePaymentUpdateStore = defineStore("paymentUpdateStore", () => {
  const loading = ref(false);
  const loadingPaymentId = ref(null);
  const error = ref(null);

  const updatePayment = async (id, payload) => {
    loading.value = true;
    loadingPaymentId.value = payload.payment_id;
    error.value = null;

    try {
      const response = await apiClient.put(UPDATE_PAYMENT(id), payload);
      notyf.success("Payment updated successfully");
      return response.data.data;
    } catch (err) {
      handleError(err);
      error.value =
        err.response?.data?.message ||
        "An error occurred while updating the payment.";
      throw err;
    } finally {
      loading.value = false;
      loadingPaymentId.value = null;
    }
  };

  return {
    loading,
    loadingPaymentId,
    error,
    updatePayment,
  };
});
