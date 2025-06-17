<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg- p-6 text-center"
  >
    <img src="@/assets/done.png" alt="Business Success" class="w-100 mb-6" />

    <h1 class="text-3xl md:text-4xl font-bold text-primary mb-4">
      You Have Successfully Completed The Exam!
    </h1>
    <p class="text-lg text-gray-700 mb-6">
      Thank you for participating in the test. Your results will be reviewed
      shortly.
    </p>

    <!-- Select Exam -->
    <select
      v-model="selectedExamId"
      class="w-full max-w-md border px-3 py-2 rounded-md mb-6 focus:outline-none focus:border-indigo-500"
    >
      <option disabled value="">Select Next Exam</option>
      <option
        v-for="exam in exams"
        :key="exam.id"
        :value="exam.id"
        :disabled="exam.id === startedExamId"
        :class="{ 'text-gray-400': exam.id === startedExamId }"
      >
        {{ exam.name }}
        <span v-if="exam.id === startedExamId">(Completed)</span>
      </option>
    </select>

    <!-- Next Exam Button -->
    <!-- Next Exam Button -->
    <button
      @click="handleNextExam"
      :disabled="!selectedExamId"
      class="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <span
        v-if="loadingExam"
        class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
      ></span>
      <span>{{ loadingExam ? "Starting..." : "Start Next Exam" }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePlacementTestsStore } from "@/stores/placementTestsStore";
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

const placementStore = usePlacementTestsStore();
const placementExamStore = usePlacementTestsExamStore();
const exams = ref([]);
const selectedExamId = ref("");
const startedExamId = ref(null);
const router = useRouter();
const loadingExam = ref(false);

onMounted(async () => {
  await placementStore.fetchPlacementTests();
  exams.value = placementStore.placementTests;

  // ✅ Read the previously started exam ID
  const storedId = localStorage.getItem("startedExamId");
  if (storedId) startedExamId.value = Number(storedId);
});

const handleNextExam = async () => {
  if (selectedExamId.value) {
    loadingExam.value = true;
    const st_num = Number(Cookies.get("st_id")) || 0;
    try {
      await placementExamStore.fetchPlacementExam(selectedExamId.value, st_num);

      router.push({
        name: "placement-exam",
      });
    } catch (error) {
      console.error("Error fetching exam:", error);
    } finally {
      loadingExam.value = false;
    }
  }
};
</script>

<style scoped>
/* تقدر تضيف استايل إضافي هنا لو حبيت */
</style>
