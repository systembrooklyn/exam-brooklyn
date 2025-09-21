<script setup>
import { ref, onMounted, computed } from "vue";
import FinnanceTable from "../../components/finnance-dahboard/FinnanceTable.vue";
import { useDeadlinesStore } from "../../stores/srmStore/DeadlinesStore";

const deadlinesStore = useDeadlinesStore();

const loading = ref(false);
const selectedDate = ref(""); 

const headers = [
  { key: "student.name", label: "Name" },
  { key: "student.email", label: "Email" },
  { key: "student.phones", label: "Phone" },
  { key: "due_date", label: "Date" },
  { key: "amount", label: "Amount" },
];


const fetchData = async () => {
  loading.value = true;
  const data = {
    fresh: 1,
    status: "unpaid",
    from: selectedDate.value || null,
    to: selectedDate.value || null,
  };
  try {
    await deadlinesStore.fetchDeadlines(data);
  } catch (error) {
    console.error("Error fetching deadlines:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const tableData = computed(() => deadlinesStore.deadlines);
</script>

<template>
  <h1 class="text-2xl font-bold mb-3">Unpaid Invoices</h1>

  <div class="flex gap-2 mb-4">
    <input
      type="date"
      v-model="selectedDate"
      class="border rounded px-2 py-1"
    />
    <button
      @click="fetchData"
      class="bg-primary cursor-pointer  text-white px-4 py-1 rounded"
    >
      Filter
    </button>
  </div>

  <FinnanceTable
    :data="tableData"
    :headers="headers"
    :loading="loading"
    :sortKey="'due_date'"
    sort-order="asc"
    :dateKey="'due_date'"
    :highlightKeys="['amount']"
    :highlightDateKeys="['amount']" 
  />
</template>
