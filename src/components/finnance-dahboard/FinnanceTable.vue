<!-- SimpleTable.vue -->
<template>
  <div class="w-[calc(100vw-300px)]">
    <div class="bg-white rounded-2xl shadow-lg w-full h-full flex flex-col">
      <!-- Search Input -->
      <div v-if="searchable" class="p-4 flex-shrink-0">
        <div
          class="w-full flex items-center gap-2 border shadow-md border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-indigo-500"
        >
          <Search size="17" class="text-primary" />
          <input
            v-model="search"
            type="text"
            :placeholder="searchPlaceholder"
            class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="flex justify-center items-center py-20 flex-1">
        <div
          class="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10"
        ></div>
      </div>

      <!-- Table -->
      <div v-else class="flex-1 overflow-hidden">
        <div class="w-full h-full overflow-x-auto overflow-y-auto">
          <table class="w-full min-w-full text-center">
            <thead class="sticky top-0 z-10">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.key"
                  class="px-4 py-3 text-center text-primary text-lg bg-indigo-100 font-bold whitespace-nowrap"
                >
                  {{ header.label }}
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- Data Rows -->
              <tr
                v-for="(item, index) in paginatedData"
                :key="getRowKey(item, index)"
                class="hover:bg-gray-50"
              >
                <td
                  v-for="header in headers"
                  :key="header.key"
                  :class="[ 
                    'px-4 py-4 text-gray-600 whitespace-nowrap',
                    index !== paginatedData.length - 1 ? 'border-b' : '',
                  ]"
                >
                  <slot
                    :name="`cell-${header.key}`"
                    :item="item"
                    :value="getValueByPath(item, header.key)"
                    :header="header"
                    :index="index"
                  >
                    <span>{{ getValueByPath(item, header.key) || '-' }}</span>
                  </slot>
                </td>
              </tr>

              <!-- No Search Results -->
              <tr v-if="filteredData.length === 0 && search.length > 0">
                <td
                  :colspan="totalColumns"
                  class="px-6 py-4 text-center font-bold text-gray-700"
                >
                  <slot name="no-search-results" :search="search">
                    No results found for "{{ search }}".
                  </slot>
                </td>
              </tr>

              <!-- No Data -->
              <tr
                v-if="filteredData.length === 0 && !search.length && !loading"
              >
                <td
                  :colspan="totalColumns"
                  class="px-6 py-4 text-center font-bold flex justify-center items-center text-gray-600"
                >
                  <img src="../../assets/undraw_empty_4zx0.png" alt="No data" />
                  <slot name="no-data"> No data found. </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex-shrink-0">
      <Pagination
        v-if="isPagination && totalPages > 1"
        :currentPage="currentPage"
        :questionsPerPage="itemsPerPage"
        :totalQuestions="filteredData.length"
        :totalPages="totalPages"
        :pageNumbers="pageNumbers"
        :goToPage="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
import { Search } from "lucide-vue-next";
import { ref, computed } from "vue";
import Pagination from "../pages/Pagination.vue";

const props = defineProps({
  data: { type: Array, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: "Search..." },
  isPagination: { type: Boolean, default: true },
  sortOrder: { type: String, default: "asc" } 
});

const search = ref("");
const currentPage = ref(1);
const pageNumbers = ref(1);
const itemsPerPage = ref(10);

const filteredData = computed(() => {
  const data = props.data || [];
  if (!search.value) return data;

  const searchQuery = search.value.toLowerCase();
  return data.filter((item) =>
    props.headers.some((header) => {
      const value = getValueByPath(item, header.key);
      return (
        typeof value === "string" && value.toLowerCase().includes(searchQuery)
      );
    })
  );
});

const sortedData = computed(() => {
  const order = props.sortOrder;
  return [...filteredData.value].sort((a, b) => {
    const aVal = new Date(getValueByPath(a, "date"));
    const bVal = new Date(getValueByPath(b, "date"));

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
});


const paginatedData = computed(() => {
  const data = sortedData.value || [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return data.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
);

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const totalColumns = computed(() => props.headers.length);

const getValueByPath = (obj, path) =>
  path
    .split(".")
    .reduce((o, key) => (o && o[key] !== undefined ? o[key] : ""), obj) || "";

const getRowKey = (item, index) => item.id || index;
</script>
