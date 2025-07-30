<template>
<div
        v-if="cardName === 'Groups'"
        class="overflow-x-auto min-w-5xl rounded-lg border border-gray-300 shadow-sm"
      >
        <table class="min-w-full divide-y text-center divide-gray-200 bg-white">
          <thead
            class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-6 [&>tr>th]:py-3"
          >
            <tr>
              <th>Group Name</th>
              <th>Type</th>
              <th
                class="px-6 py-3 flex gap-2 items-center justify-center text-left text-lg font-bold text-indigo-800 uppercase cursor-pointer select-none"
                @click="toggleSort('start_date')"
              >
                Start Date
                <span>
                  <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                  <ArrowDownUp v-else :size="16" />
                </span>
              </th>
              <!-- <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Score
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Percentage
              </th> -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(row, rowIndex) in data"
              :key="rowIndex"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                {{ row.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 capitalize">
                {{ row.type }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{
                  row.type === "online"
                    ? row.student_start
                    : row.start_date
                }}
              </td>

              <!-- <td class="px-6 py-4 text-sm font-bold text-indigo-700">
                {{
                  row.final_score != null
                    ? row.course.name.toLowerCase() === "project"
                      ? row.final_score + " / 100"
                      : (row.final_score * 50) / 100 + " / 50"
                    : "-"
                }}
              </td>

            
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ row.final_score != null ? row.final_score + "%" : "-" }}
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
</template>

<script setup>

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});
console.log(props.data);

</script>
