import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../../api/axiosInstance";
import { UPDATE_GROUP_START_TIME } from "../../api/Api";
import { handleError } from "../handleError";
import notyf from "../../components/global/notyf";

export const useGroupUpdateStore = defineStore("groupUpdateStore", () => {
  const loading = ref(false);
  const loadingGroupId = ref(null);
  const error = ref(null);

  const updateGroupStartTime = async (id, payload) => {
    loading.value = true;
    loadingGroupId.value = payload.group_id;
    error.value = null;

    try {
      const response = await apiClient.put(UPDATE_GROUP_START_TIME(id), payload);
      notyf.success("Group start time updated successfully");
      return response.data.data;
    } catch (err) {
      handleError(err);
      error.value =
        err.response?.data?.message ||
        "An error occurred while updating the group.";
      throw err;
    } finally {
      loading.value = false;
      loadingGroupId.value = null;
    }
  };

  return {
    loading,
    loadingGroupId,
    error,
    updateGroupStartTime,
  };
});
