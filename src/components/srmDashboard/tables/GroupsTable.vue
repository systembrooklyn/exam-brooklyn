<template>
  <div class="container mx-auto px-2 sm:px-4">
    <div class="w-full overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
      <table class="w-full table-auto divide-y text-center divide-gray-200 bg-white">
        <thead
          class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-2 sm:[&>tr>th]:px-4 [&>tr>th]:py-3">
          <tr>
            <th>Group Name</th>

            <th
              class="px-6 py-3 flex gap-2 items-center justify-center text-left text-lg font-bold text-indigo-800 uppercase cursor-pointer select-none"
              @click="$emit('toggleSort', 'start_date')">
              Start Date
              <span>
                <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                <ArrowDownUp v-else :size="16" />
              </span>
            </th>

            <th>Actual Send Date <br />by system</th>
            <th>Sender <br />by srm</th>
            <th>Send at</th>




            <!-- <th>Status</th> -->
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="hover:bg-gray-50">
            <td class="px-2 sm:px-4 py-3 text-sm font-semibold text-gray-900">
              {{ row.name.replace(' Group ', ' - ') }} <p class="text-gray-600">({{ row.type }})</p>
            </td>


            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600">
              {{
              (() => {
              const dateStr = row.type === "online" ? row.student_start : row.start_date;
              const formatted = formatDate(dateStr);
              // Check if the date is 01/01/1970 or invalid
              return (formatted === "01/01/1970" || formatted === "-") ? "-" : formatted;
              })()
              }}
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600">
              {{ row.act_date ? row.act_date : "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 capitalize">
              {{ row.sender?.name }}_{{ row.sender?.fingerPrint }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600">
              {{  "-" }}
            </td>




            <!-- <td class="px-2 sm:px-4 py-3 text-sm font-semibold text-white">
              <span :class="{
                'bg-green-500 px-3 py-1 rounded-full': row.ended === 1,
                'bg-red-500 px-3 py-1 rounded-full': row.ended === 0,
              }">
                {{ row.ended === 1 ? "Ended" : "Active" }}
              </span>
            </td> -->
          </tr>
        </tbody>
      </table>
    </div>
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

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>
