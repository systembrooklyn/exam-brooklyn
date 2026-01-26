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

  const getAttendanceLogs = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get(PAYROLL_ATTENDANCE);
      attendanceLogs.value = response.data.data;
      console.log("Attendance Logs from API:", response.data.data);
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createAttendanceLog = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_ATTENDANCE, payload);
      notyf.success(response.data.message || "Log entry created");
      await getAttendanceLogs();
      return response.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkUploadAttendance = async (formData) => {
    loading.value = true;
    try {
      const response = await apiClient.post(PAYROLL_ATTENDANCE_BULK, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      notyf.success(response.data.message || "Bulk upload successful");
      await getAttendanceLogs();
      return response.data;
    } catch (err) {
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

  const updateAttendanceLog = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(
        `${PAYROLL_ATTENDANCE}/${id}`,
        payload,
      );
      notyf.success(response.data.message || "Log entry updated");
      await getAttendanceLogs();
      return response.data;
    } catch (err) {
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
