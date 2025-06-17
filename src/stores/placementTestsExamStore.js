import { defineStore } from "pinia";
import apiClient from "../api/axiosInstance";
import { handleError } from "./handleError";
import { ref } from "vue";
import { START_PLACEMENT, FINISH_PLACEMENT } from "../api/Api";
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

    const examAnswers = ref([]);
    async function fetchPlacementExam(testId, studentId) {
      loading.value = true;
      error.value = null;
      try {
        const response = await apiClient.post(START_PLACEMENT, {
          pt_id: testId,
          st_id: studentId,
        });
        console.log(response.data);
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
      if (!attemptId || isFinished.value) return; // لا ترسل لو الامتحان انتهى

      const formattedAnswers = answers.map((ans) => ({
        q_id: ans.q_id,
        selected_option: ans.selected_option?.toUpperCase(),
      }));

      try {
        await apiClient.post(`${FINISH_PLACEMENT}/${attemptId}/saveAnswers`, {
          answers: formattedAnswers,
        });
        console.log("✅ Auto-saved answers");
      } catch (e) {
        console.error("❌ Auto-save failed:", e);
      }
    }

    function startAutoSave(answersRef) {
      if (autoSaveInterval) clearInterval(autoSaveInterval); // تأكد مفيش تكرار
      autoSaveInterval = setInterval(() => {
        sessionStorage.setItem("answers", JSON.stringify(answersRef.value));
        autoSaveAnswers(answersRef.value);
      }, 2 * 60 * 1000); // كل دقيقتين
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
        console.log("Final exam submitted successfully:", response.data);
        notyf.success(
          response.data.message || "Final exam submitted successfully!"
        );
        isFinished.value = true;
        clearInterval(autoSaveInterval);
      } catch (error) {
        console.error("Error submitting final exam:", error);
      }
    }

    return {
      loading,
      error,
      exam,
      examAnswers,
      fetchPlacementExam,
      submitFinalExam,
      autoSaveAnswers,
      startAutoSave,
      isFinished,
    };
  }
);
