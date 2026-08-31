import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_INTERVIEWS,
  RECRUITMENT_INTERVIEW_BY_ID,
  RECRUITMENT_INTERVIEW_SCHEDULE,
  RECRUITMENT_INTERVIEW_SUBMIT_RESULT,
  RECRUITMENT_INTERVIEW_CANCEL,
} from '@/api/Api';

export const useInterviewsStore = defineStore('recruitment-interviews', () => {
  const interviews = ref([]);
  const loading = ref(false);

  const fetchInterviews = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_INTERVIEWS, { params });
      const list = res.data?.data ?? res.data ?? [];
      interviews.value = Array.isArray(list) ? list : [];
      return interviews.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const scheduleInterview = async (payload) => {
    try {
      const res = await apiClient.post(RECRUITMENT_INTERVIEWS, payload);
      notyf.success(res.data?.message || 'Interview scheduled successfully.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const rescheduleInterview = async (id, payload) => {
    try {
      const res = await apiClient.post(RECRUITMENT_INTERVIEW_SCHEDULE(id), payload);
      notyf.success(res.data?.message || 'Interview rescheduled.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const submitResult = async (id, payload) => {
    try {
      const res = await apiClient.post(RECRUITMENT_INTERVIEW_SUBMIT_RESULT(id), payload);
      notyf.success(res.data?.message || 'Interview result saved.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const cancelInterview = async (id) => {
    try {
      const res = await apiClient.post(RECRUITMENT_INTERVIEW_CANCEL(id));
      notyf.success(res.data?.message || 'Interview cancelled.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteInterview = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_INTERVIEW_BY_ID(id));
      notyf.success(res.data?.message || 'Interview deleted.');
      interviews.value = interviews.value.filter(i => i.id !== id);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    interviews,
    loading,
    fetchInterviews,
    scheduleInterview,
    rescheduleInterview,
    submitResult,
    cancelInterview,
    deleteInterview,
  };
});
