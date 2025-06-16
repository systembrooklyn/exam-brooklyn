<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const studentStore = usePlacementTestsExamStore();
const router = useRouter();

const notyf = new Notyf({
  duration: 4000,
  dismissible: true,
  position: { x: 'center', y: 'top' },
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

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);
const answeredCount = computed(() => studentStore.examAnswers.length);

const startTimer = () => {
  interval = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(interval);
      notyf.error("Time is up!");
      router.replace({ name: 'placement-test' });
    } else {
      timeLeft.value = parseFloat((timeLeft.value - 0.01).toFixed(2));
    }
  }, 1000);
};

const loadSelectedOption = () => {
  if (!currentQuestion.value || !Array.isArray(studentStore.examAnswers)) return;
  const saved = studentStore.examAnswers.find(ans => ans.q_id === currentQuestion.value.id);
  selectedOptions.value[currentQuestionIndex.value] = saved?.selected_option || null;
};

const saveAnswer = () => {
  if (!currentQuestion.value) return;
  const key = currentQuestion.value.id;
  const option = selectedOptions.value[currentQuestionIndex.value];
  const answer = { q_id: key, selected_option: option };

  const existing = studentStore.examAnswers.findIndex(a => a.q_id === key);
  if (existing !== -1) {
    studentStore.examAnswers[existing] = answer;
  } else {
    studentStore.examAnswers.push(answer);
  }

  const answerIdx = answersArray.value.findIndex(a => a.q_id === key);
  if (answerIdx !== -1) {
    answersArray.value[answerIdx] = answer;
  } else {
    answersArray.value.push(answer);
  }

  const i = unansweredIndexes.value.indexOf(currentQuestionIndex.value);
  if (i !== -1) unansweredIndexes.value.splice(i, 1);

  // إذا خلص كل الأسئلة، ارجع لآخر سؤال
  if (unansweredIndexes.value.length === 0 && mode.value === "filter") {
    mode.value = "all";
    currentQuestionIndex.value = questions.value.length - 1;
  }

  sessionStorage.setItem("answers", JSON.stringify(answersArray.value));
};

const handleStart = () => {
  currentQuestionIndex.value = 0;
  quizStarted.value = true;
  timeLeft.value = remainingTime.value;
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
  const unanswered = questions.value.reduce((acc, q, i) => {
    if (selectedOptions.value[i] === null || selectedOptions.value[i] === undefined) {
      acc.push(i);
    }
    return acc;
  }, []);

  if (unanswered.length > 0) {
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
 router.push("/exam-success");

};

const handleBeforeUnload = (e) => {
  e.preventDefault();
  sessionStorage.removeItem("attemptId");
  sessionStorage.removeItem("answers");
  return "";
};

onMounted(() => window.addEventListener("beforeunload", handleBeforeUnload));
onBeforeUnmount(() => window.removeEventListener("beforeunload", handleBeforeUnload));
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg min-h-screen">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-blue-900">{{ examInfo.name }}</h2>
      <div class="text-lg mt-2">
        Time Remaining:
        <span class="font-semibold text-blue-600">
          {{ Math.floor(timeLeft) }}:{{ Math.round((timeLeft - Math.floor(timeLeft)) * 100).toString().padStart(2, "0") }}
        </span>
      </div>
    </div>

    <div v-if="!quizStarted">
      <button @click="handleStart" class="bg-blue-700 text-white px-6 py-3 rounded-md">Start Exam</button>
    </div>

    <div v-if="quizStarted && currentQuestion">
      <!-- الانتقال بين الأسئلة -->
      <div class="mb-4">
        <label for="questionSelect" class="mr-2 font-medium text-gray-700">Go to Question:</label>
        <select
          id="questionSelect"
          v-model="currentQuestionIndex"
          class="px-4 py-2 border rounded"
        >
          <option
            v-for="(q, index) in questions"
            :key="index"
            :value="index"
            :style="{ color: unansweredIndexes.includes(index) ? 'red' : 'black' }"
          >
            Question {{ index + 1 }}
          </option>
        </select>
      </div>

      <!-- عرض السؤال -->
      <div class="mb-6">
        <h3 class="text-xl font-medium text-gray-800 mb-3">{{ currentQuestion.question_text }}</h3>
        <div
          v-for="([key, val], index) in Object.entries({
            a: currentQuestion.option_a,
            b: currentQuestion.option_b,
            c: currentQuestion.option_c,
            d: currentQuestion.option_d,
          }).filter(([_, v]) => v && v.trim())"
          :key="index"
          class="mb-2"
        >
          <label class="flex items-center gap-2">
            <input
              type="radio"
              :value="key"
              v-model="selectedOptions[currentQuestionIndex]"
              @change="saveAnswer"
            />
            <span>{{ val }}</span> 
          </label>
        </div>
      </div>

      <!-- أزرار التنقل -->
      <div class="flex justify-between mt-8">
        <button @click="previousQuestion" :disabled="currentQuestionIndex === 0" class="bg-gray-300 px-4 py-2 rounded">Previous</button>
        <button v-if="!isLastQuestion" @click="nextQuestion" class="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
        <button v-if="isLastQuestion" @click="submitFinalExam" class="bg-green-600 text-white px-4 py-2 rounded">
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit</span>
        </button>
      </div>

      <!-- رسالة الأسئلة غير المُجابة -->
      <div v-if="showUnansweredMessage" class="text-red-500 text-center mt-4">{{ showUnansweredMessage }}</div>
    </div>
  </div>
</template>
