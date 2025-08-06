<template>
  <div class="overflow-x-auto max-w-5xl rounded-lg border border-gray-300 shadow-sm">
    <table
      class="w-max min-w-full divide-y text-center divide-gray-200 border shadow-sm rounded-lg bg-white"
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
              <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
              <ArrowDownUp v-else :size="16" />
            </span>
          </th>
          <!-- <th class="px-6 py-3 text-left text-md font-bold text-indigo-800  uppercase"> Type</th> -->
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
          v-for="(data, dataIndex) in data"
          :key="dataIndex"
          :class="[
            'hover:bg-gray-100',
            data.serial?.toLowerCase().startsWith('r') ? 'bg-yellow-100' : '',
          ]"
        >
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">
            {{ data.serial }}
          </td>
          <td class="px-6 py-4 text-sm font-semibold text-gray-900">
            <span>
              {{ isExpanded[dataIndex] ? data.notes : truncated(data.notes) }}
              <button
                v-if="data.notes.length > 50"
                @click="toggleExpand(dataIndex)"
                class="text-blue-500 underline text-xs ml-2"
              >
                {{ isExpanded[dataIndex] ? "Less" : "More" }}
              </button>
            </span>
          </td>

          <td class="px-6 py-4 text-sm text-gray-800">
            {{ data.created_at }}
          </td>
          <!-- <td class="px-6 py-4 text-sm text-gray-600 capitalize">{{ data.type }}</td> -->
          <td class="px-6 py-4 text-sm font-bold text-indigo-700">
            {{ displayValue(data.amount) }} EGP
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            {{ data.pay_method }}
          </td>
          <td>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
            >
              {{ data.type }}
            </span>
          </td>
          <td>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
            >
              {{ data.pay_cat }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            {{ data.employee.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";
import { ref } from "vue";

// حالة لتتبع كل صف إذا كان مفتوح ولا لأ
const isExpanded = ref({});

// دالة لتقطيع النص
function truncated(text) {
  if (!text) return "-";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
}

// تبديل بين إظهار الكل أو جزء
function toggleExpand(index) {
  isExpanded.value[index] = !isExpanded.value[index];
}

const props = defineProps({
  data: Array,
  sortOrder: String,
});

console.log("Data received in InvoicesTable:", props.data);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  return parseFloat(value).toFixed(2);
}
const emit = defineEmits(["toggleSort"]);

function toggleSort(field) {
  emit("toggleSort", field);
}
</script>
