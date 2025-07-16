<script setup>
import { ref, computed } from "vue";
import Pagination from "./Pagination.vue";

const props = defineProps({
  cardName: String,
  headers: Array,
  data: Array,
  loading: Boolean,
});

const currentPage = ref(1);
const pageSize = 5;
const expandedCell = ref({});

const hiddenColumnsByCard = {
  Requests: [
    "manager_response_at",
    "employee_response_at",
    "updated_at",
    "id",
    "student_id",
    "type",
    "comment",
    "serial",
  ],

  Invoices: [],
  Complaints: [
    "id",
    "created_at",
    "updated_at",
    "serial",
    "employee_response_at",
    "manager_response_at",
    "student_id",
  ],
};

const expandableColumns = [
  "value",
  "comment",
  "manager_response",
  "employee_response",
];

// const statusOptions = ["pending", "open", "closed"];

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const totalPages = computed(
  () => Math.ceil(props.data?.length / pageSize) || 1
);

const computedHeaders = computed(() => {
  if (!props.headers) return [];

  if (props.cardName === "Requests") {
    const withoutCreatedAt = props.headers.filter((h) => h !== "created_at");
    return ["created_at", ...withoutCreatedAt];
  }

  return props.headers;
});

function displayValue(val) {
  return val ?? "No Data Available";
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.data ? props.data.slice(start, start + pageSize) : [];
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); // Always show first page

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");

    pages.push(total); // Always show last page
  }

  return pages;
});

const hasData = computed(() => props.data && props.data.length > 0);

function goToPage(page) {
  if (page === "...") return;
  currentPage.value = page;
}

function toggleExpand(rowIndex, colName) {
  const key = `${rowIndex}-${colName}`;
  expandedCell.value = expandedCell.value.key === key ? {} : { key };
}

function shouldShowColumn(col) {
  const hiddenCols = hiddenColumnsByCard[props.cardName] || [];
  return !hiddenCols.includes(col);
}
</script>

