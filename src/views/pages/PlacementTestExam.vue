<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { useRouter } from "vue-router";

import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const studentStore = usePlacementTestsExamStore();
const router = useRouter();

const notyf = new Notyf({
  duration: 4000,
  dismissible: true,
  position: { x: "center", y: "top" },
});

const examData = computed(() => studentStore.exam?.data || {});
const questions = computed(() => examData.value.ptest?.questions || []);
const examInfo = computed(() => examData.value.ptest || {});
const previousAnswers = computed(() => examData.value.answers || []);
const remainingTime = computed(() => examData.value.remaining_time || 0);

const currentQuestionIndex = ref(null);
const selectedOptions = ref([]);
const answersArray = ref([]);
const timeLeft = ref(remainingTime.value);
const quizStarted = ref(false);
const isSubmitting = ref(false);
const showUnansweredMessage = ref("");
const unansweredIndexes = ref([]);
const mode = ref("all");
let interval;
const alertSound = new Audio(new URL("@/assets/alert.mp3", import.meta.url));

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1
);
const answeredCount = computed(() => studentStore.examAnswers.length);

let tenMinuteWarningGiven = false;

const startTimer = () => {
  interval = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(interval);
      alertSound.play();
      Notyf.error("Time is up!");

      submitFinalExam().then(() => {
        studentStore.autoSaveAnswers(answersArray.value);
        router.replace({ name: "exam-success" });
      });
    } else {
      timeLeft.value = parseFloat((timeLeft.value - 0.01).toFixed(2));

      if (!tenMinuteWarningGiven && timeLeft.value <= 600) {
        tenMinuteWarningGiven = true;
        // alertSound.play();
        // notyf.warning("⚠️ Hurry up! Only 10 minutes left.");
      }
    }
  }, 1000);
};

const loadSelectedOption = () => {
  if (!currentQuestion.value || !Array.isArray(studentStore.examAnswers))
    return;
  const saved = studentStore.examAnswers.find(
    (ans) => ans.q_id === currentQuestion.value.id
  );
  selectedOptions.value[currentQuestionIndex.value] =
    saved?.selected_option || null;
};

const saveAnswer = () => {
  if (!currentQuestion.value) return;
  const key = currentQuestion.value.id;
  const option = selectedOptions.value[currentQuestionIndex.value];
  const answer = { q_id: key, selected_option: option };

  const existing = studentStore.examAnswers.findIndex((a) => a.q_id === key);
  if (existing !== -1) {
    studentStore.examAnswers[existing] = answer;
  } else {
    studentStore.examAnswers.push(answer);
  }

  const answerIdx = answersArray.value.findIndex((a) => a.q_id === key);
  if (answerIdx !== -1) {
    answersArray.value[answerIdx] = answer;
  } else {
    answersArray.value.push(answer);
  }

  const i = unansweredIndexes.value.indexOf(currentQuestionIndex.value);
  if (i !== -1 && option != null) {
    unansweredIndexes.value.splice(i, 1);
  }

  if (unansweredIndexes.value.length === 0) {
    showUnansweredMessage.value = "";
  }

  sessionStorage.setItem("answers", JSON.stringify(answersArray.value));
};

const handleStart = () => {
  currentQuestionIndex.value = 0;
  quizStarted.value = true;
  timeLeft.value = remainingTime.value;

  const restoredAnswers = studentStore.exam?.data?.answers || [];

  restoredAnswers.forEach((answer) => {
    const qIndex = questions.value.findIndex((q) => q.id === answer.q_id);
    if (qIndex !== -1) {
      selectedOptions.value[qIndex] = answer.selected_option;
      answersArray.value[qIndex] = {
        q_id: answer.q_id,
        selected_option: answer.selected_option,
      };
    }
  });

  sessionStorage.setItem("answers", JSON.stringify(answersArray.value));

  unansweredIndexes.value = questions.value
    .map((q, i) => (selectedOptions.value[i] == null ? i : null))
    .filter((i) => i !== null);
  startTimer();
  loadSelectedOption();
};

const nextQuestion = async () => {
  saveAnswer();
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++;
    loadSelectedOption();
  } else {
    await submitFinalExam();
  }
};

const previousQuestion = () => {
  saveAnswer();
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    loadSelectedOption();
  }
};

const submitFinalExam = async () => {
  console.log("finishing exam...done");
  const unanswered = questions.value.reduce((acc, q, i) => {
    if (
      selectedOptions.value[i] === null ||
      selectedOptions.value[i] === undefined
    ) {
      acc.push(i);
    }
    return acc;
  }, []);

  if (unanswered.length > 0) {
    alertSound.play();
    unansweredIndexes.value = unanswered;
    showUnansweredMessage.value = "Please answer all questions.";
    mode.value = "filter";
    currentQuestionIndex.value = unanswered[0];
    return;
  }

  console.log("Submitting answers:", answersArray.value);

  isSubmitting.value = true;
  saveAnswer();
  await studentStore.submitFinalExam(answersArray.value);

  isSubmitting.value = false;
  clearInterval(interval);
  quizStarted.value = false;

  studentStore.examAnswers = [];
  answersArray.value = [];
  selectedOptions.value = [];
  currentQuestionIndex.value = null;
  unansweredIndexes.value = [];
  showUnansweredMessage.value = "";
  sessionStorage.removeItem("answers");
  sessionStorage.removeItem("attemptId");

  router.push("/exam-success");
};

