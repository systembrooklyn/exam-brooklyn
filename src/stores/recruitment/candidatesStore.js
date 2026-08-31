import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_CANDIDATES,
  RECRUITMENT_CANDIDATE_BY_ID,
} from '@/api/Api';

export const useCandidatesStore = defineStore('recruitment-candidates', () => {
  const candidates = ref([]);
  const currentCandidate = ref(null);
  const loading = ref(false);
  const submitting = ref(false);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchCandidates = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_CANDIDATES, { params });
      const list = res.data?.data ?? res.data ?? [];
      candidates.value = Array.isArray(list) ? list : [];
      return candidates.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Show ──────────────────────────────────────────────────────────────────
  const fetchCandidate = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_CANDIDATE_BY_ID(id));
      currentCandidate.value = res.data?.data ?? res.data;
      return currentCandidate.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Create (Multipart Form Data) ──────────────────────────────────────────
  const createCandidate = async (formData) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_CANDIDATES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      notyf.success(res.data?.message || 'Candidate profile created successfully.');
      await fetchCandidates();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Update (Multipart Form Data or JSON) ──────────────────────────────────
  const updateCandidate = async (id, payload) => {
    submitting.value = true;
    try {
      // If we are passing files, it should be FormData.
      // Laravel PUT requests with file upload sometimes need a POST override: payload.append('_method', 'PUT')
      const isFormData = payload instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
      
      let res;
      if (isFormData) {
        // Use POST with _method=PUT bypass for PHP/Laravel multipart support
        payload.append('_method', 'PUT');
        res = await apiClient.post(RECRUITMENT_CANDIDATE_BY_ID(id), payload, { headers });
      } else {
        res = await apiClient.put(RECRUITMENT_CANDIDATE_BY_ID(id), payload, { headers });
      }
      
      notyf.success(res.data?.message || 'Candidate profile updated successfully.');
      await fetchCandidates();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteCandidate = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_CANDIDATE_BY_ID(id));
      notyf.success(res.data?.message || 'Candidate profile deleted.');
      await fetchCandidates();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Status metadata ───────────────────────────────────────────────────────
  const STATUS_META = {
    active:      { label: 'Active',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    blacklisted: { label: 'Blacklisted', cls: 'bg-red-50 text-red-600 border-red-200' },
    archived:    { label: 'Archived',    cls: 'bg-gray-150 text-gray-600 border-gray-300' },
  };
  const statusMeta = (status) => STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };

  return {
    candidates,
    currentCandidate,
    loading,
    submitting,
    fetchCandidates,
    fetchCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    statusMeta,
  };
});
