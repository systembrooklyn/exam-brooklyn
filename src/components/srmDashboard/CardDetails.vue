<script setup>
import { ref, computed, watch } from "vue";
import Pagination from "./Pagination.vue";
import { ArrowDownUp, ArrowUpDown } from "lucide-vue-next";

const props = defineProps({
  cardName: String,
  headers: Array,
  data: Array,
  loading: Boolean,
});

const currentPage = ref(1);
const pageSize = 5;
const expandedCell = ref({});
const sortOrder = ref("asc");
const sortField = ref("created_at");

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

// Sort function for data
function sortData(data) {
  if (!data || !sortField.value) return data;

  return [...data].sort((a, b) => {
    let valA = a[sortField.value];
    let valB = b[sortField.value];

    if (props.cardName === "Groups") {
      valA = a.type === "online" ? a.student_start : a.start_date;
      valB = b.type === "online" ? b.student_start : b.start_date;
    }

    const dateA = new Date(valA);
    const dateB = new Date(valB);

    return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
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
  const sorted = sortData(props.data);

  if (props.cardName === "Groups" || props.cardName === "Attendance") {
    return sorted || [];
  }

  const start = (currentPage.value - 1) * pageSize;
  return sorted ? sorted.slice(start, start + pageSize) : [];
});

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
}

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

watch(
  () => props.cardName,
  () => {
    currentPage.value = 1;
  }
);
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
      <p class="text-center mt-4 font-semibold text-gray-800">No Data Found</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <!-- ✅ Groups Table -->
      <div
        v-if="cardName === 'Groups'"
        class="overflow-x-auto min-w-5xl rounded-lg border border-gray-300 shadow-sm"
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
                class="px-6 py-3 flex gap-2 items-center justify-center text-left text-lg font-bold text-indigo-800 uppercase cursor-pointer select-none"
                @click="toggleSort('start_date')"
              >
                Start Date
                <span>
                  <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                  <ArrowDownUp v-else :size="16" />
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Score
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Percentage
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Exam Date
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
                {{ formatDate(row.exam_at) || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- ✅ Attendance Table -->
      <div
        v-if="cardName === 'Attendance'"
        class="overflow-x-auto min-w-5xl rounded-lg border border-gray-300 shadow-sm"
      >
        <table class="min-w-full divide-y text-center divide-gray-200 bg-white">
          <thead class="bg-gray-100 py-3">
            <tr>
              <th class="px-6 py-3 text-lg font-bold text-indigo-800 uppercase">
                Attendance Name
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Code
              </th>
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
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Score
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Percentage
              </th>
              <th
                class="px-6 py-3 text-left text-lg font-bold text-indigo-800 uppercase"
              >
                Exam Date
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
                {{ row.course.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 capitalize">
                {{ row.course.code }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(row.start_date) }}
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
                {{ formatDate(row.exam_at) || "-" }}
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
              <td>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                >
                  {{ row.type }}
                </span>
              </td>
              <td>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
                >
                  {{ row.pay_cat }}
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
        <!-- Sort Header for Requests / Complaints -->
        <div
          class="flex items-center gap-2 text-indigo-800 font-bold text-lg cursor-pointer select-none"
          @click="toggleSort('created_at')"
        >
          Sort by Date
          <span>
            <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
            <ArrowDownUp v-else :size="16" />
          </span>
        </div>

        <div
          v-for="(row, rowIndex) in paginatedData"
          :key="rowIndex"
          class="bg-white p-3 rounded-lg shadow-md border border-gray-200"
        >
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center space-x-6">
              <!-- <h4 class="font-semibold text-gray-800">{{ row.field }}</h4> -->
              <span class="text-sm font-semibold text-gray-800">{{
                formatDate(row.created_at)
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ row.field }}
              </span>
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
          </div>

          <div class="prose max-w-none text-gray-800 font-medium mb-4">
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

          <div class="space-y-4 text-sm pt-2">
            <div
              v-if="row.manager_response"
              class="bg-gray-50 pl-2 py-1 rounded-md border-l-4 border-indigo-400"
            >
              <strong class="text-indigo-600">Manager Response:</strong>
              <p class="text-gray-800">{{ row.manager_response }}</p>
              <span v-if="row.manager_response_at" class="text-xs text-gray-800"
                >At: {{ formatDate(row.manager_response_at) }}</span
              >
            </div>
            <div
              v-if="row.employee_response"
              class="bg-gray-50 pl-2 py-1 rounded-md border-l-4 border-blue-400"
            >
              <strong class="text-blue-600">Employee Response:</strong>
              <p class="text-gray-800">{{ row.employee_response }}</p>
              <span
                v-if="row.employee_response_at"
                class="text-xs text-gray-800"
                >At: {{ formatDate(row.employee_response_at) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Deadlines -->
      <div v-if="cardName === 'Deadlines'" class="space-y-4 min-w-4xl">
        <!-- Sort Header for Requests / Complaints -->
        <div
          class="flex items-center gap-2 text-indigo-800 font-bold text-lg cursor-pointer select-none"
          @click="toggleSort('due_date')"
        >
          Sort by Due Date
          <span>
            <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
            <ArrowDownUp v-else :size="16" />
          </span>
        </div>

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
                <span class="font-medium text-gray-800">Due Date:</span>
                {{ formatDate(row.due_date) }}
              </div>
            </div>
            <div>
              <h4 class="text-md font-bold text-gray-800 mb-1">Paid Amount</h4>
              <p class="text-lg font-semibold text-green-600">
                {{ row.paid_amount }} EGP
              </p>
              <div>
                <span class="font-medium text-gray-800">Paid on:</span>
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

      <!-- Pagination -->
      <Pagination
        v-if="
          totalPages > 1 && cardName !== 'Groups' && cardName !== 'Attendance'
        "
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-numbers="pageNumbers"
        @update:current-page="goToPage"
      />
    </div>
  </div>
</template>
