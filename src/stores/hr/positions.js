import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { MANPOWER_POSITIONS, MANPOWER_POSITION_BY_ID } from "@/api/Api";

export const useHrPositionsStore = defineStore("hr-positions", () => {
  const positions = ref([]);
  const loading = ref(false);

  const getPositions = async (department_id = null) => {
    loading.value = true;
    try {
      const params = {};
      if (department_id) params.department_id = department_id;
      const response = await apiClient.get(MANPOWER_POSITIONS, { params });
      positions.value = response.data.data;
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPosition = async (id) => {
    try {
      const response = await apiClient.get(MANPOWER_POSITION_BY_ID(id));
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createPosition = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(MANPOWER_POSITIONS, payload);
      notyf.success(response.data.message || "Position created successfully");
      await getPositions();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePosition = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(MANPOWER_POSITION_BY_ID(id), payload);
      notyf.success(response.data.message || "Position updated successfully");
      await getPositions();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePosition = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(MANPOWER_POSITION_BY_ID(id));
      notyf.success(response.data.message || "Position deleted successfully");
      await getPositions();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    positions,
    loading,
    getPositions,
    getPosition,
    createPosition,
    updatePosition,
    deletePosition,
  };
});
