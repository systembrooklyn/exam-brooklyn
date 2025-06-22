<template>
  <div class="min-h-screen bg-gray-100 py-10 px-6 flex flex-col items-center">
    <div class="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
      <h1 class="text-3xl font-bold text-center text-indigo-700">
        Scholarship Application Questions
      </h1>

      <!-- Questions -->
      <div v-for="(label, key, idx) in questionLabels" :key="key">
        <label class="block text-lg font-medium text-gray-700 mb-2">
          {{ idx + 1 }}. {{ label }}
        </label>
        <textarea
          v-model="answers[key]"
          rows="4"
          placeholder="Write your answer here..."
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <!-- Submit Button -->
      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="loading"
            class="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          <span>{{ loading ? "Submitting..." : "Submit Application" }}</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="text-red-600 text-center text-sm mt-2">
        Please answer all questions before submitting.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { useRouter } from "vue-router";

const placementExamStore = usePlacementTestsExamStore();
const router = useRouter();

const answers = ref({
  q1: "",
  q2: "",
  q3: "",
});

const questionLabels = {
  q1: "Why did you apply for the scholarship?",
  q2: "If you participate in this program, how do you think your life will be different in 5 years?",
  q3: "Please describe one situation from your school, work, or personal life when you faced a challenge or a problem. How did you solve it?",
};

const errorMessage = ref(false);
const loading = ref(false); // ⬅️ جديد

const handleSubmit = async () => {
  const { q1, q2, q3 } = answers.value;
  errorMessage.value = false;

  if (!q1 || !q2 || !q3) {
    errorMessage.value = true;
    return;
  }

  try {
    loading.value = true; // ⬅️ ابدأ التحميل

    await placementExamStore.saveSurveyAnswers(answers.value);
    router.push({ name: "exam-start" });
    answers.value = { q1: "", q2: "", q3: "" };

  } catch (error) {
    console.error("Submission failed:", error);
  } finally {
    loading.value = false; // ⬅️ انتهى التحميل
  }
};
</script>
