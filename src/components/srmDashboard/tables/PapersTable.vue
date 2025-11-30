<template>
  <div class="overflow-x-auto w-full rounded-lg border border-gray-300 shadow-sm">
    <table
      class="w-max min-w-full text-center divide-y divide-gray-200 border shadow-sm rounded-lg bg-white"
    >
      <thead class="bg-gray-100 text-center py-4">
        <tr>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Front ID
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Back ID
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Certificates
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Exp. Letters
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            HR Letters
          </th>
          <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
            Archive Num
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          class="hover:bg-gray-50"
        >
         
          <td class="px-6 py-4 text-sm text-blue-600">
            <a
              v-if="row.front_id"
              :href="row.front_id"
              target="_blank"
              class="hover:underline"
              >View</a
            >
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-6 py-4 text-sm text-blue-600">
            <a
              v-if="row.back_id"
              :href="row.back_id"
              target="_blank"
              class="hover:underline"
              >View</a
            >
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            <div v-if="row.certificates && row.certificates.length > 0">
              <button
                @click="toggleExpand(rowIndex, 'certificates')"
                class="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                {{ row.certificates.length }} Files
                <component
                  :is="isExpanded(rowIndex, 'certificates') ? ChevronUp : ChevronDown"
                  :size="14"
                />
              </button>
              <div
                v-if="isExpanded(rowIndex, 'certificates')"
                class="mt-2 flex flex-col gap-1 text-xs"
              >
                <a
                  v-for="(link, i) in row.certificates"
                  :key="i"
                  :href="link"
                  target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  File {{ i + 1 }}
                </a>
              </div>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            <div
              v-if="row.experience_letters && row.experience_letters.length > 0"
            >
              <button
                @click="toggleExpand(rowIndex, 'experience_letters')"
                class="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                {{ row.experience_letters.length }} Files
                <component
                  :is="isExpanded(rowIndex, 'experience_letters') ? ChevronUp : ChevronDown"
                  :size="14"
                />
              </button>
              <div
                v-if="isExpanded(rowIndex, 'experience_letters')"
                class="mt-2 flex flex-col gap-1 text-xs"
              >
                <a
                  v-for="(link, i) in row.experience_letters"
                  :key="i"
                  :href="link"
                  target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  File {{ i + 1 }}
                </a>
              </div>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            <div v-if="row.hr_letters && row.hr_letters.length > 0">
              <button
                @click="toggleExpand(rowIndex, 'hr_letters')"
                class="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                {{ row.hr_letters.length }} Files
                <component
                  :is="isExpanded(rowIndex, 'hr_letters') ? ChevronUp : ChevronDown"
                  :size="14"
                />
              </button>
              <div
                v-if="isExpanded(rowIndex, 'hr_letters')"
                class="mt-2 flex flex-col gap-1 text-xs"
              >
                <a
                  v-for="(link, i) in row.hr_letters"
                  :key="i"
                  :href="link"
                  target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  File {{ i + 1 }}
                </a>
              </div>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800">
            <div v-if="Array.isArray(row.arch_num) && row.arch_num.length > 0" class="flex flex-col gap-1">
              <span v-for="(num, i) in row.arch_num" :key="i">
                {{ num }}
              </span>
            </div>
            <span v-else-if="row.arch_num && !Array.isArray(row.arch_num)">
              {{ row.arch_num }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ChevronDown, ChevronUp } from "lucide-vue-next";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const expandedState = ref({});

function toggleExpand(rowIndex, field) {
  const key = `${rowIndex}-${field}`;
  expandedState.value[key] = !expandedState.value[key];
}

function isExpanded(rowIndex, field) {
  return !!expandedState.value[`${rowIndex}-${field}`];
}
</script>
