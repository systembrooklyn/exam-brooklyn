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

      <!-- Table or No Data -->
      <div v-else class="flex-1 overflow-hidden">
        <div class="w-full h-full overflow-x-auto overflow-y-auto">
          <template v-if="filteredData.length > 0">
            <table class="w-full min-w-full text-center">
              <thead class="sticky top-0 z-10">
                <tr>
                  <th
                    v-for="header in headers"
                    :key="header.key"
                    class="px-4 py-3 text-center text-primary text-lg bg-indigo-100 font-bold whitespace-nowrap"
                  >
                    <div class="flex items-center justify-center gap-2">
                      {{ header.label }}
                      <span v-if="totalLabels.includes(header.label)">
                        ({{ getColumnTotalByLabel(header.label) }})
                      </span>

                      <button
                        v-if="
                          ['student.email', 'student.phones'].includes(
                            header.key
                          )
                        "
                        @click="copyColumn(header.key)"
                        class="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        title="Copy all"
                      >
                        <BookCopy
                          size="17"
                          class="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in paginatedData"
                  :key="getRowKey(item, index)"
                  class="hover:bg-gray-50"
                >
                  <td
                    v-for="header in headers"
                    :key="header.key"
                    :class="[
                      'px-4 py-4 whitespace-nowrap',
                      index !== paginatedData.length - 1 ? 'border-b' : '',
                      props.highlightKeys.includes(header.key) &&
                      isPastDate(getValueByPath(item, 'due_date'))
                        ? 'text-red-600 font-bold'
                        : 'text-gray-600',
                    ]"
                  >
                    <slot
                      :name="`cell-${header.key}`"
                      :item="item"
                      :value="getValueByPath(item, header.key)"
                      :header="header"
                      :index="index"
                    >
                      <span>{{
                        formatValue(
                          getValueByPath(item, header.key),
                          header.key
                        )
                      }}</span>
                    </slot>
                  </td>
                </tr>
              </tbody>
            </table>
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
          </template>

          <div v-else class="flex flex-col items-center gap-4 py-3">
            <img src="../../assets/undraw_empty_4zx0.png" alt="No data" />
            <p class="text-gray-600 text-lg">No data available.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookCopy, Search } from "lucide-vue-next";
import { ref, computed } from "vue";
import Pagination from "../pages/Pagination.vue";
import notyf from "../../components/global/notyf";

const props = defineProps({
  data: { type: Array, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: "Search..." },
  isPagination: { type: Boolean, default: true },
  sortOrder: { type: String, default: "asc" },
  sortKey: { type: String, default: "date" },
  dateKey: { type: String, default: null },
  highlightKeys: { type: Array, default: () => [] },
  highlightDateKeys: { type: Array, default: () => [] },
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

const totalLabels = ["Budget", "Amount", "Paid", "Paid Amount", "Unpaid"];

const getColumnTotalByLabel = (label) => {
  const header = props.headers.find((h) => h.label === label);
  if (!header) return 0;

  const key = header.key;

  const values = filteredData.value.map(
    (item) => Number(getValueByPath(item, key)) || 0
  );

  return values.reduce((a, b) => a + b, 0);
};

const sortedData = computed(() => {
  const order = props.sortOrder;
  const key = props.sortKey;

  return [...filteredData.value].sort((a, b) => {
    const aVal = new Date(getValueByPath(a, key));
    const bVal = new Date(getValueByPath(b, key));

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
});

const paginatedData = computed(() => {
  const data = sortedData.value || [];

  if (!props.isPagination) {
    return data;
  }

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

const formatValue = (value, key) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (["amount", "paid_amount", "unpaid"].includes(key)) {
    return value && !isNaN(value) ? Number(value) : 0;
  }
  return value || "-";
};

const isPastDate = (value) => {
  if (!value) return false;

  let parsed = value;
  if (typeof value === "string") {
    if (value.includes("/")) {
      const [day, month, year] = value.split("/");
      parsed = `${year}-${month}-${day}`;
    } else if (value.includes("T")) {
      parsed = value.split("T")[0];
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const valDate = new Date(parsed);
  valDate.setHours(0, 0, 0, 0);

  return valDate.getTime() <= today.getTime();
};

const copyColumn = async (key) => {
  try {
    const values = (props.data || []).map((item) => getValueByPath(item, key));
    const textToCopy = values.join("\n");
    await navigator.clipboard.writeText(textToCopy);
    notyf.success(`Copied all ${key.replace("student.", "")}`);
  } catch (err) {
    console.error("Failed to copy column:", err);
  }
};

// Helper: Get nested value
const getValueByPath = (obj, path) => {
  if (!path) return "";
  return (
    path
      .split(".")
      .reduce((o, key) => (o && o[key] !== undefined ? o[key] : ""), obj) || ""
  );
};

const getRowKey = (item, index) => item.id || index;
</script>
