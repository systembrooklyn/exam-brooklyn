import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import {
  RECRUITMENT_HIRES,
  RECRUITMENT_HIRE_BY_ID,
} from '@/api/Api';

export const useHiresStore = defineStore('hires', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const hires      = ref([]);
  const currentHire = ref(null);
  const loading    = ref(false);
  const submitting = ref(false);
  const error      = ref(null);

  const statusMeta = {
    pending_onboarding: { label: 'Pending Onboarding', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    onboarded:          { label: 'Onboarded',           cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled:          { label: 'Cancelled',           cls: 'bg-red-50 text-red-700 border-red-200' },
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchHires(params = {}) {
    loading.value = true;
    error.value   = null;
    try {
      const { data } = await apiClient.get(RECRUITMENT_HIRES, { params });
      hires.value   = data?.data ?? data ?? [];
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to load hires.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHire(id) {
    loading.value = true;
    error.value   = null;
    try {
      const { data }  = await apiClient.get(RECRUITMENT_HIRE_BY_ID(id));
      currentHire.value = data?.data ?? data;
      return currentHire.value;
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to load hire.';
    } finally {
      loading.value = false;
    }
  }

  async function createHire(payload) {
    submitting.value = true;
    error.value      = null;
    try {
      const { data } = await apiClient.post(RECRUITMENT_HIRES, payload);
      const hire     = data?.data ?? data;
      hires.value.unshift(hire);
      return hire;
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to create hire.';
      throw e;
    } finally {
      submitting.value = false;
    }
  }

  async function updateHire(id, payload) {
    submitting.value = true;
    error.value      = null;
    try {
      const { data } = await apiClient.put(RECRUITMENT_HIRE_BY_ID(id), payload);
      const updated  = data?.data ?? data;
      const idx      = hires.value.findIndex(h => h.id === Number(id));
      if (idx !== -1) hires.value[idx] = { ...hires.value[idx], ...updated };
      if (currentHire.value?.id === Number(id)) {
        currentHire.value = { ...currentHire.value, ...updated };
      }
      return updated;
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to update hire.';
      throw e;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteHire(id) {
    try {
      await apiClient.delete(RECRUITMENT_HIRE_BY_ID(id));
      hires.value = hires.value.filter(h => h.id !== Number(id));
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to delete hire.';
      throw e;
    }
  }

  return {
    hires, currentHire, loading, submitting, error, statusMeta,
    fetchHires, fetchHire, createHire, updateHire, deleteHire,
  };
});
