<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)] bg-opacity-40 backdrop-blur-sm z-50"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl p-6 w-[80%] max-h-[90vh] overflow-y-auto animate-slideUp"
      >
        <h2
          class="text-xl font-bold mb-5 text-indigo-600 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Select a Student
        </h2>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm text-center border-collapse">
            <thead class="bg-indigo-50 text-indigo-700">
              <tr>
                <th class="px-3 py-2 text-center">#</th>
                <th class="px-3 py-2">Name</th>
                <th class="px-3 py-2">Student No</th>
                <th class="px-3 py-2">ID Number</th>
                <th class="px-3 py-2">Email</th>
                <th class="px-3 py-2">Phones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in paginatedStudents"
                :key="student.id"
                class="hover:bg-indigo-50 transition-colors even:bg-gray-50"
              >
                <td class="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="radio"
                    name="selectedStudent"
                    :value="student"
                    v-model="selected"
                    class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                </td>

                <td class="px-3 py-2 font-medium">{{ student.name }}</td>
                <td class="px-3 py-2">{{ student.st_num }}</td>
                <td class="px-3 py-2">{{ student.ID_number }}</td>
                <td class="px-3 py-2">{{ student.email }}</td>
                <td class="px-3 py-2">{{ student.phones?.join(" / ") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="students.length > studentsPerPage"
          :currentPage="currentPage"
          :questionsPerPage="studentsPerPage"
          :totalQuestions="students.length"
          :totalPages="totalPages"
          :goToPage="goToPage"
        />
        <!-- Buttons -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="$emit('update:visible', false)"
            class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmSelection"
            class="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition"
            :disabled="!selected"
            :class="{ 'opacity-50 cursor-not-allowed': !selected }"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Pagination from "../pages/Pagination.vue";

const props = defineProps({
  visible: Boolean,
  students: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:visible", "confirm"]);

const selected = ref(null);

// pagination state
const currentPage = ref(1);
const studentsPerPage = 10;

const totalPages = computed(() =>
  Math.ceil(props.students.length / studentsPerPage)
);

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * studentsPerPage;
  return props.students.slice(start, start + studentsPerPage);
});

const goToPage = (page) => {
  currentPage.value = page;
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      selected.value = null;
      currentPage.value = 1;
    }
  }
);

const confirmSelection = () => {
  if (selected.value) {
    emit("confirm", selected.value);
    emit("update:visible", false);
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-slideUp {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
