import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_ATTENDANCE,
  PAYROLL_ATTENDANCE_BULK,
  PAYROLL_ATTENDANCE_REPORT,
} from "@/api/Api";

export const useHrAttendanceStore = defineStore("hr-attendance", () => {
  const attendanceLogs = ref([]);
  const loading = ref(false);

  const getAttendanceLogs = async (params = {}) => {
    loading.value = true;
    console.log("Store: Fetching Attendance Logs with params:", params);
    try {
      const response = await apiClient.get(PAYROLL_ATTENDANCE, { params });
      console.log("Store: Attendance Logs Raw Response:", response.data);
      attendanceLogs.value = response.data.data;

      if (!attendanceLogs.value) {
        console.warn("Store: API returned null or undefined data field");
      } else {
        console.log(
          `Store: Successfully loaded ${attendanceLogs.value.length} logs`,
        );
      }

      return response.data;
    } catch (err) {
      console.error(
        "Store: Error fetching attendance logs:",
        err.response?.data || err.message,
      );
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createAttendanceLog = async (payload, currentFilters = {}) => {
    loading.value = true;
    console.log("Store: Creating log entry with payload:", payload);
    try {
      const response = await apiClient.post(PAYROLL_ATTENDANCE, payload);
      notyf.success(response.data.message || "Log entry created");
      console.log(
        "Store: Create success, re-fetching logs with filters:",
        currentFilters,
      );
      await getAttendanceLogs(currentFilters);
      return response.data;
    } catch (err) {
      console.error("Store: Create failed", err.response?.data || err.message);
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkUploadAttendance = async (formData, currentFilters = {}) => {
    loading.value = true;
    console.log("Store: Starting bulk upload");
    try {
      const response = await apiClient.post(PAYROLL_ATTENDANCE_BULK, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      notyf.success(response.data.message || "Bulk upload successful");
      console.log(
        "Store: Bulk upload success, re-fetching logs with filters:",
        currentFilters,
      );
      await getAttendanceLogs(currentFilters);
      return response.data;
    } catch (err) {
      console.error(
        "Store: Bulk upload failed",
        err.response?.data || err.message,
      );
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const generateMonthlyReport = async (payload) => {
    loading.value = true;
    console.log("Store: Generating report with payload:", payload);
    try {
      const response = await apiClient.post(PAYROLL_ATTENDANCE_REPORT, payload);
      console.log("Store: Report response:", response.data);
      return response.data;
    } catch (err) {
      console.error(
        "Store: Report error data:",
        err.response?.data || err.message,
      );
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAttendanceLog = async (id, payload, currentFilters = {}) => {
    loading.value = true;
    console.log(`Store: Updating log ${id} with payload:`, payload);
    try {
      const response = await apiClient.put(
        `${PAYROLL_ATTENDANCE}/${id}`,
        payload,
      );
      notyf.success(response.data.message || "Log entry updated");
      console.log(
        "Store: Update success, re-fetching logs with filters:",
        currentFilters,
      );
      await getAttendanceLogs(currentFilters);
      return response.data;
    } catch (err) {
      console.error("Store: Update failed", err.response?.data || err.message);
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  console.log("Attendance Store Initialized with actions:", {
    getAttendanceLogs,
    createAttendanceLog,
    updateAttendanceLog,
  });

  return {
    attendanceLogs,
    loading,
    getAttendanceLogs,
    createAttendanceLog,
    updateAttendanceLog,
    bulkUploadAttendance,
    generateMonthlyReport,
  };
});
