<template>
  <div v-if="data.length > 0" class="overflow-x-auto min-w-5xl rounded-lg border border-gray-300 shadow-sm">
    <table class="min-w-full divide-y text-center divide-gray-200 bg-white">
      <thead
        class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-6 [&>tr>th]:py-3">
        <tr>
          <th>Module</th>
          <th>Code</th>
          <th @click="toggleSort('start_date')" class="cursor-pointer select-none">
            <div class="flex items-center justify-center gap-2">
              Date
              <span>
                <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                <ArrowDownUp v-else :size="16" />
              </span>
            </div>
          </th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Exam Date</th>
          <th>Lectures (6)</th>
        </tr>
      </thead>

      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">
            {{ row.course.name }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-600 capitalize">
            {{ row.code }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-600">
            {{ row.start_date }}
          </td>

          <td class="px-6 py-4 text-sm font-bold text-indigo-700">
            {{
              row.final_score != null
                ? row.course.name.toLowerCase() === "project"
                  ? row.final_score + " / 100"
                  : (row.final_score * 50) / 100 + " / 50"
                : "-"
            }}
          </td>

          <!-- Percentage -->
          <td class="px-6 py-4 text-sm text-gray-600">
            {{ row.final_score != null ? row.final_score + "%" : "-" }}
          </td>

          <td class="px-6 py-4 text-sm text-gray-600">
            {{ row.exam_at || "-" }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-600">
            {{ row.attended_lectures }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";

const props = defineProps({
  data: Array,
  sortOrder: String,
});

const emit = defineEmits(["toggleSort"]);

function toggleSort(field) {
  emit("toggleSort", field);
}


</script>
