import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_REQUESTS,
  PAYROLL_UPDATE_REQUEST,
  PAYROLL_REQUESTS_ME,
  PAYROLL_REQUESTS_PENDING,
  PAYROLL_REQUESTS_EMPLOYEES_WITH_REQUESTS,
  PAYROLL_APPROVE_REQUEST,
  PAYROLL_REJECT_REQUEST,
  PAYROLL_BULK_APPROVE_REQUESTS,
  PAYROLL_BULK_REJECT_REQUESTS,
  PAYROLL_APPROVED_VACATIONS,
} from "@/api/Api";
import { applyEmployeeRequestTimeFields } from "@/utils/normalizeApiTime";
import {
  buildEmployeeRequestApiPayload,
  mapEmployeeRequestRowFromApi,
} from "@/utils/employeeRequestApi";
import { defaultPayrollMonthRange, getPayrollDates } from "@/utils/payrollPeriod";

/** Query params for pending list and employees-with-requests (`status`, `from`, `to`, optional `employee_id`). */
function buildPendingRequestParams(query) {
  const params = {};
  const q = query && typeof query === "object" ? query : {};
  if (q.status != null && String(q.status).trim() !== "") {
    params.status = String(q.status).trim();
  }
  if (q.employee_id != null && q.employee_id !== "") {
    const n = Number(q.employee_id);
    if (Number.isFinite(n) && n > 0) params.employee_id = n;
  }
  if (q.from != null && String(q.from).trim() !== "") {
    params.from = String(q.from).trim().slice(0, 10);
  }
  if (q.to != null && String(q.to).trim() !== "") {
    params.to = String(q.to).trim().slice(0, 10);
  }
  return params;
}

/** Query params for `GET .../me` only (`status`, `from`, `to` — never `employee_id`). */
function buildMeRequestParams(query) {
  const p = buildPendingRequestParams(query);
  delete p.employee_id;
  return p;
}

/** Fallback `/me` params when `refreshCurrentList` runs before any filtered load (matches UI defaults). */
function defaultMeListParams() {
  const { payrollMonth } = defaultPayrollMonthRange();
  const { from_date, to_date } = getPayrollDates(payrollMonth);
  return buildMeRequestParams({
    from: from_date,
    to: to_date,
    status: "pending",
  });
}

