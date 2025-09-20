<script setup >
import { ref  , onMounted ,computed } from 'vue';
import FinnanceTable from '../../components/finnance-dahboard/FinnanceTable.vue';
import { useDeadlinesStore } from '../../stores/srmStore/DeadlinesStore';



const deadlinesStore = useDeadlinesStore();



const loading = ref(false);

const headers = [
  { key: 'amount', label: 'Amount', class: 'bg-yellow-50' },
  { key: 'due_date', label: 'Date', class: 'bg-orange-50' },
  { key: 'student.st_num', label: 'Student No', class: 'bg-yellow-50' },
  { key: 'paid_amount', label: 'Paid Amount', class: 'bg-green-50' },
  { key: 'unpaid', label: 'Unpaid', class: 'bg-red-50' },
  { key: 'student.name', label: 'Name', class: 'bg-blue-50' },
  { key: 'student.email', label: 'Email', class: 'bg-indigo-50' },
  { key: 'student.phones', label: 'Phone', class: 'bg-gray-50' },
  { key: 'student.scholar_status', label: 'Study Type', class: 'bg-amber-50' }
]

onMounted(async () => {
  loading.value = true;
  const data = { fresh: 0 , status: 'unpaid'};
  try {
    await deadlinesStore.fetchDeadlines(data);
  } catch (error) {
    console.error('Error fetching deadlines:', error);
  } finally {
    loading.value = false;
  }
});
const tableData = computed(() => deadlinesStore.deadlines);

</script>

<template>
    <h1 class="">Unpaid Invoices</h1>

    <FinnanceTable
      :data="tableData"
      :headers="headers"
      :loading="loading"
    
    />
   
</template>