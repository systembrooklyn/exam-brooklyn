import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import {
  TICKETS_BASE,
  TICKETS_META,
  TICKET_BY_SERIAL,
  TICKET_COMMENTS,
  TICKET_STATUS,
  TICKET_EVALUATE,
} from "../api/Api";
import { handleError } from "./handleError";

export const useTicketsStore = defineStore("ticketsStore", () => {
  const openTickets = ref([]);
  const closedTickets = ref([]);
  const lastOpenFilters = ref(null);
  const lastClosedFilters = ref(null);
  const metaOptions = ref({ type: [], category: [] });
  const currentTicket = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all tickets with optional filters
  const fetchTickets = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(TICKETS_BASE, { params: filters });
      const data = response.data.data || response.data;
      if (filters.is_closed) {
        closedTickets.value = data;
        lastClosedFilters.value = JSON.stringify(filters);
      } else {
        openTickets.value = data;
        lastOpenFilters.value = JSON.stringify(filters);
      }
    } catch (err) {
      handleError(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch meta options (types, categories)
  const fetchMetaOptions = async () => {
    try {
      const response = await apiClient.get(TICKETS_META);
      metaOptions.value = response.data.data || response.data;
    } catch (err) {
      handleError(err);
    }
  };

  // Fetch single ticket by serial
  const fetchTicketBySerial = async (serial) => {
    loading.value = true;
    currentTicket.value = null;
    error.value = null;
    try {
      const response = await apiClient.get(TICKET_BY_SERIAL(serial));
      currentTicket.value = response.data.data || response.data;
    } catch (err) {
      handleError(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // Create new ticket (FormData for attachments)
  const createTicket = async (formData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(TICKETS_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      handleError(err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add comment to ticket
  const addComment = async (serial, formData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(TICKET_COMMENTS(serial), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Optionally re-fetch the ticket to get updated comments
      await fetchTicketBySerial(serial);
      return response.data;
    } catch (err) {
      handleError(err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Change ticket status
  const changeTicketStatus = async (serial, status) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.patch(TICKET_STATUS(serial), { status });
      if (currentTicket.value) {
        currentTicket.value.status = status;
        currentTicket.value.is_closed = (status === 'closed');
        currentTicket.value.latest_status = {
          status: status,
          action_at: new Date().toISOString()
        };
      }
      return response.data;
    } catch (err) {
      handleError(err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Evaluate ticket
  const evaluateTicket = async (serial, evaluate, evaluation_notes = null) => {
    loading.value = true;
    error.value = null;
    try {
      const payload = { evaluate };
      if (evaluation_notes !== null) {
        payload.evaluation_notes = evaluation_notes;
      }
      const response = await apiClient.post(TICKET_EVALUATE(serial), payload);
      return response.data;
    } catch (err) {
      handleError(err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    openTickets,
    closedTickets,
    lastOpenFilters,
    lastClosedFilters,
    metaOptions,
    currentTicket,
    loading,
    error,
    fetchTickets,
    fetchMetaOptions,
    fetchTicketBySerial,
    createTicket,
    addComment,
    changeTicketStatus,
    evaluateTicket,
  };
});
