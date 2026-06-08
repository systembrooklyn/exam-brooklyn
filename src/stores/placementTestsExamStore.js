import { defineStore } from "pinia";
import apiClient from "../api/axiosInstance";
import { handleError } from "./handleError";
import { ref } from "vue";
import {
  START_PLACEMENT,
  FINISH_PLACEMENT,
  PLACEMENT_TESTS_SURVEY,
  PLACEMENT_TESTS,
} from "../api/Api";
import Cookies from "js-cookie";
import notyf from "@/components/global/notyf";

/** API often returns `"A"`; radios use lowercase `a`–`d`. */
function normalizeOptionForUi(option) {
  if (option == null || option === "") return option;
  return String(option).trim().toLowerCase();
}

function allModulesStorageKey(stId) {
  return `placement_all_modules_${stId}`;
}

function confirmedCompletedStorageKey(stId) {
  return `placement_confirmed_completed_${stId}`;
}

function readJsonSession(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonSession(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function sameId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function normalizePendingModules(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tests)) return data.tests;
  if (Array.isArray(data?.modules)) return data.modules;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function mapModuleCard(m, status = "available") {
  return {
    id: m.id,
    name: m.name,
    status,
    disabled: status === "completed",
  };
}

/** Periodic autosave cadence — used by PlacementTestExam.vue (interval lives on the component). */
export const PLACEMENT_AUTOSAVE_INTERVAL_MS = 1 * 60 * 1000;

export const usePlacementTestsExamStore = defineStore(
  "placementTestsExam",
  () => {
    const loading = ref(false);
    const error = ref(null);
    const exam = ref(null);
    const isFinished = ref(false);
    const studentPlacement = ref(null);

    const examAnswers = ref([]);
    const examModules = ref([]);

    function cacheAllModulesIfNeeded(pendingModules) {
      const stId = Cookies.get("st_id");
      if (!stId || !Array.isArray(pendingModules)) return;

      const key = allModulesStorageKey(stId);
      let all = readJsonSession(key, []);

      pendingModules.forEach((m) => {
        if (!all.some((item) => sameId(item.id, m.id))) {
          all.push({ id: m.id, name: m.name });
        }
      });

      writeJsonSession(key, all);
    }

    function getConfirmedCompletedIds() {
      const stId = Cookies.get("st_id");
      if (!stId) return [];
      return readJsonSession(confirmedCompletedStorageKey(stId), []);
    }

    function markModuleConfirmedCompleted(ptId) {
      const stId = Cookies.get("st_id");
      if (!stId || ptId == null) return;

      const ids = getConfirmedCompletedIds();
      if (!ids.some((id) => sameId(id, ptId))) {
        ids.push(ptId);
        writeJsonSession(confirmedCompletedStorageKey(stId), ids);
      }
    }

    function clearActiveAttemptCookies() {
      Cookies.remove("attempt_id");
      Cookies.remove("placement_pt_id");
      sessionStorage.removeItem("answers");
      sessionStorage.removeItem("attemptId");
    }

    function getInProgressModuleId() {
      const attemptId = Cookies.get("attempt_id");
      const ptId = Cookies.get("placement_pt_id");
      if (!attemptId || !ptId) return null;
      return ptId;
    }

    function buildExamModules(pendingModules) {
      const stId = Cookies.get("st_id");
      if (!stId) return [];

      const pending = normalizePendingModules(pendingModules);
      cacheAllModulesIfNeeded(pending);

      const confirmedCompleted = getConfirmedCompletedIds();
      const inProgressId = getInProgressModuleId();
      let all = readJsonSession(allModulesStorageKey(stId), []);

      pending.forEach((m) => {
        if (!all.some((item) => sameId(item.id, m.id))) {
          all.push({ id: m.id, name: m.name });
        }
      });
      writeJsonSession(allModulesStorageKey(stId), all);

      if (all.length === 0 && pending.length > 0) {
        return pending.map((m) => mapModuleCard(m, "available"));
      }

      return all.map((m) => {
        const isConfirmedCompleted = confirmedCompleted.some((id) =>
          sameId(id, m.id)
        );
        const isPending = pending.some((p) => sameId(p.id, m.id));
        const isInProgress = sameId(inProgressId, m.id) && isPending;

        let status = "available";
        if (isConfirmedCompleted || (!isPending && !isInProgress)) {
          status = "completed";
        } else if (isInProgress) {
          status = "in_progress";
        }

        return {
          id: m.id,
          name: m.name,
          status,
          disabled: status === "completed",
        };
      });
    }

    async function fetchPlacementExam(testId) {
      const studentId = Cookies.get("st_id");
      loading.value = true;
      error.value = null;
      // New attempt starts: re-enable periodic autosave and submissions.
      isFinished.value = false;
      try {
        const response = await apiClient.post(START_PLACEMENT, {
          pt_id: testId,
          st_id: studentId,
        });
        const rawAnswers = response.data.data.answers || [];
        examAnswers.value = rawAnswers.map((ans) => ({
          ...ans,
          selected_option:
            ans?.selected_option == null || ans.selected_option === ""
              ? ans.selected_option
              : normalizeOptionForUi(ans.selected_option),
        }));
        Cookies.set("attempt_id", response.data.data.attempt_id, {
          expires: 7,
        });
        Cookies.set("placement_pt_id", String(testId), { expires: 7 });

        exam.value = response.data;
      } catch (e) {
        console.error("Error fetching placement exam:", e);
        error.value = e;
        handleError(e);
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function autoSaveAnswers(answers) {
      const attemptId = Cookies.get("attempt_id");
      const list = Array.isArray(answers) ? answers : [];
      const answeredOnly = list.filter(
        (ans) =>
          ans &&
          ans.q_id != null &&
          ans.selected_option != null &&
          ans.selected_option !== ""
      );
      if (!attemptId || isFinished.value || answeredOnly.length === 0) return;

      const formattedAnswers = answeredOnly.map((ans) => ({
        q_id: ans.q_id,
        selected_option: ans.selected_option?.toUpperCase(),
      }));

      try {
        await apiClient.post(`${FINISH_PLACEMENT}/${attemptId}/saveAnswers`, {
          answers: formattedAnswers,
        });
      } catch (e) {
        console.error("❌ Auto-save failed:", e);
      }
    }

    async function submitFinalExam(answers) {
      const attemptId = Cookies.get("attempt_id");
      const answeredOnly = (Array.isArray(answers) ? answers : []).filter(
        (ans) =>
          ans &&
          ans.q_id != null &&
          ans.selected_option != null &&
          ans.selected_option !== ""
      );
      const formattedAnswers = answeredOnly.map((ans) => ({
        q_id: ans.q_id,
        selected_option: ans.selected_option?.toUpperCase(),
      }));

      try {
        const response = await apiClient.post(
          `${FINISH_PLACEMENT}/${attemptId}/submit`,
          {
            answers: formattedAnswers,
          }
        );
        notyf.success(
          response.data.message || "Final exam submitted successfully!"
        );
        isFinished.value = true;
        const ptId = Cookies.get("placement_pt_id");
        markModuleConfirmedCompleted(ptId);
        clearActiveAttemptCookies();
      } catch (error) {
        console.error("Error submitting final exam:", error);
        throw error;
      }
    }

    const getStudentPlacement = async () => {
      const stIdRaw = Cookies.get("st_id");
      if (!stIdRaw) {
        studentPlacement.value = [];
        examModules.value = [];
        return { needsRegistration: true };
      }

      const st_id = Number(stIdRaw);
      if (!Number.isFinite(st_id)) {
        studentPlacement.value = [];
        examModules.value = [];
        return { needsRegistration: true };
      }

      try {
        const response = await apiClient.post(`${PLACEMENT_TESTS}/student`, {
          st_id,
        });
        const pending = normalizePendingModules(response.data?.data);
        studentPlacement.value = pending;
        examModules.value = buildExamModules(pending);
        return { needsRegistration: false, pending };
      } catch (error) {
        console.error("Error fetching student placement:", error);
        handleError(error);
        examModules.value = [];
        return { needsRegistration: false, error };
      }
    };

    const saveSurveyAnswers = async (answers) => {
      const st_id = Cookies.get("st_id");
      try {
        const response = await apiClient.post(PLACEMENT_TESTS_SURVEY, {
          st_id: st_id,
          answers: answers,
        });
      } catch (error) {
        console.error("Error saving survey answers:", error);
        handleError(error);
      }
    };

    return {
      loading,
      error,
      exam,
      examAnswers,
      studentPlacement,
      examModules,
      fetchPlacementExam,
      getStudentPlacement,
      saveSurveyAnswers,
      submitFinalExam,
      autoSaveAnswers,
      isFinished,
      clearActiveAttemptCookies,
      getInProgressModuleId,
    };
  }
);
