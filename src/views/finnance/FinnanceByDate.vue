<script setup >
import { ref } from 'vue';
import FinnanceTable from '../../components/finnance-dahboard/FinnanceTable.vue';

const loading = ref(false);

const myHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'budget', label: 'Budget' },
  { key: 'paid', label: 'Paid' },
  { key: 'upaid', label: 'Upaid' },
  { key: 'cancellation', label: 'Cancellation' }
]
const myData = [
 { date: '7/30/2025', budget: 4472, paid: 2250, upaid: 2222, cancellation: 564564},
  { date: '8/1/2025', budget: 6263, paid: 6263, upaid: 64646, cancellation: 6464},
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
  { date: '8/2/2025', budget: 28913, paid: 28913, upaid: 6546, cancellation: 4285 },
]



</script>

<template>
  <h1 class="text-2xl font-bold mb-3">Finance  - By Date</h1>
  <FinnanceTable
    :data="myData"
    :headers="myHeaders"
    :loading="loading"
    @edit="editItem"
    @delete="deleteItem"
  />
</template>
    
   