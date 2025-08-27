<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import notyf from "@/components/global/notyf";
import { useStudentStore } from "../../stores/studentStore";
import { useRouter } from "vue-router";

const studentStore = useStudentStore();
const router = useRouter();

// منع الدخول بدون attemptId
if (!sessionStorage.getItem("attemptId")) {
  router.push("/home");
}

const examData = computed(() => studentStore.startExam?.data || {});
const remainingTime = computed(() => examData.value?.remaining_time || 0);
const exam = computed(() => examData.value?.exam || {});
const questions = computed(() => exam.value?.questions || []);
const previousAnswers = computed(() => examData.value?.answers || []);
const showUnansweredMessage = ref("");

const currentQuestionIndex = ref(null);
const answersArray = ref([]);
const timeLeft = ref(0); // لن نحفظه في sessionStorage
const selectedOptions = ref([]);
const quizStarted = ref(false);
const isSubmitting = ref(false);
let interval;

const mode = ref("all");
const unansweredIndexes = ref([]);

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1
);

const answeredCount = computed(() => studentStore.examAnswers.length);

// بدء المؤقت
const startTimer = () => {
  interval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 1;
    } else {
      clearInterval(interval);
      notyf.error("Time is up! Exam ended.");
      // لا نحول لـ home هنا مباشرة، نترك الطالب يُكمل إرسال الإجابات
    }
  }, 1000);
};

// حفظ الإجابة
const saveAnswer = () => {
  if (
    selectedOptions.value[currentQuestionIndex.value] !== null &&
    currentQuestion.value
  ) {
    const answer = {
      q_id: currentQuestion.value.id,
      selected_option: selectedOptions.value[currentQuestionIndex.value],
    };

    const existingIndex = studentStore.examAnswers.findIndex(
      (a) => a.q_id === currentQuestion.value.id
    );

    if (existingIndex !== -1) {
      studentStore.examAnswers[existingIndex] = answer;
    } else {
      studentStore.examAnswers.push(answer);
    }

    const answersIndex = answersArray.value.findIndex(
      (a) => a.q_id === currentQuestion.value.id
    );
    if (answersIndex !== -1) {
      answersArray.value[answersIndex] = answer;
    } else {
      answersArray.value.push(answer);
    }

    const i = unansweredIndexes.value.indexOf(currentQuestionIndex.value);
    if (i !== -1) {
      unansweredIndexes.value.splice(i, 1);
      if (unansweredIndexes.value.length === 0) {
        mode.value = "all";
      }
    }

    sessionStorage.setItem("answers", JSON.stringify(answersArray.value));
  }
};

// تحميل الإجابة المحفوظة
const loadSelectedOption = () => {
  const savedAnswer = previousAnswers.value.find(
    (ans) => ans.q_id === currentQuestion.value?.id
  );
  const modifiedAnswer = studentStore.examAnswers.find(
    (ans) => ans.q_id === currentQuestion.value?.id
  );

  if (modifiedAnswer) {
    selectedOptions.value[currentQuestionIndex.value] =
      modifiedAnswer.selected_option;
  } else if (savedAnswer) {
    selectedOptions.value[currentQuestionIndex.value] =
      savedAnswer.selected_option;
  } else {
    selectedOptions.value[currentQuestionIndex.value] = null;
  }
};

// بدء الامتحان
const handleStart = () => {
  currentQuestionIndex.value = 0;
  quizStarted.value = true;
  timeLeft.value = remainingTime.value; // ← الوقت من السيرفر
  startTimer();
  loadSelectedOption();
};

// السؤال التالي
const nextQuestion = async () => {
  saveAnswer();
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++;
    loadSelectedOption();
  } else {
    await submitFinalExam({ answers: answersArray.value });
  }
};

// السؤال السابق
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    saveAnswer();
    currentQuestionIndex.value--;
    loadSelectedOption();
  }
};

// إرسال الامتحان النهائي
const submitFinalExam = async () => {
  if (isSubmitting.value) return;

  try {
    const unansweredQuestionIndexes = questions.value.reduce(
      (acc, question, index) => {
        if (
          selectedOptions.value[index] === null ||
          selectedOptions.value[index] === undefined
        ) {
          acc.push(index + 1);
        }
        return acc;
      },
      []
    );

    if (unansweredQuestionIndexes.length > 0) {
      unansweredIndexes.value = unansweredQuestionIndexes.map((n) => n - 1);
      showUnansweredMessage.value = `Please answer all questions.`;
      mode.value = "filter";
      currentQuestionIndex.value = unansweredIndexes.value[0];
      return;
    }

    saveAnswer();

    isSubmitting.value = true;
    const payload = { answers: answersArray.value };

    await studentStore.submitFinalExam(payload);

    isSubmitting.value = false;
    clearInterval(interval);
    quizStarted.value = false;
    sessionStorage.removeItem("attemptId");
    sessionStorage.removeItem("answers");
    router.replace({ name: "ResultPage" });
  } catch (error) {
    notyf.error("Error submitting final exam");
    isSubmitting.value = false;
  }
};

// منع الخروج المفاجئ
const handleBeforeUnload = (e) => {
  e.preventDefault();
  sessionStorage.removeItem("attemptId");
  sessionStorage.removeItem("answers");
  return "";
};

