import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "../api/axiosInstance";
import {
  INSTRUCTORS,
  START_EXAM,
  STUDENT_ID,
  FINISH_EXAM_API,
  SUBMIT_EXAM_ANSWERS,
  SEND_OTP_API,
} from "../api/Api";
import notyf from "@/components/global/notyf";
import { useRouter } from "vue-router";
import { handleError } from "./handleError";

export const useStudentStore = defineStore("studentStore", () => {
  const studentId = ref("");
  const courses = ref([]);
  const instructors = ref([]);
  const selectedModule = ref("");
  const selectedInstructor = ref("");
  const startExam = ref({ questions: [] });
  const examAnswers = ref([]);
  const otpMasg = ref("");
  const otpMessageColor = ref("#000000");
  const studentOTP = ref("");
  const timer = ref(120);
  const attemptId = ref(null);
  const errorMessages = ref("");
  const error = ref(null);
  const router = useRouter();

  // Loading Flags
  const loading = ref(false); // general form loading
  const loadingCourses = ref(false);
  const loadingInstructors = ref(false);
  const loadingOtp = ref(false);
  const otpSent = ref(false);

  let startTimer = null;

  const storedAttemptId = computed(
    () => attemptId.value || sessionStorage.getItem("attemptId")
  );

  const fetchCourses = async () => {
    loadingCourses.value = true;
    try {
      const response = await apiClient.get(`${STUDENT_ID}/${studentId.value}`);
      courses.value = response.data;
      otpSent.value = true;
      errorMessages.value = "";
    } catch (error) {
      if (error.response?.status === 404) {
        errorMessages.value =
          error.response?.data?.message || "Something went wrong.";
      }
    } finally {
      loadingCourses.value = false;
      otpSent.value = false;
    }
  };

  const fetchInstructors = async () => {
    if (!selectedModule.value) return;
    loadingInstructors.value = true;
    try {
      const response = await apiClient.get(`${INSTRUCTORS}/${selectedModule.value}`);
      instructors.value = response.data;
    } catch (error) {
      handleError(error);
    } finally {
      loadingInstructors.value = false;
    }
  };

  const sendOTP = async (studentId) => {
    try {
      otpMasg.value = "";
      loadingOtp.value = true;

      const response = await apiClient.post(SEND_OTP_API, {
        st_num: studentId,
      });

      otpSent.value = true;
      if (response.data?.message) {
        otpMasg.value = response.data.message;
        otpMessageColor.value = "text-green-500";
        startCountdown();
      }
    } catch (err) {
      handleError(err);
      window.location.reload();
    } finally {
      loadingOtp.value = false;
      otpSent.value = false;
    }
  };

  const startCountdown = () => {
    if (startTimer) clearInterval(startTimer);
    timer.value = 120;

    startTimer = setInterval(() => {
      if (timer.value > 0) {
        timer.value--;
      } else {
        clearInterval(startTimer);
        timer.value = 120;
        otpMasg.value = "OTP is expired.";
        otpMessageColor.value = "text-red-500";
      }
    }, 1000);
  };

  const submitForm = async () => {
    loading.value = true;

    try {
      const payload = {
        ins_id: selectedInstructor.value,
        course_id: selectedModule.value,
        st_num: studentId.value,
        otp: studentOTP.value,
      };

      const response = await apiClient.post(START_EXAM, payload);

      if (response?.data?.data) {
        clearInterval(startTimer);
        startExam.value = response.data;
        attemptId.value = startExam.value.data.attempt_id;
        examAnswers.value = startExam.value.data.answers;
        sessionStorage.setItem("attemptId", attemptId.value);
        studentId.value = "";
        selectedModule.value = null;
        selectedInstructor.value = null;
        studentOTP.value = "";
        otpMasg.value = "";
        errorMessages.value = "";
        router.push({ name: "examPage" });
        startAutoSubmit();
      } else {
        console.error("Unexpected server response:", response);
      }
    } catch (error) {
      handleError(error);
      router.push({ name: "home" });
    } finally {
      loading.value = false;
    }
  };

  const submitExamAnswers = async () => {
    const answersFromStorage = sessionStorage.getItem("answers");
    if (!answersFromStorage) return;

    try {
      const answers = JSON.parse(answersFromStorage);
      const finalPayload = { answers };

      await apiClient.post(`${SUBMIT_EXAM_ANSWERS}/${storedAttemptId.value}`, finalPayload);
    } catch (error) {
      handleError(error);
    }
  };

  let interval = null;

  const startAutoSubmit = () => {
    interval = setInterval(() => {
      submitExamAnswers();
    }, 5000);
  };

  const stopAutoSubmit = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const submitFinalExam = async (payload) => {
    stopAutoSubmit();
    try {
      let answers = payload.answers;

      if (!answers) {
        const answersFromStorage = sessionStorage.getItem("answers");
        answers = answersFromStorage ? JSON.parse(answersFromStorage) : [];
      }

      if (answers.length === 0) {
        notyf.error("No answers available to submit.");
        return;
      }

      const finalPayload = { answers };

      const res = await apiClient.post(
        `${FINISH_EXAM_API}/${storedAttemptId.value}`,
        finalPayload
      );

      if (res.data?.message) {
        notyf.success("Exam submitted successfully.");
        clearExamData();
        router.push({ name: "ResultPage" });
      } else {
        notyf.error("Error in closing the exam. Please try again.");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const clearExamData = () => {
    attemptId.value = null;
    examAnswers.value = [];
    startExam.value = { questions: [] };
    sessionStorage.removeItem("attemptId");
    sessionStorage.removeItem("answers");
  };

  return {
    // Data
    studentId,
    courses,
    instructors,
    selectedModule,
    selectedInstructor,
    startExam,
    examAnswers,

    // State
    errorMessages,
    error,
    otpMasg,
    otpMessageColor,
    otpSent,
    studentOTP,
    timer,

    // Loaders
    loading,
    loadingOtp,
    loadingCourses,
    loadingInstructors,

    // Actions
    fetchCourses,
    fetchInstructors,
    sendOTP,
    startCountdown,
    submitForm,
    submitExamAnswers,
    submitFinalExam,
    stopAutoSubmit,
  };
});
