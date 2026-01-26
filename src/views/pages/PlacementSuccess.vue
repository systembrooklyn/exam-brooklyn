<template>
  <div class="flex items-center justify-center p-10">
    <!-- Container المحتوى -->
    <div>
      <!-- حالة التحميل -->
      <div v-if="isLoading" class="text-gray-700 dark:text-gray-300">
        <div
          class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"
        ></div>
      </div>

     
      <div v-else>
       
        <div v-if="exams.length === 0" class="text-center">
          <img
            src="@/assets/congratulations.png"
            alt="Exam Completed"
            class="w-60 mx-auto mb-6 opacity-90"
          />
          <h1
            class="text-3xl font-extrabold text-green-500 dark:text-white mb-3"
          >
            Congratulations!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            You have successfully completed all your placement exams.
          </p>
          <button
            class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
            @click="finsh"
          >
            Go to Home
          </button>
        </div>

        <!-- حالة: فيه امتحانات باقيه -->
        <div v-else>
          <!-- صورة التهاني -->
          <img
            src="@/assets/done.png"
            alt="Exam Completed"
            class="w-60 mx-auto mb-6 opacity-90"
          />

          <h1
            class="text-3xl font-extrabold text-gray-900 dark:text-white mb-3"
          >
            Ready for the next exam?
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Please choose the next module you'd like to take.
          </p>

          <!-- Select Module -->
          <div class="mb-6">
            <label
              for="exam"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Next Exam
            </label>
            <select
              v-model="selectedExamId"
              id="exam"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option disabled value="">Choose an Exam</option>
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.name }}
              </option>
            </select>
          </div>

          <!-- زرار بدء الامتحان التالي -->
          <button
            :disabled="!selectedExamId || loadingExam"
            @click="handleNextExam"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 w-full"
          >
            <span
              v-if="loadingExam"
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span v-else>Start Next Exam</span>
          </button>
        </div>
      </div>
    </div>
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
const router = useRouter();
const loadingExam = ref(false);
const isLoading = ref(true); // حالة التحميل

onMounted(async () => {
  try {
    await placementExamStore.getStudentPlacement(); // انتظر حتى تنتهي

    // خزن القيم بعد التأكد من أنها جاهزة
    exams.value = placementExamStore.studentPlacement || [];
  } catch (error) {
    console.error("Error fetching student placement:", error);
    exams.value = []; // في حال حدوث خطأ، اعتبر أنه مفيش امتحانات
  } finally {
    isLoading.value = false; // ضمان توقف اللودينج
  }
});

const handleNextExam = async () => {
  if (!selectedExamId.value) return;

  loadingExam.value = true;
  const st_num = Number(Cookies.get("st_id")) || 0;

  try {
    await placementExamStore.fetchPlacementExam(selectedExamId.value, st_num);

    router.push({
      name: "placement-exam",
    });
  } catch (error) {
    console.error("Error starting next exam:", error);
  } finally {
    loadingExam.value = false;
  }
};

const finsh = () => {
  // Clear cookies and redirect to home
  Cookies.remove("st_id");
  router.push({ name: "SystemsPage" });
};
</script>
