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
      <div class="flex justify-end">
        <button
          @click="handleSubmit"
          class="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all"
        >
          Submit Application
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="text-red-600 text-center text-sm mt-2">
        Please answer all questions before submitting.
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-[rgba(0,0,0,0.6)] bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-xl font-bold text-primary text-center">
          Are you ready to begin the exam?
        </h2>
        <p class="text-sm text-gray-600 text-center">
          Please choose which exam you want to start with:
        </p>

        <select
          v-model="selectedExamId"
          class="w-full border px-3 py-2 rounded-md focus:outline-none focus:border-indigo-500"
        >
          <option disabled value="">Select an exam</option>
          <option v-for="exam in filteredExams" :key="exam.id" :value="exam.id">
            {{ exam.name }}
          </option>
        </select>

        <div class="flex justify-between mt-4">
          <button
            @click="cancelModal"
            class="px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedExamId || loadingExam"
            @click="confirmStartExam"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span
              v-if="loadingExam"
              class="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span>{{ loadingExam ? "Starting..." : "Start Exam" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { usePlacementTestsStore } from "@/stores/placementTestsStore";
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";

const placementStore = usePlacementTestsStore();
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
const showModal = ref(false);
const selectedExamId = ref("");
const exams = ref([]);

const handleSubmit = () => {
  const { q1, q2, q3 } = answers.value;
  errorMessage.value = false;

  if (!q1 || !q2 || !q3) {
    errorMessage.value = true;
    return;
  }

  showModal.value = true;
};

// ✅ Load exams from store on mount
onMounted(async () => {
  await placementStore.fetchPlacementTests();
  exams.value = placementStore.placementTests;
});

// ❌ exclude started exam
const startedExamId = localStorage.getItem("startedExamId");

const filteredExams = computed(() => {
  return exams.value.filter((exam) => exam.id !== Number(startedExamId));
});

const cancelModal = () => {
  showModal.value = false;
  selectedExamId.value = "";
};

const loadingExam = ref(false);

const confirmStartExam = async () => {
  loadingExam.value = true;
  const st_num = Number(Cookies.get("st_id")) || 0;

  try {
    await placementExamStore.fetchPlacementExam(selectedExamId.value, st_num);

    // ✅ Save selected exam to localStorage
    localStorage.setItem("startedExamId", selectedExamId.value);

    showModal.value = false;
    router.push({ name: "placement-exam" });
  } catch (error) {
    console.error("Error fetching exam:", error);
  } finally {
    loadingExam.value = false;
  }
};
</script>
