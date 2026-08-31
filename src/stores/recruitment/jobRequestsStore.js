import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_JOB_REQUESTS,
  RECRUITMENT_JOB_REQUEST_BY_ID,
  RECRUITMENT_JOB_REQUEST_SUBMIT,
  RECRUITMENT_JOB_REQUEST_APPROVE,
  RECRUITMENT_JOB_REQUEST_REJECT,
  RECRUITMENT_JOB_REQUEST_REOPEN,
} from '@/api/Api';

export const useJobRequestsStore = defineStore('recruitment-job-requests', () => {
  const requests    = ref([]);
  const currentRequest = ref(null);
  const loading     = ref(false);
  const submitting  = ref(false);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchRequests = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_JOB_REQUESTS, { params });
      const list = res.data?.data ?? res.data ?? [];
      requests.value = Array.isArray(list) ? list : [];
      return requests.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Show ──────────────────────────────────────────────────────────────────
  const fetchRequest = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_JOB_REQUEST_BY_ID(id));
      currentRequest.value = res.data?.data ?? res.data;
      return currentRequest.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const createRequest = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_REQUESTS, payload);
      notyf.success(res.data?.message || 'Job request created successfully.');
      await fetchRequests();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Update (draft only) ───────────────────────────────────────────────────
  const updateRequest = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(RECRUITMENT_JOB_REQUEST_BY_ID(id), payload);
      notyf.success(res.data?.message || 'Job request updated successfully.');
      await fetchRequests();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteRequest = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_JOB_REQUEST_BY_ID(id));
      notyf.success(res.data?.message || 'Job request deleted.');
      await fetchRequests();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Workflow Actions ──────────────────────────────────────────────────────
  const submitRequest = async (id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_REQUEST_SUBMIT(id));
      notyf.success(res.data?.message || 'Request submitted for approval.');
      await fetchRequests();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const approveRequest = async (id, approval_notes = '') => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_REQUEST_APPROVE(id), { approval_notes });
      notyf.success(res.data?.message || 'Request approved.');
      await fetchRequests();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const rejectRequest = async (id, reason) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_REQUEST_REJECT(id), { reason });
      notyf.success(res.data?.message || 'Request rejected.');
      await fetchRequests();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  const reopenRequest = async (id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_REQUEST_REOPEN(id));
      notyf.success(res.data?.message || 'Request reopened as draft.');
      await fetchRequests();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Status helpers ────────────────────────────────────────────────────────
  const STATUS_META = {
    draft:    { label: 'Draft',    cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const statusMeta = (status) => STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };

  const PRIORITY_META = {
    low:    { label: 'Low',    cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    high:   { label: 'High',   cls: 'bg-orange-50 text-orange-600 border-orange-200' },
    urgent: { label: 'Urgent', cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const priorityMeta = (priority) => PRIORITY_META[priority] ?? { label: priority, cls: 'bg-gray-100 text-gray-500 border-gray-200' };

  return {
    requests,
    currentRequest,
    loading,
    submitting,
    fetchRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    submitRequest,
    approveRequest,
    rejectRequest,
    reopenRequest,
    statusMeta,
    priorityMeta,
  };
});
