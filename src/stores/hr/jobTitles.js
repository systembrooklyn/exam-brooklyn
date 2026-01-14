import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_JOB_TITLES } from "@/api/Api";

export const useHrJobTitlesStore = defineStore("hr-job-titles", () => {
  const jobTitles = ref([]);
  const loading = ref(false);

  const getJobTitles = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_JOB_TITLES);
      jobTitles.value = response.data.data;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getJobTitle = async (id) => {
    try {
      const response = await apiClient.get(`${PAYROLL_JOB_TITLES}/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createJobTitle = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_JOB_TITLES, payload);
      notyf.success(response.data.message || "Job Title created successfully");
      await getJobTitles();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateJobTitle = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_JOB_TITLES}/${id}`,
        payload
      );
      notyf.success(response.data.message || "Job Title updated successfully");
      await getJobTitles();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteJobTitle = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_JOB_TITLES}/${id}`);
      notyf.success(response.data.message || "Job Title deleted successfully");
      await getJobTitles();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    jobTitles,
    loading,
    getJobTitles,
    getJobTitle,
    createJobTitle,
    updateJobTitle,
    deleteJobTitle,
  };
});
