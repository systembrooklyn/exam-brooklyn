<script setup>
import ExamInfoForm from "@/components/dashboard/ExamInfoForm.vue";
import { defineAsyncComponent } from "vue";
import { computed, inject, onMounted, ref } from "vue";
import { usePlacementTestsStore } from "@/stores/placementTestsStore";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const placementStore = usePlacementTestsStore();
const isAdding = ref(false);
const questionForm = ref();
const emitter = inject("emitter");
const router = useRouter();

const ExamQuestions = defineAsyncComponent(() =>
  import("@/components/dashboard/ExamQuestions.vue")
);

const prefetchExamQuestions = () => {
  import("@/components/dashboard/ExamQuestions.vue");
};

onMounted(() => {
  emitter.on("questions", (questions) => {
    exam.value.questions = questions;
  });
});


const isInfoFilled = computed(() => {
  return exam.value.name && exam.value.description && exam.value.duration > 0;
});


const isFormValid = computed(() => {
  return isInfoFilled.value; // فقط نتحقق من معلومات الامتحان
});

const handleNewQuestions = (questionsData) => {
  const valid = questionsData?.filter(q => q?.question_text?.trim()) || [];
  exam.value.questions = valid;
};


const exam = ref({
  name: "",
  description: "",
  duration: 0,
  is_active: false,
  questions: [],
});

const submitting = ref(false);
const errors = ref({
  name: "",
  description: "",
  duration: "",
});

const submitExam = async () => {
  submitting.value = true;

  try {
    // لو المستخدم أضاف أسئلة من ExamQuestions component
    const questions = questionForm.value?.getQuestions?.();
    if (questions && questions.length > 0) {
      exam.value.questions = questions;
      await placementStore.addPlacementTestWithQuestions(exam.value); // API لو فيها أسئلة
    } else {
      // تأكد إن الأسئلة فاضية
      exam.value.questions = [];
      await placementStore.addPlacementTestBasic(exam.value); // API لو مفيهاش أسئلة
    }

    router.push({ name: "placement" });
  } catch (error) {
    console.error("Error submitting placement test:", error);
  } finally {
    submitting.value = false;
  }
};



</script>
<template>
  <div class="m-10 bg-white shadow-md rounded-2xl p-5">
    <h1 class="text-3xl font-bold text-primary shadow-sm text-center mb-5 p-2">
      Create New Placement Test
    </h1>

    <!-- General Exam Info Component -->
    <div class="mt-6">
      <ExamInfoForm v-model="exam" :errors="errors" />
    </div>

    <!-- Add Question Button -->
    <div class="flex justify-end mt-6">
      <button
        v-if="authStore.hasPermission('create-questions')"
        v-show="!isAdding"
        @click="isAdding = true"
        :disabled="!isInfoFilled"
        @mouseover="prefetchExamQuestions"
        :class="[
          'bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer flex items-center gap-2 min-w-[140px]',
          !isInfoFilled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        + Add Question
      </button>
    </div>

    <!-- Questions Component -->
    <ExamQuestions
  v-show="isAdding"
  ref="questionForm"
  :questions="exam.questions"
  @update:questions="handleNewQuestions"
/>


    <!-- Submit Button -->
    <div class="flex justify-start mt-6">
      <button
        @click="submitExam"
        :disabled="!isFormValid || submitting"
        :class="[
          'px-6 py-2 rounded flex items-center justify-center min-w-[120px]',
          (!isFormValid || submitting)
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-primary text-white hover:bg-[#063585]',
        ]"
      >
        <span v-if="submitting" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
        <span v-else>Submit</span>
      </button>
    </div>
  </div>
</template>