const handleBeforeUnload = (e) => {
  e.preventDefault();
  sessionStorage.removeItem("attemptId");
  sessionStorage.removeItem("answers");
  router.replace({ name: "placement-test" });
  return "";
};

onMounted(() => window.addEventListener("beforeunload", handleBeforeUnload));
onBeforeUnmount(() =>
  window.removeEventListener("beforeunload", handleBeforeUnload)
);
</script>

<template>
  <div class="relative min-h-screen bg-gray-100 overflow-hidden">
    <img
      src="@/assets/hero.webp"
      alt="Background"
      class="absolute inset-0 w-full h-full object-cover opacity-10 z-0"
    />

    <div class="relative z-10 max-w-4xl mx-auto p-6">
      <div
        class="bg-white bg-opacity-90 shadow-xl rounded-2xl p-8 space-y-8 mt-20"
      >
        <div class="text-center mb-4">
          <h2 class="text-3xl font-bold text-blue-900">{{ examInfo.name }}</h2>
          <div class="text-lg mt-2">
            Time Remaining:
            <span class="font-semibold text-blue-600">
              {{ Math.floor(timeLeft) }}:{{
                Math.round((timeLeft - Math.floor(timeLeft)) * 100)
                  .toString()
                  .padStart(2, "0")
              }}
            </span>
          </div>
        </div>

        <div v-if="!quizStarted" class="text-center">
          <button
            @click="handleStart"
            class="bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-blue-800 transition"
          >
            Start Exam
          </button>
        </div>

        <div v-if="quizStarted && currentQuestion">
          <div class="w-full bg-gray-200 h-2 rounded mb-6">
            <div
              class="bg-blue-600 h-full rounded transition-all duration-300"
              :style="{ width: (answeredCount / questions.length) * 100 + '%' }"
            ></div>
          </div>

          <div class="mb-4 flex items-center justify-end">
            <label for="questionSelect" class="mr-2 font-medium text-gray-700">
              Go to Question:
            </label>
            <select
              id="questionSelect"
              v-model="currentQuestionIndex"
              :class="[
                'px-4 py-2 border rounded transition',
                showUnansweredMessage && unansweredIndexes.length > 0
                  ? 'border-red-500 shake'
                  : 'border-gray-300',
              ]"
            >
              <option
                v-for="(q, index) in questions"
                :key="index"
                :value="index"
                :class="{
                  'text-red-500 font-bold':
                    showUnansweredMessage && unansweredIndexes.includes(index),
                }"
              >
                Question {{ index + 1 }}
              </option>
            </select>
          </div>
          <!-- توضيح لون الأسئلة غير المُجابة -->
          <div class="text-sm text-gray-600 text-right mb-4">
            <span class="text-red-500 font-bold">Red</span> = Unanswered
            question
          </div>

          <!-- نص السؤال -->
          <div class="mb-6 mt-10">
            <h3
              class="text-xl font-semibold bg-primary py-2 px-4 min-h-[70px] flex justify-center items-center text-white rounded-md mb-4"
            >
              {{ currentQuestion.question_text }}
            </h3>

            <!-- الاختيارات -->
            <div class="grid gap-4">
              <div
                v-for="([key, val], index) in Object.entries({
                  a: currentQuestion.option_a,
                  b: currentQuestion.option_b,
                  c: currentQuestion.option_c,
                  d: currentQuestion.option_d,
                }).filter(([_, v]) => v && v.trim())"
                :key="index"
              >
                <label
                  class="block border rounded-lg px-4 py-3 cursor-pointer transition hover:shadow-md"
                  :class="{
                    'bg-blue-100 border-blue-500':
                      selectedOptions[currentQuestionIndex] === key,
                    'bg-white': selectedOptions[currentQuestionIndex] !== key,
                  }"
                >
                  <input
                    type="radio"
                    class="hidden"
                    :value="key"
                    v-model="selectedOptions[currentQuestionIndex]"
                    @change="saveAnswer"
                  />
                  {{ val }}
                </label>
              </div>
            </div>
          </div>
          <div
            v-if="showUnansweredMessage"
            class="text-red-600 bg-red-100 border border-red-300 px-4 py-3 rounded mt-4 text-center"
          >
            Please answer all questions. You'll find unanswered ones highlighted
            in red in the question list.
          </div>
          <!-- أزرار التنقل -->
          <div class="flex justify-between mt-8">
            <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50 bg-gray-400 text-white hover:bg-gray-500"
            >
              Previous
            </button>

            <button
              v-if="!isLastQuestion"
              @click="nextQuestion"
              class="px-5 py-2 rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>

            <button
              v-if="isLastQuestion"
              @click="submitFinalExam"
              class="px-5 py-2 rounded-lg font-semibold transition bg-green-600 text-white hover:bg-green-700"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}

.shake {
  animation: shake 0.4s ease-in-out;
}
</style>
