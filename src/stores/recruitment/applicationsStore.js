import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_APPLICATIONS,
  RECRUITMENT_APPLICATION_BY_ID,
  RECRUITMENT_APPLICATION_ASSIGN_RECRUITER,
  RECRUITMENT_APPLICATION_MOVE_STAGE,
  RECRUITMENT_APPLICATION_REJECT,
  RECRUITMENT_APPLICATION_WITHDRAW,
  RECRUITMENT_APPLICATION_HIRE,
  RECRUITMENT_APPLICATION_ACTIVITY,
  RECRUITMENT_APPLICATION_INTERVIEWS,
  RECRUITMENT_APPLICATION_OFFER,
} from '@/api/Api';

export const useApplicationsStore = defineStore('recruitment-applications', () => {
  const applications = ref([]);
  const currentApplication = ref(null);
  const activityLog = ref([]);
  const interviews = ref([]);
  const offer = ref(null);
  const loading = ref(false);
  const submitting = ref(false);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchApplications = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_APPLICATIONS, { params });
      const list = res.data?.data ?? res.data ?? [];
      applications.value = Array.isArray(list) ? list : [];
      return applications.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Show ──────────────────────────────────────────────────────────────────
  const fetchApplication = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_APPLICATION_BY_ID(id));
      currentApplication.value = res.data?.data ?? res.data;
      return currentApplication.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const createApplication = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATIONS, payload);
      notyf.success(res.data?.message || 'Application registered successfully.');
      await fetchApplications();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const updateApplication = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(RECRUITMENT_APPLICATION_BY_ID(id), payload);
      notyf.success(res.data?.message || 'Application updated successfully.');
      await fetchApplications();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteApplication = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_APPLICATION_BY_ID(id));
      notyf.success(res.data?.message || 'Application deleted.');
      await fetchApplications();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Pipeline Actions ──────────────────────────────────────────────────────
  const assignRecruiter = async (id, recruiter_id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATION_ASSIGN_RECRUITER(id), { recruiter_id });
      notyf.success(res.data?.message || 'Recruiter assigned successfully.');
      if (currentApplication.value?.id === id) {
        await fetchApplication(id);
      }
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const moveStage = async (id, stage_id, skip_optional = false) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATION_MOVE_STAGE(id), { stage_id, skip_optional });
      notyf.success(res.data?.message || 'Application moved to next stage.');
      if (currentApplication.value?.id === id) {
        await fetchApplication(id);
      }
      await fetchApplications();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const rejectApplication = async (id, reason = '') => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATION_REJECT(id), { reason });
      notyf.success(res.data?.message || 'Application rejected.');
      if (currentApplication.value?.id === id) {
        await fetchApplication(id);
      }
      await fetchApplications();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const withdrawApplication = async (id, reason = '') => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATION_WITHDRAW(id), { reason });
      notyf.success(res.data?.message || 'Application withdrawn.');
      if (currentApplication.value?.id === id) {
        await fetchApplication(id);
      }
      await fetchApplications();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const hireCandidate = async (id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_APPLICATION_HIRE(id));
      notyf.success(res.data?.message || 'Candidate marked as hired.');
      if (currentApplication.value?.id === id) {
        await fetchApplication(id);
      }
      await fetchApplications();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Child Lists (Activity, Interviews, Offers) ───────────────────────────
  const fetchActivityLog = async (id) => {
    try {
      const res = await apiClient.get(RECRUITMENT_APPLICATION_ACTIVITY(id));
      activityLog.value = res.data?.data ?? res.data ?? [];
      return activityLog.value;
    } catch (err) {
      handleError(err);
    }
  };

  const fetchInterviews = async (id) => {
    try {
      const res = await apiClient.get(RECRUITMENT_APPLICATION_INTERVIEWS(id));
      interviews.value = res.data?.data ?? res.data ?? [];
      return interviews.value;
    } catch (err) {
      handleError(err);
    }
  };

  const fetchOffer = async (id) => {
    try {
      const res = await apiClient.get(RECRUITMENT_APPLICATION_OFFER(id));
      offer.value = res.data?.data ?? res.data;
      return offer.value;
    } catch (err) {
      // Don't show critical errors if offer is not created yet
      offer.value = null;
    }
  };

  // ── Status metadata ───────────────────────────────────────────────────────
  const STATUS_META = {
    active:   { label: 'Active',   cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
    withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    hired:    { label: 'Hired',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };
  const statusMeta = (status) => STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };

  return {
    applications,
    currentApplication,
    activityLog,
    interviews,
    offer,
    loading,
    submitting,
    fetchApplications,
    fetchApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    assignRecruiter,
    moveStage,
    rejectApplication,
    withdrawApplication,
    hireCandidate,
    fetchActivityLog,
    fetchInterviews,
    fetchOffer,
    statusMeta,
  };
});
