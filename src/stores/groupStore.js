// 📁 src/stores/groupStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { GROUP_BY_CODE } from "../api/Api";
import { handleError } from "./handleError";

export const useGroupStore = defineStore("groupStore", () => {
  const group = ref(null); // Single group object
  const loading = ref(false);
  const error = ref(null);

  // ✅ Get groups by code
  const fetchGroupsByCode = async (code) => {
    loading.value = true;
    error.value = null;
  console.log(`Fetching groups by code: ${code}`);
    try {
      const response = await apiClient.get(`${GROUP_BY_CODE}/${code}`);
      group.value = response.data.data; // Store the single group object
      console.log('Groups fetched successfully:', response.data.data);
    } catch (err) {
      handleError(err);
      console.error(err);
      group.value = null;
    } finally {
      loading.value = false;
    }
  };

  return {
    group,
    loading,
    error,
    fetchGroupsByCode,
  };
});

