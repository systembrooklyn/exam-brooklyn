<script setup>
import { ref, onMounted, computed } from "vue";
import FinnanceTable from "../../components/finnance-dahboard/FinnanceTable.vue";
import { useDeadlinesStore } from "../../stores/srmStore/DeadlinesStore";

const deadlinesStore = useDeadlinesStore();

const loading = ref(false);

const headers = [
  { key: "amount", label: "Amount" },
  { key: "due_date", label: "Date" },
  { key: "student.st_num", label: "Student No" },
  { key: "paid_amount", label: "Paid Amount" },
  { key: "unpaid", label: "Unpaid" },
  { key: "student.name", label: "Name" },
  { key: "student.email", label: "Email" },
  { key: "student.phones", label: "Phone" },
  { key: "student.StudyType", label: "Study Type" },
];

onMounted(async () => {
  loading.value = true;
  const data = { fresh: 0, status: ["unpaid", "partialPaid"] };
  try {
    await deadlinesStore.fetchDeadlines(data);
  } catch (error) {
    console.error("Error fetching deadlines:", error);
  } finally {
    loading.value = false;
  }
});

const tableData = computed(() => {
  return deadlinesStore.deadlines.map((item) => {
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
  <h1 class="text-2xl font-bold mb-4">Unpaid Invoices</h1>

  <FinnanceTable
    :data="tableData"
    :headers="headers"
    :loading="loading"
    sort-order="asc"
    :dateKey="'due_date'"
    :highlightKeys="['unpaid']"
    :highlightDateKeys="['amount']" 
  />
</template>
