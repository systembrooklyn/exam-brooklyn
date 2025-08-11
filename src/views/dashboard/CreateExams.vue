<script setup>
import InstructorSelect from "@/components/dashboard/InstructorSelect.vue";
import CourseSelect from "@/components/dashboard/CourseSelect.vue";
import ExamInfoForm from "@/components/dashboard/ExamInfoForm.vue";
import { defineAsyncComponent } from "vue";
import { computed, inject, onMounted, ref } from "vue";
import { useExamStore } from "@/stores/examStore";
import { useScholarshipStore } from "@/stores/scholarships";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const examStore = useExamStore();
const isAdding = ref(false);
const emitter = inject("emitter");
const scholarshipStore = useScholarshipStore();
const questionForm = ref();
const router = useRouter();

const ExamQuestions = defineAsyncComponent(() =>
  import("@/components/dashboard/ExamQuestions.vue")
);

const prefetchExamQuestions = () => {
  import("@/components/dashboard/ExamQuestions.vue");
};

onMounted(() => {
  scholarshipStore.fetchScholarships();
  emitter.on("questions", (questions) => {
    questions;

    exam.value.questions = questions;
  });
});

const isFormValid = computed(() => {
  return (
    exam.value.name?.trim() &&
    exam.value.duration > 0 &&
    exam.value.ins_id &&
    exam.value.crs_id // ← متأكد إنك تقصد crs_id مش course_id هنا
  );
});

const exam = ref({
  name: "",
  description: "",
  duration: 0,
  ins_id: "",
  crs_id: "",
  is_active: true,
  questions: [],
});

const submitting = ref(false);
const errors = ref({
  name: "",
  description: "",
  duration: "",
  ins_id: "",
  crs_id: "",
});
const handleNewQuestions = (questions) => {
  const valid = questions?.filter((q) => q?.question_text?.trim()) || [];
  exam.value.questions = valid;
};

exam.value.ins_id;

const submitExam = async () => {
  submitting.value = true;

  try {
    const questions = questionForm.value?.getQuestions?.();

    const payload = {
      name: exam.value.name,
      description: exam.value.description,
      duration: Number(exam.value.duration),
      ins_id: Number(exam.value.ins_id),
      is_active: exam.value.is_active ? 1 : 0,
    };

    if (questions && questions.length > 0) {
      // في حالة وجود أسئلة → استخدم crs_id
      payload.crs_id = Number(exam.value.crs_id);
      payload.questions = questions;
      await examStore.addExam(payload);
    } else {
      // في حالة عدم وجود أسئلة → استخدم course_id
      payload.course_id = Number(exam.value.crs_id);
      await examStore.addExamBasic(payload);
    }
  } catch (error) {
    console.error("Error submitting exam:", error);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="flex justify-end mr-10">
    <button
      class="bg-primary text-white py-2 px-4 cursor-pointer mt-5 rounded"
      @click="router.push({ name: 'examExcel' })"
    >
      Import Exam Excel
    </button>
  </div>

  <div class="m-10 bg-white shadow-md rounded-2xl p-5">
    <h1 class="text-3xl font-bold text-primary shadow-sm text-center mb-5 p-2">
      Create New Exam
    </h1>
    <!-- Instructor and Course Selects -->
    <div class="flex items-center justify-between mt-8">
      <div>
        <CourseSelect v-model="exam.crs_id" />
        <p v-if="errors.crs_id" class="text-red-500 text-sm ms-5">
          {{ errors.crs_id }}
        </p>
      </div>

      <div>
        <InstructorSelect v-model="exam.ins_id" :disabled="!exam.crs_id" />

        <p v-if="errors.ins_id" class="text-red-500 text-sm ms-5">
          {{ errors.ins_id }}
        </p>
      </div>
    </div>

    <!-- General Exam Info Component -->
    <ExamInfoForm v-model="exam" :errors="errors" />

    <!-- Add Question Button -->
    <div class="flex justify-end mt-6">
      <button
        v-if="authStore.hasPermission('create-questions')"
        v-show="!isAdding"
        @click="isAdding = true"
        :disabled="!isFormValid"
        @mouseover="prefetchExamQuestions"
        :class="[
          'bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer flex items-center gap-2 min-w-[140px]',
          !isFormValid ? 'opacity-50 cursor-not-allowed' : '',
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

    <div class="flex justify-start mt-6">
      <button
        @click="submitExam"
        :disabled="!isFormValid || submitting"
        :class="[
          'px-6 py-2 rounded flex items-center justify-center min-w-[120px]',
          !isFormValid || submitting
            ? 'bg-gray-400  text-white'
            : 'bg-primary text-white hover:bg-[#063585]',
        ]"
      >
        <span
          v-if="submitting"
          class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"
        ></span>
        <span v-else>Submit</span>
      </button>
    </div>
  </div>
</template>
