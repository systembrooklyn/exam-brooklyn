<script setup>
import { ref, computed } from 'vue';
import StudentInfoPanel from '@/components/Reservation/StudentInfoPanel.vue';
import ModulesTable from '@/components/Reservation/ModulesTable.vue';
import FinalCasePanel from '@/components/Reservation/FinalCasePanel.vue';
import ActionButtons from '@/components/Reservation/ActionButtons.vue';


// ---------------------- GLOBAL STATE --------------------
const form = ref({
  name: '',
  grade: '',
  scholarship: '',
  studentType: '',
  studyType: '',
  paymentMethod: '',
  papers: [],
  nationality: '',
  offers: '',
  finalCase: '',
  finalAmount: '',
  notes: ''
});

// Dynamic modules (يتغيروا حسب الاختيارات)
const modules = ref([
  {
    name: "Administration & Management",
    code: "5006",
    startDate: "27/12/2025",
    day: "Sat",
    time: "10 to 3",
    amount: 3000,
    deadline: "26 Dec 2025"
  },
  {
    name: "Strategic Planning",
    code: "5007",
    startDate: "28/12/2025",
    day: "Sun",
    time: "12 to 4",
    amount: 3500,
    deadline: "27 Dec 2025"
  },
  {
    name: "Financial Accounting",
    code: "5008",
    startDate: "29/12/2025",
    day: "Mon",
    time: "09 to 2",
    amount: 4000,
    deadline: "28 Dec 2025"
  },
  {
    name: "Human Resources",
    code: "5009",
    startDate: "30/12/2025",
    day: "Tue",
    time: "11 to 3",
    amount: 3200,
    deadline: "29 Dec 2025"
  },
  {
    name: "Marketing Principles",
    code: "5010",
    startDate: "31/12/2025",
    day: "Wed",
    time: "10 to 1",
    amount: 2800,
    deadline: "30 Dec 2025"
  },
  {
    name: "Business Ethics",
    code: "5011",
    startDate: "01/01/2026",
    day: "Thu",
    time: "09 to 12",
    amount: 2500,
    deadline: "31 Dec 2025"
  },
  {
    name: "Project Management",
    code: "5012",
    startDate: "02/01/2026",
    day: "Fri",
    time: "14 to 18",
    amount: 4500,
    deadline: "01 Jan 2026"
  }
]);

// Submit
const submitForm = () => {
  console.log("Final Data:", form.value);
};
</script>

<template>
  <div class="p-4 grid grid-cols-12 gap-4">

    <!-- LEFT PANEL -->
    <div class="col-span-3">
      <StudentInfoPanel v-model="form" />
    </div>

    <!-- TABLE -->
    <div class="col-span-6">
      <ModulesTable :modules="modules" />
    </div>

    <!-- RIGHT PANEL -->
    <div class="col-span-3 space-y-4">
      <FinalCasePanel v-model="form" />
      <ActionButtons @submit="submitForm" />
    </div>

  </div>
</template>
