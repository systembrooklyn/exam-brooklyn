<script setup>
import { usePlacementTestsExamStore } from "@/stores/placementTestsExamStore";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import notyf from "@/components/global/notyf";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  PlayCircle,
  RotateCcw,
} from "lucide-vue-next";

const placementExamStore = usePlacementTestsExamStore();
const loadingModuleId = ref(null);
const isLoading = ref(true);
const needsRegistration = ref(false);
const loadError = ref(false);
const router = useRouter();

const modules = computed(() => placementExamStore.examModules || []);
const pendingCount = computed(
  () => modules.value.filter((m) => m.status !== "completed").length
);
const allCompleted = computed(
  () => modules.value.length > 0 && pendingCount.value === 0
);

const refreshModules = async () => {
  isLoading.value = true;
  loadError.value = false;
  needsRegistration.value = false;
  try {
    const result = await placementExamStore.getStudentPlacement();
    if (result?.needsRegistration) {
      needsRegistration.value = true;
    } else if (result?.error) {
      loadError.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};

const goToRegistration = () => {
  router.push({ name: "placement-test" });
};

const startExam = async (module) => {
  if (module.disabled || loadingModuleId.value) return;

  loadingModuleId.value = module.id;
  try {
    await placementExamStore.fetchPlacementExam(module.id);
    router.push({ name: "placement-exam" });
  } catch (error) {
    console.error("Error starting exam:", error);
    notyf.error("Could not start the exam. Check your connection and try again.");
  } finally {
    loadingModuleId.value = null;
  }
};

const finishAll = () => {
  Cookies.remove("st_id");
  router.push({ name: "SystemsPage" });
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    refreshModules();
  }
};

const cardActionLabel = (module) => {
  if (loadingModuleId.value === module.id) return "Loading…";
  if (module.status === "completed") return "Completed";
  if (module.status === "in_progress") return "Continue Exam";
  return "Start Exam";
};

const cardIcon = (module) => {
  if (module.status === "completed") return CheckCircle2;
  if (module.status === "in_progress") return RotateCcw;
  return PlayCircle;
};

onMounted(async () => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
  await refreshModules();
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div class="back min-h-screen relative py-12 px-4 sm:px-6">
    <div class="absolute inset-0 bg-black/65"></div>

    <div class="relative z-10 max-w-4xl mx-auto w-full">
      <img
        src="@/assets/logo.png"
        alt="Exam Ready"
        class="w-24 h-24 mx-auto mb-8 drop-shadow-lg"
      />

      <div v-if="isLoading" class="text-center text-white">
        <p class="text-lg">Loading modules…</p>
        <Loader2 class="w-8 h-8 text-white animate-spin mx-auto mt-4" />
      </div>

      <div v-else>
        <!-- All exams completed -->
        <div v-if="allCompleted" class="text-center">
          <img
            src="@/assets/congratulations.png"
            alt="All exams completed"
            class="w-48 mx-auto mb-6 drop-shadow-xl"
          />
          <h2 class="text-3xl font-extrabold text-white mb-3 drop-shadow">
            Congratulations!
          </h2>
          <p class="text-white/90 mb-8 text-lg">
            You have successfully completed all your placement exams.
          </p>
          <button
            type="button"
            @click="finishAll"
            class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200 cursor-pointer"
          >
            Go to Home
          </button>
        </div>

        <!-- Exam cards -->
        <div v-else-if="modules.length > 0">
          <div class="text-center mb-10">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-3 drop-shadow">
              Placement Exams
            </h2>
            <p class="text-white/90 text-lg max-w-xl mx-auto">
              Choose an exam to start or continue. Complete each one before moving to the next.
            </p>
            <p class="text-sm text-blue-200 mt-3 font-semibold">
              {{ pendingCount }} exam{{ pendingCount === 1 ? "" : "s" }} remaining
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              v-for="module in modules"
              :key="module.id"
              type="button"
              :disabled="module.disabled || loadingModuleId != null"
              @click="startExam(module)"
              class="group relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-200 min-h-[140px] backdrop-blur-sm shadow-lg disabled:cursor-not-allowed"
              :class="[
                module.status === 'completed'
                  ? 'border-green-400/60 bg-white/90 cursor-not-allowed opacity-75'
                  : module.status === 'in_progress'
                    ? 'border-amber-400 bg-white/95 hover:border-amber-500 hover:shadow-xl cursor-pointer'
                    : 'border-white/40 bg-white/90 hover:border-blue-400 hover:shadow-xl cursor-pointer',
                loadingModuleId === module.id ? 'opacity-70 cursor-wait' : '',
              ]"
            >
              <div class="flex items-center gap-3 w-full mb-3">
                <div
                  class="p-2 rounded-lg shrink-0"
                  :class="
                    module.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : module.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                  "
                >
                  <BookOpen v-if="module.status === 'available'" class="w-5 h-5" />
                  <CheckCircle2
                    v-else-if="module.status === 'completed'"
                    class="w-5 h-5"
                  />
                  <RotateCcw
                    v-else-if="module.status === 'in_progress'"
                    class="w-5 h-5"
                  />
                </div>
                <h3
                  class="font-bold text-lg text-gray-900 dark:text-white flex-1 leading-tight"
                >
                  {{ module.name }}
                </h3>
              </div>

              <span
                class="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                :class="
                  module.status === 'completed'
                    ? 'text-green-600'
                    : module.status === 'in_progress'
                      ? 'text-amber-600'
                      : 'text-blue-600 group-hover:text-blue-700'
                "
              >
                <Loader2
                  v-if="loadingModuleId === module.id"
                  class="w-4 h-4 animate-spin"
                />
                <component
                  v-else
                  :is="cardIcon(module)"
                  class="w-4 h-4"
                />
                {{ cardActionLabel(module) }}
              </span>

              <span
                v-if="module.status === 'completed'"
                class="absolute top-3 right-3 text-xs font-bold uppercase tracking-wide text-green-600 bg-green-100 px-2 py-0.5 rounded-full"
              >
                Done
              </span>
              <span
                v-else-if="module.status === 'in_progress'"
                class="absolute top-3 right-3 text-xs font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
              >
                In progress
              </span>
            </button>
          </div>

          <p class="text-xs text-white/70 text-center mt-8">
            Your answers are saved automatically. If you leave or lose connection, you can return and continue.
          </p>
        </div>

        <!-- Not registered / missing student session -->
        <div v-else-if="needsRegistration" class="text-center max-w-md mx-auto">
          <h2 class="text-2xl font-bold text-white mb-3 drop-shadow">
            Start from registration
          </h2>
          <p class="text-white/90 mb-6">
            Enter your email on the placement test page first so we can load your exams.
          </p>
          <button
            type="button"
            @click="goToRegistration"
            class="bg-primary text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:opacity-90 transition cursor-pointer"
          >
            Go to Placement Test
          </button>
        </div>

        <!-- API error -->
        <div v-else-if="loadError" class="text-center max-w-md mx-auto">
          <p class="text-red-200 mb-4 text-lg">
            Could not load your exams. Check your connection and try again.
          </p>
          <button
            type="button"
            @click="refreshModules"
            class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg cursor-pointer"
          >
            Retry
          </button>
        </div>

        <div v-else class="text-center text-white/90 max-w-md mx-auto">
          <p class="mb-4 text-lg">No placement exams are assigned to your account.</p>
          <button
            type="button"
            @click="goToRegistration"
            class="text-blue-200 underline hover:text-white cursor-pointer"
          >
            Back to registration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back {
  background-image: url("@/assets/hero.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
</style>
