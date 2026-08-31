import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import { handleError } from '@/stores/handleError';
import { RECRUITMENT_REPORTS_BASE } from '@/api/Api';

export const useRecruitmentReportsStore = defineStore('recruitment-reports', () => {
  const reportData = ref([]);
  const loading = ref(false);

  const fetchReport = async (reportType, params = {}) => {
    loading.value = true;
    reportData.value = [];
    try {
      const endpoint = `${RECRUITMENT_REPORTS_BASE}/${reportType}`;
      const res = await apiClient.get(endpoint, { params });
      // The API might return { data: [...] } or just [...]
      const result = res.data?.data ?? res.data ?? [];
      reportData.value = Array.isArray(result) ? result : [];
      return reportData.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    reportData,
    loading,
    fetchReport,
  };
});
