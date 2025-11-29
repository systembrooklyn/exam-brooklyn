<template>
  <div class="space-y-4 min-w-4xl">
    <div
      class="flex items-center gap-2 text-indigo-800 font-bold text-lg cursor-pointer select-none"
      @click="toggleSort('due_date')"
    >
      Sort by Due Date
      <span>
        <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
        <ArrowDownUp v-else :size="16" />
      </span>
    </div>

    <div
      v-for="(row, rowIndex) in sortedData"
      :key="rowIndex"
      class="bg-white p-3 rounded-lg shadow-md border border-gray-200"
    >
      <div class="flex justify-between items-center space-x-4">
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-1">Amount</h4>
          <p class="text-xl font-bold text-indigo-600">
            {{ displayValue(row.amount) }} EGP
          </p>
          <div>
            <span class="font-medium text-gray-800">Due Date:</span>
            {{ formatDate(row.due_date) }}
          </div>
        </div>
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-1">Paid Amount</h4>
          <p class="text-lg font-semibold text-green-600">
            {{ row.paid_amount }} EGP
          </p>
          <div>
            <span class="font-medium text-gray-800">Paid on:</span>
            {{ formatDate(row.paid_date) }}
          </div>
        </div>
        <div>
          <span
            :class="[ 
              'px-3 py-1 rounded-full text-sm font-medium text-white',
              {
                'bg-green-500': row.status === 'paid',
                'bg-red-500': row.status === 'unpaid',
                'bg-yellow-400 text-black': row.status === 'partialPaid',
              },
            ]"
          >
            {{ row.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";
import { ref, computed } from "vue";
import formatDate from "../../global/FormDate";
import { useDateSort } from "../../global/useDateSort"; 

const props = defineProps({
  data: { type: Array, default: () => [] },
});


const sortOrder = ref("asc"); 
const sortField = ref("due_date");

const { sortByDate } = useDateSort();

function toggleSort(field) {
  
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc"; 
  }
}

const sortedData = computed(() => {
  return sortByDate(props.data, sortField.value, sortOrder.value);
});

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>
