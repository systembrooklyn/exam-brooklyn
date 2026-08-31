import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_INTERVIEW_STAGES,
  RECRUITMENT_INTERVIEW_STAGE_BY_ID,
} from '@/api/Api';

export const useInterviewStagesStore = defineStore('recruitment-interview-stages', () => {
  const stages = ref([]);
  const loading = ref(false);
  const submitting = ref(false);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchStages = async () => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_INTERVIEW_STAGES);
      const list = res.data?.data ?? res.data ?? [];
      // Sort by sort_order
      stages.value = Array.isArray(list) ? list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) : [];
      return stages.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const createStage = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_INTERVIEW_STAGES, payload);
      notyf.success(res.data?.message || 'Interview stage created.');
      await fetchStages();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const updateStage = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(RECRUITMENT_INTERVIEW_STAGE_BY_ID(id), payload);
      notyf.success(res.data?.message || 'Interview stage updated.');
      await fetchStages();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteStage = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_INTERVIEW_STAGE_BY_ID(id));
      notyf.success(res.data?.message || 'Interview stage deleted.');
      await fetchStages();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stages,
    loading,
    submitting,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
  };
});
