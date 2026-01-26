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

export const usePlacementTestsExamStore = defineStore(
  "placementTestsExam",
  () => {
    const loading = ref(false);
    const error = ref(null);
    const exam = ref(null);
    const isFinished = ref(false);
    let autoSaveInterval = null;
    const studentPlacement = ref(null);

    const examAnswers = ref([]);
    async function fetchPlacementExam(testId) {
      const studentId = Cookies.get("st_id");
      loading.value = true;
      error.value = null;
      try {
        const response = await apiClient.post(START_PLACEMENT, {
          pt_id: testId,
          st_id: studentId,
        });
        examAnswers.value = response.data.data.answers || [];
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
      if (!attemptId || isFinished.value) return;

      const formattedAnswers = answers.map((ans) => ({
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

    function startAutoSave(answersRef) {
      if (autoSaveInterval) clearInterval(autoSaveInterval); 
      autoSaveInterval = setInterval(() => {
        sessionStorage.setItem("answers", JSON.stringify(answersRef.value));
        autoSaveAnswers(answersRef.value);
      }, 2 * 60 * 1000); 
    }

    // placementTestsExamStore.js
    async function submitFinalExam(answers) {
      const attemptId = Cookies.get("attempt_id");
      const formattedAnswers = answers.map((ans) => ({
        q_id: ans.q_id,
        selected_option: ans.selected_option?.toUpperCase(),
      }));

      try {
        await autoSaveAnswers(answers);
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
        clearInterval(autoSaveInterval);
      } catch (error) {
        console.error("Error submitting final exam:", error);
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
      startAutoSave,
      isFinished,
    };
  }
);