export const useHrRequestsStore = defineStore("hr-requests", () => {
  const requests = ref([]);
  const loading = ref(false);
  const lastMeQuery = ref({});
  const lastPendingQuery = ref({});
  /** Rows from `GET .../employees-with-requests` (id, name, fingerprint, requests_count). */
  const employeesWithRequests = ref([]);
  /** Which list the UI last loaded: refresh after approve/reject must match it. */
  const listSource = ref("me");

  const setListSource = (source) => {
    listSource.value = source === "pending" ? "pending" : "me";
  };

  const refreshCurrentList = async () => {
    if (listSource.value === "pending") await getPendingRequests();
    else await getMyRequests();
  };

  /**
   * @param {object} [query] When provided, replaces cached `/me` filters (`status`, `from`, `to`).
   *   When omitted (e.g. after approve/reject), reuses the last query.
   */
  const getMyRequests = async (query) => {
    loading.value = true;
    try {
      let params;
      if (query !== undefined) {
        params = buildMeRequestParams(query);
        lastMeQuery.value = params;
      } else {
        params = { ...lastMeQuery.value };
        if (Object.keys(params).length === 0) {
          params = defaultMeListParams();
          lastMeQuery.value = params;
        }
      }
      const response = await apiClient.get(PAYROLL_REQUESTS_ME, {
        params,
      });
      employeesWithRequests.value = [];
      const rows = response.data?.data ?? response.data ?? [];
      const list = Array.isArray(rows) ? rows : [];
      requests.value = list.map(mapEmployeeRequestRowFromApi);
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  function normalizeEmployeesWithRequestsRows(body) {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    const inner = body.data?.data;
    if (Array.isArray(inner)) return inner;
    return [];
  }

  /**
   * Updates dropdown counts only (`status` / `from` / `to`; never `employee_id`).
   */
  const prefetchEmployeesWithRequests = async (query) => {
    const params = { ...buildPendingRequestParams(query) };
    delete params.employee_id;
    try {
      const response = await apiClient.get(PAYROLL_REQUESTS_EMPLOYEES_WITH_REQUESTS, {
        params,
      });
      employeesWithRequests.value = normalizeEmployeesWithRequestsRows(
        response.data,
      );
      return response.data;
    } catch (e) {
      console.warn("employees-with-requests:", e);
      employeesWithRequests.value = [];
    }
  };

  /**
   * @param {object} [query] When provided, replaces the cached pending filters and sends them as query params.
   *   When omitted (e.g. after approve/reject), reuses the last query: `status`, `employee_id`, `from`, `to`.
   */
  const getPendingRequests = async (query) => {
    loading.value = true;
    try {
      let params;
      if (query !== undefined) {
        params = buildPendingRequestParams(query);
        lastPendingQuery.value = params;
      } else {
        params = { ...lastPendingQuery.value };
      }
      const countsParams = { ...params };
      delete countsParams.employee_id;

      const countsPromise = apiClient
        .get(PAYROLL_REQUESTS_EMPLOYEES_WITH_REQUESTS, {
          params: countsParams,
        })
        .then((res) => normalizeEmployeesWithRequestsRows(res.data))
        .catch((e) => {
          console.warn("employees-with-requests:", e);
          return [];
        });

      if (!params.employee_id) {
        requests.value = [];
        employeesWithRequests.value = await countsPromise;
        return null;
      }

      const response = await apiClient.get(PAYROLL_REQUESTS_PENDING, {
        params,
      });
      const rows = response.data?.data ?? response.data ?? [];
      const list = Array.isArray(rows) ? rows : [];
      requests.value = list.map(mapEmployeeRequestRowFromApi);
      employeesWithRequests.value = await countsPromise;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRequest = async (payload) => {
    loading.value = true;
    try {
      const body = applyEmployeeRequestTimeFields(
        buildEmployeeRequestApiPayload(payload),
      );
      const response = await apiClient.post(PAYROLL_REQUESTS, body);
      notyf.success(response.data.message || "Request submitted");
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRequest = async (id, payload) => {
    loading.value = true;
    try {
      const body = applyEmployeeRequestTimeFields(
        buildEmployeeRequestApiPayload(payload),
      );
      const response = await apiClient.put(PAYROLL_UPDATE_REQUEST(id), body);
      notyf.success(response.data.message || "Request updated");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveRequest = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_APPROVE_REQUEST(id));
      notyf.success(response.data.message || "Request approved");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const rejectRequest = async (id, reason = null) => {
    loading.value = true;
    try {
      const payload = reason ? { note: reason } : {};
      const response = await apiClient.post(
        PAYROLL_REJECT_REQUEST(id),
        payload,
      );
      notyf.success(response.data.message || "Request rejected");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkApproveRequests = async (requestIds) => {
    const ids = Array.isArray(requestIds)
      ? requestIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [];
    if (!ids.length) return;
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_BULK_APPROVE_REQUESTS, {
        request_ids: ids,
      });
      notyf.success(response.data.message || "Requests approved");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRejectRequests = async (requestIds) => {
    const ids = Array.isArray(requestIds)
      ? requestIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [];
    if (!ids.length) return;
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_BULK_REJECT_REQUESTS, {
        request_ids: ids,
      });
      notyf.success(response.data.message || "Requests rejected");
      await refreshCurrentList();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Queue-based bulk approve: processes each ID individually via PUT /employee-requests.update/{id}.
   * Sends { status: 'approved' } for each request one by one.
   * Used for rows that are already 'approved' or 'rejected' (not pending).
   * @param {number[]} requestIds
   * @param {(progress: { done: number, failed: number, total: number }) => void} [onProgress]
   * @returns {{ done: number, failed: number, errors: Array }}
   */
  const queueBulkApproveRequests = async (requestIds, onProgress) => {
    const ids = Array.isArray(requestIds)
      ? requestIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [];
    if (!ids.length) return { done: 0, failed: 0, errors: [] };
    const total = ids.length;
    let done = 0;
    let failed = 0;
    const errors = [];
    for (const id of ids) {
      try {
        await apiClient.put(PAYROLL_UPDATE_REQUEST(id), { status: 'approved' });
        done++;
      } catch (err) {
        failed++;
        errors.push({ id, err });
        console.warn(`Queue approve failed for id=${id}:`, err);
      }
      if (typeof onProgress === "function") {
        onProgress({ done, failed, total });
      }
    }
    if (done > 0) {
      notyf.success(`${done} of ${total} request(s) approved.`);
    }
    if (failed > 0) {
      notyf.error(`${failed} request(s) failed to approve.`);
    }
    await refreshCurrentList();
    return { done, failed, errors };
  };

  /**
   * Queue-based bulk reject: processes each ID individually via PUT /employee-requests.update/{id}.
   * Sends { status: 'rejected' } for each request one by one.
   * Used for rows that are already 'approved' or 'rejected' (not pending).
   * @param {number[]} requestIds
   * @param {(progress: { done: number, failed: number, total: number }) => void} [onProgress]
   * @returns {{ done: number, failed: number, errors: Array }}
   */
  const queueBulkRejectRequests = async (requestIds, onProgress) => {
    const ids = Array.isArray(requestIds)
      ? requestIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [];
    if (!ids.length) return { done: 0, failed: 0, errors: [] };
    const total = ids.length;
    let done = 0;
    let failed = 0;
    const errors = [];
    for (const id of ids) {
      try {
        await apiClient.put(PAYROLL_UPDATE_REQUEST(id), { status: 'rejected' });
        done++;
      } catch (err) {
        failed++;
        errors.push({ id, err });
        console.warn(`Queue reject failed for id=${id}:`, err);
      }
      if (typeof onProgress === "function") {
        onProgress({ done, failed, total });
      }
    }
    if (done > 0) {
      notyf.success(`${done} of ${total} request(s) rejected.`);
    }
    if (failed > 0) {
      notyf.error(`${failed} request(s) failed to reject.`);
    }
    await refreshCurrentList();
    return { done, failed, errors };
  };


  const getApprovedVacations = async (employeeId) => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_APPROVED_VACATIONS, {
        params: { employee_id: employeeId },
      });
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    requests,
    loading,
    employeesWithRequests,
    listSource,
    setListSource,
    getMyRequests,
    getPendingRequests,
    prefetchEmployeesWithRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    bulkApproveRequests,
    bulkRejectRequests,
    queueBulkApproveRequests,
    queueBulkRejectRequests,
    getApprovedVacations,
  };
});
