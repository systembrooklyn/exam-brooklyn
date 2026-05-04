import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { ALL_SCHOLARSHIPS, SCHOLARSHIPS_PLANS } from "../api/Api";
import notyf from "../components/global/notyf";
import { handleError } from "./handleError";

export const useScholarshipStore = defineStore("scholarshipStore", () => {
  const scholarships = ref([]);
  /** Dashboard list: GET/POST/PUT/DELETE `scholarshipsPlans` */
  const scholarshipPlans = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchScholarships = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(ALL_SCHOLARSHIPS);
      scholarships.value = response.data.data;
      (response.data.data);
      
    }  catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addScholarship = async (scholarship) => {
    // loading.value = true;
    (scholarship);
    
    try {
      const response = await apiClient.post(ALL_SCHOLARSHIPS, scholarship);
      scholarships.value.push(response.data.data);
      notyf.success("Scholarship added successfully");
    }  catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      // loading.value = false;
    }
  };

  const updateScholarship = async (id, updatedData) => {
    // loading.value = true;
    try {
      const response = await apiClient.put(`${ALL_SCHOLARSHIPS}/${id}`, updatedData);
      scholarships.value = scholarships.value.map((s) =>
        s.id === id ? response.data.data : s
      );
      notyf.success("Scholarship updated successfully");
    }  catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      // loading.value = false;
    }
  };

  const deleteScholarship = async (id) => {
    try {
      await apiClient.delete(`${ALL_SCHOLARSHIPS}/${id}`);
      scholarships.value = scholarships.value.filter((s) => s.id !== id);
      scholarshipPlans.value = scholarshipPlans.value.filter((s) => s.id !== id);
      notyf.success("Scholarship deleted successfully");
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  const getScholarshipById = async (id) => {
    error.value = null;
    try {
      const response = await apiClient.get(`${ALL_SCHOLARSHIPS}/${id}`);
      return response.data.data;
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || "An error occurred";
        error.value = errorMessage;
        notyf.error(errorMessage);
      } else {
        error.value = "Failed to load scholarship";
        notyf.error(error.value);
      }
      console.error(err);
    }
  };

  /** Full plan payload for dashboard detail + edit (GET /scholarshipsPlans/{id}) */
  const fetchScholarshipPlanById = async (id) => {
    error.value = null;
    try {
      const response = await apiClient.get(`${SCHOLARSHIPS_PLANS}/${id}`);
      return response.data.data ?? response.data;
    } catch (err) {
      handleError(err);
      console.error(err);
      return null;
    }
  };

  /** Parses GET /scholarshipsPlans index: { data: { scholarships: [...] } } or plain array */
  function normalizeScholarshipPlansList(response) {
    const root = response?.data?.data ?? response?.data;
    if (Array.isArray(root)) return root;
    if (root && Array.isArray(root.scholarships)) return root.scholarships;
    if (Array.isArray(response?.data?.scholarships)) {
      return response.data.scholarships;
    }
    return [];
  }

  const fetchScholarshipPlans = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(SCHOLARSHIPS_PLANS);
      scholarshipPlans.value = normalizeScholarshipPlansList(response);
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createScholarshipPlan = async (payload) => {
    try {
      const response = await apiClient.post(SCHOLARSHIPS_PLANS, payload);
      const row = response.data.data ?? response.data;
      if (row) scholarshipPlans.value.push(row);
      notyf.success("Scholarship plan created successfully");
      return row;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateScholarshipPlan = async (id, payload) => {
    try {
      const response = await apiClient.put(
        `${SCHOLARSHIPS_PLANS}/${id}`,
        payload
      );
      const row = response.data.data ?? response.data;
      if (row) {
        scholarshipPlans.value = scholarshipPlans.value.map((s) =>
          s.id === id ? row : s
        );
      }
      notyf.success("Scholarship plan updated successfully");
      return row;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return {
    scholarships,
    scholarshipPlans,
    loading,
    error,
    fetchScholarships,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    getScholarshipById,
    fetchScholarshipPlanById,
    fetchScholarshipPlans,
    createScholarshipPlan,
    updateScholarshipPlan,
  };
});
