<script setup>
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const placementExamStore = usePlacementTestsExamStore();
const selectedModule = ref("");
const loading = ref(false);
const isLoading = ref(true);
const router = useRouter();

const startExam = async () => {
  try {
    loading.value = true;
    await placementExamStore.fetchPlacementExam(selectedModule.value);
    // Redirect to the exam page
    router.push({name: "placement-exam" });

  } catch (error) {
    console.error("Error starting exam:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  await placementExamStore.getStudentPlacement();
  isLoading.value = false;
});
</script>

<template>
  <div class="back min-h-screen flex items-center justify-center relative">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black opacity-80"></div>

    <!-- Container محتوى الصفحة -->
    <div class="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl text-center max-w-xl mx-auto w-full transition-all">
      
      <!-- صورة تمثيلية -->
      <img 
        src="@/assets/logo.png" 
        alt="Exam Ready" 
        class="w-24 h-24 mx-auto mb-6 opacity-90"
      />

      <!-- حالة التحميل -->
      <div v-if="isLoading" class="text-gray-700 dark:text-gray-300">
        <p>Loading modules...</p>
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
      </div>

      <!-- بعد الانتهاء من التحميل -->
      <div v-else>
        <!-- العنوان -->
       

        <!-- حالة: لو فيه Modules -->
        <div v-if="placementExamStore.studentPlacement?.length > 0">
           <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
          Let's Start Your Exam
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Choose a module to begin your placement test.
        </p>
          <div class="mb-6">
            <label for="module" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Module
            </label>
            <select
              v-model="selectedModule"
              id="module"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option disabled value="">Choose a Module</option>
              <option v-for="place in placementExamStore.studentPlacement" :key="place.id" :value="place.id">
                {{ place.name }}
              </option>
            </select>
          </div>

          <!-- زرار البدء -->
          <button
            :disabled="!selectedModule || loading"
            @click="startExam"
            class="bg-primary hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 w-full"
          >
            <span
              v-if="loading"
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span v-else>Start Exam</span>
          </button>
        </div>

       
        <div v-else class="text-center">
          <p class="text-green-600 dark:text-green-400 text-lg font-medium mb-4">
            Congratulations! You've completed all your placement exams.
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            There are no more modules available for testing at this time.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back {
  background-image: url('@/assets/hero.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* ثابت أثناء التمرير */
}
</style>