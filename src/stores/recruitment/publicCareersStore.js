import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  PUBLIC_JOBS,
  PUBLIC_JOB_BY_SLUG,
  PUBLIC_JOB_APPLY,
} from '@/api/Api';

export const usePublicCareersStore = defineStore('public-careers', () => {
  const jobs = ref([]);
  const currentJob = ref(null);
  const loading = ref(false);
  const submitting = ref(false);

  const fetchPublicJobs = async () => {
    loading.value = true;
    try {
      const res = await apiClient.get(PUBLIC_JOBS);
      // Public endpoints do not require auth token
      const list = res.data?.data ?? res.data ?? [];
      jobs.value = Array.isArray(list) ? list : [];
      return jobs.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPublicJobDetails = async (slug) => {
    loading.value = true;
    try {
      const res = await apiClient.get(PUBLIC_JOB_BY_SLUG(slug));
      currentJob.value = res.data?.data ?? res.data;
      return currentJob.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const submitPublicApplication = async (slug, formData) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(PUBLIC_JOB_APPLY(slug), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      notyf.success('Application submitted successfully! Our HR team will review it.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  return {
    jobs,
    currentJob,
    loading,
    submitting,
    fetchPublicJobs,
    fetchPublicJobDetails,
    submitPublicApplication,
  };
});
