<script setup>
import { computed, onMounted, ref } from "vue";
import FinnanceTable from "../../components/finnance-dahboard/FinnanceTable.vue";
import { useDeadlinesStore } from "../../stores/finnance/DeadlinesStore";

const deadlinesStore = useDeadlinesStore();
const deadlines = computed(() => deadlinesStore.deadlines);
const loading = ref(false);

const headers = [
  { key: "amount", label: "Amount", class: "bg-yellow-50" },
  { key: "due_date", label: "Date", class: "bg-orange-50" },
  { key: "student.st_num", label: "Student No", class: "bg-yellow-50" },
  { key: "paid_amount", label: "Paid Amount", class: "bg-green-50" },
  { key: "unpaid", label: "Unpaid", class: "bg-red-50" },
  { key: "student.name", label: "Name", class: "bg-blue-50" },
  { key: "student.email", label: "Email", class: "bg-indigo-50" },
  { key: "student.phones", label: "Phone", class: "bg-gray-50" },
  { key: "student.StudyType", label: "Study Type", class: "bg-amber-50" },
];

const getAfterTwoDays = () => {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  return today.toISOString().split("T")[0];
};

onMounted(async () => {
  loading.value = true;

  const afterTwoDays = getAfterTwoDays();
  const data = { fresh: 0, from: afterTwoDays, to: afterTwoDays };

  await deadlinesStore.fetchDeadlines(data);

  loading.value = false;
});

const tableData = computed(() => {
  if (!Array.isArray(deadlines.value)) return [];
  return deadlines.value.map((item) => {
    const amount = Number(item.amount) || 0;
    const paid = Number(item.paid_amount) || 0;

    return {
      ...item,
      unpaid: amount - paid,
    };
  });
});
</script>

<template>


  <FinnanceTable :data="tableData" :headers="headers" :loading="loading" />
</template>