onMounted(() => {
  // استعد الإجابات فقط
  const savedAnswers = sessionStorage.getItem("answers");
  if (savedAnswers) {
    try {
      answersArray.value = JSON.parse(savedAnswers);
    } catch (e) {
      console.warn("Failed to parse saved answers");
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div class="quiz-container  min-h-screen w-[100%]">
    <div class="text-center dark:text-white">
      <h2 class="font-bold text-primary text-2xl  p-3">{{ exam.name }}</h2>

      <div class="text-2xl font-semibold mb-3">
        Remaining time
        <span class="text-primary font-bold dark:text-blue-500 text-xl ml-1">
          {{
            Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")
          }}:{{
            Math.floor(timeLeft % 60)
              .toString()
              .padStart(2, "0")
          }}
        </span>
      </div>
    </div>

    <div v-if="!quizStarted && timeLeft > 0" class="text-center">
      <button @click="handleStart" class="buttonClass">Start</button>
    </div>

    <div v-else-if="timeLeft <= 0" class="text-center">
      <p class="text-red-600 font-bold text-xl mb-4">Time is up!</p>
      <button @click="router.push('/home')" class="btn-start">Go Back</button>
    </div>

    <!-- أثناء الامتحان -->
    <div v-if="quizStarted">
      <div class="text-end mt-4">
        <label class="text-gray-700 font-medium block mb-2"
          >Go to question:</label
        >
        <select
          v-model="currentQuestionIndex"
          class="border px-4 py-2 rounded-md font-semibold"
          @change="loadSelectedOption"
          :class="{
            'border-red-500 text-red-600':
              unansweredIndexes.length > 0 && mode === 'filter',
            'border-indigo-500 text-indigo-700': mode !== 'filter',
          }"
        >
          <option :value="null" disabled selected>
            {{
              mode === "filter" && unansweredIndexes.length > 0
                ? "Unanswered questions"
                : "Select a question"
            }}
          </option>
          <option
            v-for="(index, idx) in mode === 'filter'
              ? unansweredIndexes
              : questions.map((_, i) => i)"
            :key="idx"
            :value="index"
          >
            Question {{ index + 1 }}
          </option>
        </select>
      </div>

      <div v-if="currentQuestion" class="shadow-md p-5 rounded-2xl">
        <h3
          class="text-lg font-semibold text-center min-h-[100px] flex items-center justify-center border p-3 shadow-md rounded-xl mb-5 bg-primary text-white"
        >
          {{ currentQuestion.question_text }}
        </h3>
        <div
          v-for="[key, option] in Object.entries(
            currentQuestion?.options || {}
          ).filter(([_, value]) => value && value.trim() !== '')"
          :key="key"
          class="option dark:text-gray-300"
          :class="{ selected: selectedOptions[currentQuestionIndex] === key }"
          @click="selectedOptions[currentQuestionIndex] = key"
        >
          <input
            type="radio"
            :id="'option-' + key"
            v-model="selectedOptions[currentQuestionIndex]"
            :value="key"
            style="opacity: 0; position: absolute"
          />
          <label :for="'option-' + key">{{ option }}</label>
        </div>
      </div>

      <div class="text-center mt-6">
        <button @click="previousQuestion" class="btn-prev">Previous</button>
        <button v-if="!isLastQuestion" @click="nextQuestion" class="btn-next">
          Next
        </button>
        <button v-else @click="submitFinalExam" class="btn-next">
          <span v-if="isSubmitting"
            ><i class="fa-solid fa-circle-notch fa-spin-pulse"></i
          ></span>
          <span v-else>Submit</span>
        </button>
      </div>

      <div
        class="answered-counter text-center mt-3 text-lg font-medium dark:text-white"
      >
        It has been answered
        <span class="text-primary dark:text-blue-500 text-xl font-bold"
          >({{ answeredCount }})</span
        >
        from
        <span class="text-primary font-bold text-xl dark:text-blue-500"
          >({{ questions.length }})</span
        >
        Questions
      </div>
    </div>

    <!-- رسالة الأسئلة الغير مجاب عليها -->
    <div
      v-if="showUnansweredMessage"
      class="alert-message text-red-500 text-center mt-3"
    >
      {{ showUnansweredMessage }}
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  position: relative;
}

.quiz-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/logo.png");
  background-size: 50%; 
  background-position: center;
  opacity: 0.3;
  pointer-events: none;
  z-index: -1;
}

.answered-counter {
  margin-top: 15px;
  color: #0d47aa;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 7px;
  margin: 7px 0;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.option:hover {
  border-color: #4788f8;
}

.option input[type="radio"] {
  transform: scale(1.2);
  cursor: pointer;
}

.selected {
  background-color: #b5ccf3;
  border-color: #689af1;
  color: #092c67;
  font-weight: bold;
}

button {
  padding: 10px 50px;
  background-color: #092c67;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #073481;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

button:disabled {
  background-color: #ccc;
}

.buttonClass {
  font-size: 15px;
  font-family: Arial;
  width: 140px;
  height: 50px;
  border-width: 1px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  border-color: rgba(9, 44, 103, 1);
  border-radius: 10px;
  box-shadow: 0px 0px 0px 2px #9fb4f2;
  text-shadow: 0px 1px 0px rgba(136, 148, 179, 1);
  background: linear-gradient(rgb(120, 146, 194), rgba(9, 44, 103, 1));
}

.buttonClass:hover {
  background: linear-gradient(rgba(9, 44, 103, 1), rgb(120, 146, 194));
}

.btn-prev {
  margin-right: 10px;
}

.alert-message {
  font-weight: bold;
}
</style>
