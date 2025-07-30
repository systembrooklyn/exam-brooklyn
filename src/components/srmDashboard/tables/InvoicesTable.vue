<template>
  <div class="rounded-lg border border-gray-300 shadow-sm overflow-x-auto">
    <table class="min-w-full divide-y text-center divide-gray-200 bg-white">
      <thead class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-6 [&>tr>th]:py-3">
        <tr>
          <th>Serial</th>
          <th>Notes</th>
          <th @click="$emit('sort', 'created_at')" class="cursor-pointer select-none">
            <div class="flex items-center justify-center gap-2">
              Date
              <span>
                <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                <ArrowDownUp v-else :size="16" />
              </span>
            </div>
          </th>
          <th>Amount</th>
          <th>Method</th>
          <th>Type</th>
          <th>Sub/Type</th>
          <th>Employee</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex"
          :class="['hover:bg-gray-100', row.serial?.toLowerCase().startsWith('r') ? 'bg-yellow-100' : '']">
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ row.serial }}</td>
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ row.notes }}</td>
          <td class="px-6 py-4 text-sm text-gray-800">{{ formatDate(row.created_at) }}</td>
          <td class="px-6 py-4 text-sm font-bold text-indigo-700">{{ displayValue(row.amount) }} EGP</td>
          <td class="px-6 py-4 text-sm text-gray-800">{{ row.pay_method }}</td>
          <td><span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">{{ row.type }}</span></td>
          <td><span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">{{ row.pay_cat }}</span></td>
          <td class="px-6 py-4 text-sm text-gray-800">{{ row.employee.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps(['data', 'sortOrder'])
defineEmits(['sort'])
const formatDate = (date) => new Date(date).toLocaleDateString()
const displayValue = (val) => Number(val).toLocaleString()
</script>