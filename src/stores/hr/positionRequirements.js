import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import {
  MANPOWER_POSITION_REQUIREMENTS,
  MANPOWER_POSITION_REQUIREMENTS_BY_ID,
} from "@/api/Api";

export const useHrPositionRequirementsStore = defineStore("hr-position-requirements", () => {
  const requirements = ref([]);
  const currentRequirement = ref(null);
  const loading = ref(false);

  const getRequirements = async (positionId = null) => {
    loading.value = true;
    try {
      const url = positionId 
        ? `${MANPOWER_POSITION_REQUIREMENTS}?position_id=${positionId}`
        : MANPOWER_POSITION_REQUIREMENTS;
      const response = await apiClient.get(url);
      requirements.value = response.data.data || [];
      return response.data;
    } catch (error) {
      notyf.error(error.response?.data?.message || "Failed to load requirements.");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getSingleRequirement = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.get(MANPOWER_POSITION_REQUIREMENTS_BY_ID(id));
      currentRequirement.value = response.data.data;
      return response.data;
    } catch (error) {
      notyf.error(error.response?.data?.message || "Failed to load requirement.");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createRequirement = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(MANPOWER_POSITION_REQUIREMENTS, payload);
      notyf.success(response.data.message || "Requirement created successfully");
      return response.data;
    } catch (error) {
      notyf.error(error.response?.data?.message || "Failed to create requirement.");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateRequirement = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(MANPOWER_POSITION_REQUIREMENTS_BY_ID(id), payload);
      notyf.success(response.data.message || "Requirement updated successfully");
      return response.data;
    } catch (error) {
      notyf.error(error.response?.data?.message || "Failed to update requirement.");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteRequirement = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(MANPOWER_POSITION_REQUIREMENTS_BY_ID(id));
      notyf.success(response.data.message || "Requirement deleted successfully");
      return response.data;
    } catch (error) {
      notyf.error(error.response?.data?.message || "Failed to delete requirement.");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    requirements,
    currentRequirement,
    loading,
    getRequirements,
    getSingleRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement,
  };
});
