import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { RESERVATIONS } from "../api/Api"; 
import notyf from "../components/global/notyf";
import { handleError } from "./handleError";

export const useReservationStore = defineStore("reservationStore", () => {
  const reservations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchReservations = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(RESERVATIONS);
      reservations.value = response.data.data;
 
      
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addReservation = async (reservation) => {
    console.log(reservation);
    
    try {
      const response = await apiClient.post(RESERVATIONS, reservation);
    //   reservations.value.push(response.data.data);
      console.log(response.dada);
      
      notyf.success("Reservation added successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  const updateReservation = async (id, updatedData) => {
    try {
      const response = await apiClient.put(`${RESERVATIONS}/${id}`, updatedData);
      reservations.value = reservations.value.map((r) =>
        r.id === id ? response.data.data : r
      );
      notyf.success("Reservation updated successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
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

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationById,
  };
});
