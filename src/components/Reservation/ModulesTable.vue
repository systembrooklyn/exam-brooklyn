<script setup>
defineProps({
  modules: Array
});
defineEmits(["refresh-data"]);
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
      <h3 class="text-xl font-bold text-indigo-600 border-b pb-2 flex-1">Modules Schedule</h3>
      <button type="button" @click="$emit('refresh-data')"
        class="text-sm font-bold px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2 shadow-sm mb-2"
        title="Refresh Data">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Data
      </button>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-center border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">

            <th class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider">
              Module
            </th>

            <th class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider">
              Code
            </th>

            <th class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider">
              Date
            </th>

            <th class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider">
              Day
            </th>

            <th class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider">
              Time
            </th>

            <!-- SEPARATED COLUMNS (Amount + Deadline) -->
            <th
              class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider 
              border-l-2 border-indigo-600 bg-gray-50"
            >
              Amount
            </th>

            <th
              class="py-3 px-4 text-md font-semibold text-indigo-600 uppercase tracking-wider 
              bg-gray-50"
            >
              Deadline
            </th>

          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">

          <tr
            v-for="(m, i) in modules"
            :key="i"
            class="hover:bg-gray-50/80 transition-colors duration-150 group"
          >
            <td class="py-3 px-4 font-medium text-gray-800">{{ m.name }}</td>

            <td class="py-3 px-4 text-gray-600">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ m.code }}
              </span>
            </td>

            <td class="py-3 px-4 text-gray-600 text-sm">{{ m.startDate }}</td>

            <td class="py-3 px-4 text-gray-600 text-sm">{{ m.day }}</td>

            <td class="py-3 px-4 text-gray-600 text-sm">{{ m.time }}</td>

            <!-- SEPARATED Amount -->
            <td
              class="py-3 px-4 font-medium text-indigo-600
              border-l-2 border-indigo-600 bg-gray-50/40"
            >
              {{ m.amount ? m.amount.toLocaleString() : '-' }}
            </td>

            <!-- SEPARATED Deadline -->
            <td
              class="py-3 px-4 text-red-500 text-sm font-medium bg-gray-50/40"
            >
              {{ m.deadline }}
            </td>

          </tr>

        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="!modules || modules.length === 0"
        class="p-8 text-center text-gray-400"
      >
        No modules available.
      </div>
    </div>
  </div>
</template>
