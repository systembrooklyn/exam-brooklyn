import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { RESERVATIONS, BRANCHES } from "../api/Api";
import notyf from "../components/global/notyf";
import { handleError } from "./handleError";

export const useReservationStore = defineStore("reservationStore", () => {
  const reservations = ref([]);
  const branches = ref([]);
  const loading = ref(false);
  const loadingBranches = ref(false);
  const error = ref(null);

  const fetchBranches = async () => {
    loadingBranches.value = true;
    try {
      const response = await apiClient.get(BRANCHES);
      branches.value = response.data.data;
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loadingBranches.value = false;
    }
  };

  const fetchReservations = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(RESERVATIONS, { params });
      reservations.value = response.data.data;
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addReservation = async (reservation) => {
    try {
      const response = await apiClient.post(RESERVATIONS, reservation);
      //   reservations.value.push(response.data.data);

      notyf.success("Reservation added successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
      throw err;
    }
  };

  const updateReservation = async (id, updatedData) => {
    try {
      const response = await apiClient.put(
        `${RESERVATIONS}/${id}`,
        updatedData,
      );
      reservations.value = reservations.value.map((r) =>
        r.id === id ? response.data.data : r,
      );
      notyf.success("Reservation updated successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
      throw err;
    }
  };

  const deleteReservation = async (id) => {
    try {
      await apiClient.delete(`${RESERVATIONS}/${id}`);
      reservations.value = reservations.value.filter((r) => r.id !== id);
      notyf.success("Reservation deleted successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  const getReservationById = async (id) => {
    error.value = null;
    try {
      const response = await apiClient.get(`${RESERVATIONS}/${id}`);
      return response.data.data;
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || "An error occurred";
        error.value = errorMessage;
        notyf.error(errorMessage);
      } else {
        error.value = "Failed to fetch reservation";
        notyf.error(error.value);
      }
      console.error(err);
    }
  };
  
  const calculateDeadlines = async (scholarshipId, priceSettingIds) => {
    try {
      const response = await apiClient.post("reservations/calculateDeadlines", {
        scholarship_id: scholarshipId,
        price_setting_ids: priceSettingIds,
      });
      return response.data.data;
    } catch (err) {
      handleError(err);
      console.error("Failed to calculate deadlines:", err);
      throw err;
    }
  };

  return {
    reservations,
    branches,
    loading,
    loadingBranches,
    error,
    fetchReservations,
    fetchBranches,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationById,
    calculateDeadlines,
  };
});
