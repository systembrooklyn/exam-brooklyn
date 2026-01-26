<script setup>
import { ref, computed } from "vue";
import StudentInfoPanel from "@/components/Reservation/StudentInfoPanel.vue";
import ModulesTable from "@/components/Reservation/ModulesTable.vue";
import FinalCasePanel from "@/components/Reservation/FinalCasePanel.vue";
import ActionButtons from "@/components/Reservation/ActionButtons.vue";

const showFinalCase = ref(false);

const form = ref({
  name: "",
  grade: "",
  scholarship: "",
  studentType: "",
  studyType: "",
  paymentMethod: "",
  papers: [],
  nationality: "",
  offers: "",
  finalCase: "",
  finalAmount: "",
  notes: "",
});

const modules = ref([
  {
    name: "Administration & Management",
    code: "5006",
    startDate: "27/12/2025",
    day: "Sat",
    time: "10 to 3",
    amount: 3000,
    deadline: "26 Dec 2025",
  },
  {
    name: "Strategic Planning",
    code: "5007",
    startDate: "28/12/2025",
    day: "Sun",
    time: "12 to 4",
    amount: 3500,
    deadline: "27 Dec 2025",
  },
  {
    name: "Financial Accounting",
    code: "5008",
    startDate: "29/12/2025",
    day: "Mon",
    time: "09 to 2",
    amount: 4000,
    deadline: "28 Dec 2025",
  },
  {
    name: "Human Resources",
    code: "5009",
    startDate: "30/12/2025",
    day: "Tue",
    time: "11 to 3",
    amount: 3200,
    deadline: "29 Dec 2025",
  },
  {
    name: "Marketing Principles",
    code: "5010",
    startDate: "31/12/2025",
    day: "Wed",
    time: "10 to 1",
    amount: 2800,
    deadline: "30 Dec 2025",
  },
  {
    name: "Business Ethics",
    code: "5011",
    startDate: "01/01/2026",
    day: "Thu",
    time: "09 to 12",
    amount: 2500,
    deadline: "31 Dec 2025",
  },
  {
    name: "Project Management",
    code: "5012",
    startDate: "02/01/2026",
    day: "Fri",
    time: "14 to 18",
    amount: 4500,
    deadline: "01 Jan 2026",
  },
]);

const submitForm = () => {
};
</script>

<template>
  <div class="p-4 relative">
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-3">
        <StudentInfoPanel v-model="form" />
      </div>
      <div class="col-span-9 flex flex-col h-full">
        <ModulesTable :modules="modules" />

        <div class="mt-4 flex justify-end">
          <button
            @click="showFinalCase = true"
            class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg text-lg flex items-center gap-2"
          >
            <span>Next Step</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showFinalCase"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      @click.self="showFinalCase = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 p-6 relative"
      >
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">Final Case Details</h2>
          <button
            @click="showFinalCase = false"
            class="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <FinalCasePanel v-model="form" />

          <div class="pt-4 border-t">
            <ActionButtons @submit="submitForm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