<template>
  <div class="">
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"
      ></div>
    </div>

    <!-- No Data Message -->
    <div v-else-if="!hasData">
      <img
        class="mx-auto h-80 mt-10"
        src="@/assets/undraw_empty_4zx0.png"
        alt="No Data"
      />
      <p class="text-center mt-4 font-semibold text-gray-500">No Data Found</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <!-- ✅ Groups Table -->
      <div
        v-if="cardName === 'Groups'"
        class="overflow-x-auto rounded-lg border border-gray-300 shadow-sm"
      >
        <table class="min-w-full divide-y text-center divide-gray-200 bg-white">
          <thead class="bg-gray-100 py-3">
            <tr>
              <th class="px-6 py-3 text-lg font-bold text-indigo-800 uppercase">
                Group Name
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Start Date
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Lectures
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(row, rowIndex) in paginatedData"
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
                    ? formatDate(row.student_start)
                    : formatDate(row.start_date)
                }}
              </td>
              <td class="px-6 py-4 text-sm font-bold text-indigo-700">
                {{ row.type === "online" ? "-" : row.total_lec || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✅ Invoices Table -->
      <div
        v-if="cardName === 'Invoices'"
        class="rounded-lg border border-gray-300 shadow-sm"
      >
        <table
          class="min-w-full divide-y text-center divide-gray-200 border shadow-sm rounded-lg bg-white"
        >
          <thead class="bg-gray-100 text-center py-4">
            <tr>
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Serial
              </th>
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Notes
              </th>
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Date
              </th>
              <!-- <th class="px-6 py-3 text-left text-md font-bold text-indigo-800  uppercase"> Type</th> -->
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Amount
              </th>
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Method
              </th>
              <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Status
              </th>
               <th class="px-6 py-3 text-md font-bold text-indigo-800 uppercase">
                Employee
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(row, rowIndex) in paginatedData"
              :key="rowIndex"
              :class="[
                'hover:bg-gray-50',
                row.serial?.toLowerCase().startsWith('r') ? 'bg-yellow-50' : '',
              ]"
            >
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                {{ row.serial }}
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                {{ row.notes }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ formatDate(row.created_at) }}
              </td>
              <!-- <td class="px-6 py-4 text-sm text-gray-600 capitalize">{{ row.type }}</td> -->
              <td class="px-6 py-4 text-sm font-bold text-indigo-700">
                {{ displayValue(row.amount) }} EGP
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ row.pay_method }}
              </td>
              <td
                class="px-6 py-4 text-sm flex items-center justify-center gap-2"
              >
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
                >
                  {{ row.pay_cat }}
                </span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                >
                  {{ row.type }}
                </span>
              </td>
               <td class="px-6 py-4 text-sm text-gray-800">
                {{ row.employee.name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✅ Requests & Complaints -->
      <div
        v-if="cardName === 'Requests' || cardName === 'Complaints'"
        class="space-y-4"
      >
        <div
          v-for="(row, rowIndex) in paginatedData"
          :key="rowIndex"
          class="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <div class="flex items-center space-x-6">
              <h4 class="font-semibold text-gray-800">{{ row.field }}</h4>
              <span class="text-sm text-gray-500">{{
                formatDate(row.created_at)
              }}</span>
            </div>
            <span
              :class="{
                'bg-green-100 text-green-700': row.status === 'closed',
                'bg-yellow-100 text-yellow-700': row.status === 'pending',
              }"
              class="px-3 py-1 rounded-full text-sm font-medium capitalize"
            >
              {{ row.status }}
            </span>
          </div>

          <div class="prose max-w-none text-gray-700 mb-4">
            <template v-if="expandableColumns.includes('value')">
              <span v-if="`${rowIndex}-value` === expandedCell.key">
                {{ displayValue(row.value) }}
                <button
                  class="ml-2 text-sm text-indigo-600 underline"
                  @click.stop="toggleExpand(rowIndex, 'value')"
                >
                  Less
                </button>
              </span>
              <span v-else>
                {{ displayValue(row.value).split(" ").slice(0, 35).join(" ") }}
                <span v-if="displayValue(row.value).split(' ').length > 35">
                  ...
                  <button
                    class="ml-1 text-sm text-indigo-600 underline cursor-pointer"
                    @click.stop="toggleExpand(rowIndex, 'value')"
                  >
                    More
                  </button>
                </span>
              </span>
            </template>
            <template v-else>
              {{ displayValue(row.value) }}
            </template>
          </div>

          <div class="space-y-4 text-sm border-t pt-4">
            <div
              v-if="row.manager_response"
              class="bg-gray-50 p-3 rounded-md border-l-4 border-indigo-400"
            >
              <strong class="text-indigo-600">Manager Response:</strong>
              <p class="mt-1 text-gray-800">{{ row.manager_response }}</p>
              <span v-if="row.manager_response_at" class="text-xs text-gray-500"
                >At: {{ formatDate(row.manager_response_at) }}</span
              >
            </div>
            <div
              v-if="row.employee_response"
              class="bg-gray-50 p-3 rounded-md border-l-4 border-blue-400"
            >
              <strong class="text-blue-600">Employee Response:</strong>
              <p class="mt-1 text-gray-800">{{ row.employee_response }}</p>
              <span
                v-if="row.employee_response_at"
                class="text-xs text-gray-500"
                >At: {{ formatDate(row.employee_response_at) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Deadlines -->
      <div v-if="cardName === 'Deadlines'" class="space-y-4">
        <div
          v-for="(row, rowIndex) in paginatedData"
          :key="rowIndex"
          class="bg-white p-3 rounded-lg shadow-md border border-gray-200"
        >
        
          <div class="flex justify-between items-center space-x-4">
            <div>
             
            
           
              <h4 class="text-md font-bold text-gray-800 mb-1">Amount</h4>
              <p class="text-xl font-bold text-indigo-600">
                {{ displayValue(row.amount) }} EGP
              </p>
               <div>
                  <span class="font-medium text-gray-500 ">Due Date:</span>
              {{ formatDate(row.due_date) }}
              </div>
            </div>
            <div>
            
              <h4 class="text-md font-bold text-gray-800 mb-1">
                Paid Amount
              </h4>
              <p class="text-lg font-semibold text-green-600">
                {{ row.paid_amount }} EGP
              </p>
                 <div>
              <span class="font-medium text-gray-500">Paid on:</span>
              {{ formatDate(row.paid_date) }}
            </div>
            </div>
                   <div>
                  <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium text-white',
                {
                  'bg-green-500': row.status === 'paid',
                  'bg-red-500': row.status === 'unpaid',
                  'bg-yellow-400 text-black': row.status === 'partialPaid',
                },
              ]"
            >
              {{ row.status }}
            </span>
          </div>
          </div>
   
        </div>
      </div>

      <!-- ✅ Pagination -->
      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-numbers="pageNumbers"
        @update:current-page="goToPage"
      />
    </div>
  </div>
</template>
