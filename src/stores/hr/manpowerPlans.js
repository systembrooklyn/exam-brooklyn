import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { MANPOWER_PLANS, MANPOWER_PLAN_BY_ID } from "@/api/Api";

/**
 * Manpower Plans store.
 *
 * API shape (GET manpower/manpower-plans) — position is a nested object:
 * {
 *   id,
 *   position: { id, name },
 *   branch: { id, name },
 *   ideal_count, current_count,
 *   vacancy,   ← computed by backend (ideal_count - current_count, min 0)
 *   notes
 * }
 *
 * NOTE: there is NO top-level position_id field; use plan.position.id instead.
 */
export const useManpowerPlansStore = defineStore("manpower-plans", () => {
  const plans = ref([]);
  const loading = ref(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  /** Extract position id from a plan regardless of API shape. */
  const positionIdOf = (plan) =>
    plan?.position?.id ?? plan?.position_id ?? null;

  /** Vacancy: prefer the backend-computed field, fallback to local calc. */
  const vacancyOf = (plan) =>
    plan?.vacancy ?? Math.max(0, (plan?.ideal_count ?? 0) - (plan?.current_count ?? 0));

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const getPlans = async (params = {}) => {
    loading.value = true;
    try {
      const response = await apiClient.get(MANPOWER_PLANS, { params });
      const list = response.data?.data ?? response.data ?? [];
      plans.value = Array.isArray(list) ? list : [];
      return plans.value;
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to load manpower plans.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPlan = async (payload) => {
    loading.value = true;
    try {
      const response = await apiClient.post(MANPOWER_PLANS, payload);
      notyf.success(response.data?.message || "Plan created successfully.");
      await getPlans();
      return response.data;
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to create plan.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePlan = async (id, payload) => {
    loading.value = true;
    try {
      const response = await apiClient.put(MANPOWER_PLAN_BY_ID(id), payload);
      notyf.success(response.data?.message || "Plan updated successfully.");
      await getPlans();
      return response.data;
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to update plan.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePlan = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.delete(MANPOWER_PLAN_BY_ID(id));
      notyf.success(response.data?.message || "Plan deleted successfully.");
      await getPlans();
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to delete plan.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const recalcAll = async () => {
    loading.value = true;
    try {
      const response = await apiClient.post("manpower/manpower-plans/recalc-all");
      notyf.success(response.data?.message || "All plans recalculated successfully.");
      await getPlans();
      return response.data;
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to recalculate plans.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const recalcPlan = async (id) => {
    loading.value = true;
    try {
      const response = await apiClient.post(`manpower/manpower-plans/${id}/recalc`);
      notyf.success(response.data?.message || "Plan recalculated successfully.");
      await getPlans();
      return response.data;
    } catch (err) {
      notyf.error(err?.response?.data?.message || "Failed to recalculate plan.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    plans,
    loading,
    positionIdOf,
    vacancyOf,
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    recalcAll,
    recalcPlan,
  };
});
