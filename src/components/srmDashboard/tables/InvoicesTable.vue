<template>
  <div class="overflow-x-auto w-full rounded-lg border border-gray-300 shadow-sm">
    <table
      class="w-max min-w-full text-center divide-y divide-gray-200 border shadow-sm rounded-lg bg-white"
    >
      <thead class="bg-gray-100 text-center py-4">
        <tr>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Serial
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Notes
          </th>
          <th
            class="px-6 py-3 flex gap-2 items-center text-left text-lg font-bold text-indigo-800 uppercase cursor-pointer select-none"
            @click="toggleSort('created_at')"
          >
            Date
            <span>
              <ArrowUpDown v-if="sortOrderLocal === 'asc'" :size="16" />
              <ArrowDownUp v-else :size="16" />
            </span>
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Amount
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Method
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Type
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Sub/Type
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Employee
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="(row, rowIndex) in sortedData"
          :key="rowIndex"
          :class="[
            'hover:bg-gray-100',
            row.serial?.toLowerCase().startsWith('r') ? 'bg-yellow-100' : '',
          ]"
        >
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">
            {{ row.serial }}
          </td>
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">
            <span
              class="break-words"
              :style="{ direction: 'auto', unicodeBidi: 'plaintext' }"
            >
              {{ isExpanded[rowIndex] ? row.notes : truncated(row.notes) }}
              <button
                v-if="row.notes && row.notes.length > 50"
                @click="toggleExpand(rowIndex)"
                class="text-blue-500 underline text-xs ml-2"
              >
                {{ isExpanded[rowIndex] ? "Less" : "More" }}
              </button>
            </span>
          </td>

          <td class="px-6 py-4 text-sm text-gray-800">
            {{ row.created_at }}
          </td>
          <td class="px-6 py-4 text-sm font-bold text-indigo-700">
            {{ displayValue(row.amount) }} EGP
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            {{ row.pay_method }}
          </td>
          <td>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
            >
              {{ row.type }}
            </span>
          </td>
          <td>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
            >
              {{ row.pay_cat }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            {{ row.employee.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";
import { ref, watch } from "vue";
import { useDateSort } from "../../global/useDateSort";

const isExpanded = ref({});

function truncated(text) {
  if (!text) return "-";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
}

function toggleExpand(index) {
  isExpanded.value[index] = !isExpanded.value[index];
}

const props = defineProps({
  data: Array,
  sortOrder: String,
});

const emit = defineEmits(["toggleSort"]);

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  return parseFloat(value).toFixed(2);
}

// 🟢 استخدام useDateSort
const { sortByDate } = useDateSort();
const sortOrderLocal = ref("desc"); // ← يبدأ من الأحدث
const sortedData = ref([]);

// ترتيب أولي
watch(
  () => props.data,
  (newData) => {
    sortedData.value = sortByDate(newData, "created_at", sortOrderLocal.value);
  },
  { immediate: true }
);

function toggleSort(field) {
  sortOrderLocal.value =
    sortOrderLocal.value === "asc" ? "desc" : "asc";
  sortedData.value = sortByDate(props.data, field, sortOrderLocal.value);
  emit("toggleSort", field);
}
</script>
