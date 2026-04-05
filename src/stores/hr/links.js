import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import { PAYROLL_LINKING } from "@/api/Api";

export const useHrLinksStore = defineStore("hr-links", () => {
  const links = ref([]);
  const loading = ref(false);
  /** True after at least one successful payroll-links fetch (avoids refetching on every edit open). */
  const linksHydrated = ref(false);

  const normalizeIdList = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
    }
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? [id] : [];
  };

  const buildAssignmentsPayload = (payload = {}, { includeEmployeeId = true } = {}) => {
    const departmentIds = normalizeIdList(payload.department_id);
    const jobTitleIds = normalizeIdList(payload.job_title_id);

    const normalizedPayload = {
      ...payload,
      department_id: departmentIds,
      job_title_id: jobTitleIds,
    };

    if (
      includeEmployeeId &&
      payload.employee_id !== undefined &&
      payload.employee_id !== null
    ) {
      normalizedPayload.employee_id = Number(payload.employee_id);
    } else {
      delete normalizedPayload.employee_id;
    }

    return normalizedPayload;
  };

  const getEmployeeJobDeps = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_LINKING);
      links.value = response.data.data;
      linksHydrated.value = true;
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const linkEmployeeJobDep = async (
    payload,
    { showNotification = true, refresh = true } = {}
  ) => {
    loading.value = true;
    try {
      const response = await apiClient.post(
        PAYROLL_LINKING,
        buildAssignmentsPayload(payload),
      );
      if (showNotification) {
        notyf.success(response.data.message || "Linked successfully");
      }
      if (refresh) {
        await getEmployeeJobDeps();
      }
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployeeJobDep = async (employeeId, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_LINKING}/${employeeId}`,
        buildAssignmentsPayload(payload, { includeEmployeeId: false }),
      );
      notyf.success(response.data.message || "Assignments updated successfully");
      await getEmployeeJobDeps();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmployeeJobDep = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(`${PAYROLL_LINKING}/${id}`);
      notyf.success(response.data.message || "Link deleted successfully");
      await getEmployeeJobDeps();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    links,
    loading,
    linksHydrated,
    getEmployeeJobDeps,
    linkEmployeeJobDep,
    updateEmployeeJobDep,
    deleteEmployeeJobDep,
  };
});
