<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  cardName: String,
  headers: Array,
  data: Array,
  loading: Boolean,
});

console.log("CardDetails props:", props.data);

const currentPage = ref(1);
const pageSize = 12; // Number of items per page

const totalPages = computed(() => Math.ceil(props.data?.length / pageSize) || 1);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.data ? props.data.slice(start, start + pageSize) : [];
});

const pageNumbers = computed(() => {
  const pages = [];
  const total = totalPages.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, "...", total);
    } else if (currentPage.value >= total - 2) {
      pages.push(1, "...", total - 2, total - 1, total);
    } else {
      pages.push(1, "...", currentPage.value, "...", total);
    }
  }

  return pages;
});

const hasData = computed(() => props.data && props.data.length > 0);

function goToPage(page) {
  if (page === "...") return;
  currentPage.value = page;
}
</script>

<template>
  <div class="p-6">
    <h1 v-if="cardName" class="text-2xl text-center font-bold mb-10">
      Details:
      <span class="text-indigo-600">{{ cardName.toLocaleUpperCase() }}</span>
    </h1>

    <div v-if=" loading ">
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    </div>

    <div v-else-if="!hasData">
      <img class="mx-auto h-80 mt-10" src="@/assets/undraw_empty_4zx0.png" alt="No Data" />
      <p class="text-center mt-4 font-semibold text-gray-500">No Data Found</p>
    </div>

    <div v-else>
      <table class="min-w-full border border-gray-300 text-center">
        <thead>
          <tr class="bg-gray-300 text-primary text-lg">
            <th v-for="col in headers" :key="col" class="border border-blue-300 px-4 py-3 capitalize">
              {{ col.replace(/_/g, " ") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index" class="hover:bg-gray-50">
            <td v-for="col in headers" :key="col" class="border border-gray-300 px-4 py-2">
              <span v-if="col === 'status'">
                <span
                  :class="{
                    'text-green-600 font-semibold': row[col] === 'paid',
                    'text-red-600 font-semibold': row[col] === 'unpaid',
                    'text-yellow-500 font-semibold': row[col] === 'partialPaid',
                  }"
                >
                  {{ row[col] }}
                </span>
              </span>

              <span v-else-if="col === 'total_lec'">
                {{ row.type === 'online' ? 0 : row[col] ?? '' }}
              </span>
              <span v-else-if="col === 'paid_date'">
                {{ row.status === 'paid' ? row[col] : '-' }}
              </span>

              <span v-else>{{ row[col] ?? '' }}</span>
            </td>
          </tr>
        </tbody>
      </table>

     <div v-if="cardName === 'Invoices'" class="mt-6 flex justify-center items-center space-x-2">

        <button
          @click="currentPage.value--"
          :disabled="currentPage.value === 1"
          class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          previous
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          @click="goToPage(page)"
          class="px-3 py-1 border rounded"
          :class="{
            'bg-indigo-600 text-white': page === currentPage.value,
            'bg-white text-gray-700 hover:bg-gray-100': page !== currentPage.value,
            'cursor-default': page === '...',
          }"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>

        <button
          @click="currentPage.value++"
          :disabled="currentPage.value === totalPages.value"
          class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          next
        </button>
      </div>
    </div>
  </div>
</template>
