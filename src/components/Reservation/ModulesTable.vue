<script setup>
defineProps({
  modules: Array
});
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-100 bg-gray-50/50">
      <h3 class="text-xl font-bold text-indigo-600 border-b pb-2">Modules Schedule</h3>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
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
