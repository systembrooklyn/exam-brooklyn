<script setup>
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { ref, onMounted } from "vue";

const placementExamStore = usePlacementTestsExamStore();
const selectedModule = ref("");
const loading = ref(false);

const startExam = async () => {
  try {
    loading.value = true;
    await placementExamStore.fetchPlacementExam(selectedModule.value);
  } catch (error) {
    console.error("Error starting exam:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  placementExamStore.getStudentPlacement();
});
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center max-w-xl mx-auto">
    <!-- الصورة -->
    <img src="" alt="Ready Image" class="w-32 h-32 mx-auto mb-4" />

    <!-- الجملة -->
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
      Ready to start your exam?
    </h2>
    <p class="text-gray-600 dark:text-gray-300 mb-6">
      Please choose the module you'd like to begin with.
    </p>

    <!-- select -->
    <div class="mb-6">
      <label for="module" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Module
      </label>
      <select
        v-model="selectedModule"
        id="module"
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
      >
        <option disabled value="">Choose a Module</option>
        <option v-for="place in placementExamStore.studentPlacement" :key="place.id" :value="place.id">
          {{ place.name }}
        </option>
      </select>
    </div>

 <!-- الزرار -->
<button
  :disabled="!selectedModule || loading"
  @click="startExam"
  class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
>
  <span
    v-if="loading"
    class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
  ></span>
  <span v-else>Start Exam</span>
</button>

  </div>
</template>


