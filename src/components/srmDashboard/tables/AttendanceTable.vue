<template>
  <div class="container mx-auto px-2 sm:px-4">
    <div
      class="w-full overflow-x-auto rounded-lg border border-gray-300 shadow-sm"
    >
      <table
        class="w-full table-auto divide-y text-center divide-gray-200 bg-white"
      >
        <thead
          class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-2 sm:[&>tr>th]:px-4 [&>tr>th]:py-3"
        >
          <tr>
            <th>Module</th>
            <th>Code</th>
            <!-- Start Date -->
            <th
              @click="toggleSort('start_date')"
              class="cursor-pointer select-none"
            >
              <div class="flex items-center justify-center gap-2">
                Start Date
                <span v-if="sortField === 'start_date'">
                  <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                  <ArrowDownUp v-else :size="16" />
                </span>
              </div>
            </th>
            <th>Score</th>
            <th>Percentage</th>
            <!-- End Date (exam_at) -->
            <th
              @click="toggleSort('exam_at')"
              class="cursor-pointer select-none"
            >
              <div class="flex items-center justify-center gap-2">
                End Date
                <span v-if="sortField === 'exam_at'">
                  <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                  <ArrowDownUp v-else :size="16" />
                </span>
              </div>
            </th>
            <th>Lectures (6)</th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, rowIndex) in sortedData"
            :key="rowIndex"
            class="hover:bg-gray-50"
            :class="
              row.course.name.toLowerCase().includes('ai')
                ? 'bg-yellow-100'
                : ''
            "
          >
            <td class="px-2 sm:px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
              {{ row.course.name }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">
              {{ row.code }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{
                 formatDate(row.start_date)
              }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm font-bold text-indigo-700 whitespace-nowrap">
              {{
                row.final_score != null
                  ? row.course.name.toLowerCase() === "project"
                    ? row.final_score + " / 100"
                    : row.final_score + " / 50"
                  : "-"
              }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ row.final_score != null ? ((row.final_score / 50) * 100).toFixed(1) + "%" : "-" }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ formatDate(row.exam_at) || "-" }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ row.attended_lectures }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";
import formatDate from "../../global/FormDate";
import { useDateSort } from "../../global/useDateSort";
import { ref, computed } from "vue";

const props = defineProps({
  data: Array,
  sortOrder: String, // البداية: "asc"
});

const { sortByDate } = useDateSort();

const sortField = ref("start_date");
const sortOrder = ref(props.sortOrder || "asc");

function toggleSort(field) {
  if (sortField.value === field) {
   
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
  
    sortField.value = field;
    sortOrder.value = "asc";
  }
}

const sortedData = computed(() =>
  sortByDate(props.data, sortField.value, sortOrder.value)
);
console.log(sortedData.value)

</script>
