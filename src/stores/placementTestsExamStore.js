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

        exam.value = response.data;
      } catch (e) {
        console.error("Error fetching placement exam:", e);
        error.value = e;
        handleError(e);
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
      } catch (error) {
        console.error("Error submitting final exam:", error);
        throw error;
      }
    }

    const getStudentPlacement = async () => {
      const st_id = Number(Cookies.get("st_id"));
  

      try {
        const response = await apiClient.post(`${PLACEMENT_TESTS}/student`, {
          st_id,
        }); 
        studentPlacement.value = response.data.data; 
     
      } catch (error) {
        console.error("Error fetching student placement:", error);
        handleError(error);
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
      fetchPlacementExam,
      getStudentPlacement,
      saveSurveyAnswers,
      submitFinalExam,
      autoSaveAnswers,
      isFinished,
    };
  }
);
