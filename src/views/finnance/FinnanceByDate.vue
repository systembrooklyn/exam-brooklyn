<script setup >
import { onMounted, ref, computed } from 'vue';
import FinnanceTable from '../../components/finnance-dahboard/FinnanceTable.vue';
import { useDeadlinesStore } from '../../stores/srmStore/DeadlinesStore';

const loading = ref(false);
const deadlinesStore = useDeadlinesStore();

onMounted(async () => {
  loading.value = true;
  const data = { fresh: 0 };
  try {
    await deadlinesStore.fetchDeadlines(data);
    console.log('Deadlines fetched:', deadlinesStore.deadlines);
    console.log('Grouped Deadlines by Date:', deadlinesStore.groupedByDate);
  } catch (error) {
    console.error('Error fetching deadlines:', error);
  } finally {
    loading.value = false;
  }
});

const myHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'budget', label: 'Budget' },
  { key: 'paid', label: 'Paid' },
  { key: 'unpaid', label: 'Unpaid' },   // ✅ خليتها unpaid مش upaid
  { key: 'cancellation', label: 'Cancellation' }
]

// نربط الجدول مباشرة بالـ computed من الـ store
const tableData = computed(() => deadlinesStore.groupedByDate);
</script>

<template>
  <h1 class="text-2xl font-bold mb-3">Finance - By Date</h1>
  <FinnanceTable
    :data="tableData"
    :headers="myHeaders"
    :loading="loading"
  />
</template>
