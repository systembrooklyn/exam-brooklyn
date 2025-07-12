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

function handleStatusChange(row) {
  console.log("New status:", row.status);
  // هنا تقدر تبعت update للباك اند
  // مثلاً axios.post('/api/update-status', { id: row.id, status: row.status })
}

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
  <div class="p-6">
    <div v-if="loading" class="flex justify-center items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
    </div>

    <div v-else-if="!hasData">
      <img class="mx-auto h-80 mt-10" src="@/assets/undraw_empty_4zx0.png" alt="No Data" />
      <p class="text-center mt-4 font-semibold text-gray-500">No Data Found</p>
    </div>

    <div v-else>
      <div class="space-y-4">
        <div v-for="(row, rowIndex) in paginatedData" :key="rowIndex" class="border rounded-lg shadow-md p-4 bg-white">
          <!--Requests & Complaints   -->
          <div v-if="cardName === 'Requests' || cardName === 'Complaints'"
            class="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300">
            <!-- Header: Name, Date, Status -->
            <div class="flex justify-between items-center mb-4 pb-3 border-b">
              <div class="flex items-center space-x-6">
                <h4 class="font-semibold text-gray-800">{{ row.field }}</h4>
                <span class="text-sm text-gray-500">{{
                  formatDate(row.created_at)
                }}</span>
              </div>

              <span :class="{
                'bg-green-100 text-green-700': row.status === 'closed',
                'bg-yellow-100 text-yellow-700': row.status === 'pending',
              }" class="px-3 py-1 rounded-full text-sm font-medium capitalize">
                {{ row.status }}
              </span>
            </div>

            <!-- Request/Complaint Text -->
            <div class="mb-5">
              <div class="prose max-w-none text-gray-700">
                <template v-if="expandableColumns.includes('value')">
                  <span v-if="`${rowIndex}-value` === expandedCell.key">
                    {{ displayValue(row.value) }}
                    <button class="ml-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                      @click.stop="toggleExpand(rowIndex, 'value')">
                      Less
                    </button>
                  </span>

                  <span v-else>
                    {{
                      displayValue(row.value).split(" ").slice(0, 35).join(" ")
                    }}
                    <span v-if="displayValue(row.value).split(' ').length > 35">
                      ...
                      <button class="ml-1 text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        @click.stop="toggleExpand(rowIndex, 'value')">
                        More
                      </button>
                    </span>
                  </span>
                </template>

                <template v-else>
                  {{ displayValue(row.value) }}
                </template>
              </div>
            </div>

            <!-- Responses Section -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="space-y-4 text-sm">
                <!-- Manager Response -->
                <div v-if="row.manager_response" class="bg-gray-50 p-3 rounded-md border-l-4 border-indigo-400">
                  <strong class="text-indigo-600">Manager Response:</strong>
                  <p class="mt-1 text-gray-800">{{ row.manager_response }}</p>
                  <span v-if="row.manager_response_at" class="text-xs text-gray-500">
                    At: {{ formatDate(row.manager_response_at) }}
                  </span>
                </div>

                <!-- Employee Response -->
                <div v-if="row.employee_response" class="bg-gray-50 p-3 rounded-md border-l-4 border-blue-400">
                  <strong class="text-blue-600">Employee Response:</strong>
                  <p class="mt-1 text-gray-800">{{ row.employee_response }}</p>
                  <span v-if="row.employee_response_at" class="text-xs text-gray-500">
                    At: {{ formatDate(row.employee_response_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Deadlines -->
          <div v-if="cardName === 'Deadlines'" class="bg-white p-5 rounded-lg shadow-md border border-gray-200">
            <!-- Header with Name, Date, and Status -->
            <div class="flex justify-between items-center mb-4">
              <div>
                <span class="font-medium text-gray-500">Due Date:</span>
                {{ formatDate(row.due_date) }}
              </div>
              <span class="font-bold text-primary">{{
                row.total_payment
              }}</span>
              <span class="px-3 py-1 rounded-full text-sm font-medium text-white bg-green-500">
                {{ row.status }}
              </span>
            </div>

            <!-- Amount Section -->
            <div class="flex justify-between items-center space-x-4">
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                <p class="text-xl font-bold text-indigo-600">
                  {{ displayValue(row.amount) }} EGP
                </p>
              </div>

              <!-- Paid Amount -->
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">
                  Paid Amount
                </h4>
                <p class="text-lg font-semibold text-green-600">
                  {{ row.paid_amount }} EGP
                </p>
              </div>
            </div>
          </div>
          <!-- invoices -->
          <div v-if="cardName === 'Invoices'"
            class="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 border-b pb-4">
              <h3 class="text-xl font-semibold text-gray-800">
                Invoice #{{ row.serial }}
              </h3>
              <div class="mt-2 md:mt-0 flex items-center space-x-3">
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  {{ row.type }}
                </span>
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  {{ row.pay_cat }}
                </span>
              </div>
            </div>

            <!-- Top Info Row -->
            <div class="flex items-center justify-between mb-5 text-sm text-gray-700">
              <div>
                <p class="text-gray-900">{{ formatDate(row.created_at) }}</p>
              </div>

              <div>
                <p class="font-medium text-gray-500">Payment Method</p>
                <p class="text-gray-900 capitalize">{{ row.pay_method }}</p>
              </div>
              <div>
                <p class="text-gray-900 capitalize">{{ row.employee.name }}</p>
              </div>
            </div>

            <!-- Amount Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                <p class="text-2xl font-bold text-indigo-600">
                  {{ displayValue(row.amount) }} EGP
                </p>
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-5">
              <p class="font-medium text-gray-500 mb-1">Notes</p>
              <p class="text-gray-800 italic bg-gray-50 p-3 rounded-md">
                {{ row.notes }}
              </p>
            </div>

            <!-- Employee Info -->
          </div>
          <!-- groups -->
          <div v-if="cardName === 'Groups'"
            class="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300">
            <!-- Header -->
            <div class="flex justify-between items-center mb-5 border-b pb-4">
              <h3 class="text-xl font-bold text-indigo-800">{{ row.name }}</h3>
              <div v-if="row.type === 'online'">
                <p class="text-gray-500 text-sm font-medium">
                  {{ formatDate(row.student_start) }}
                </p>
              </div>

              <div v-else>
                <p class="text-gray-500 text-sm font-medium">
                  {{ formatDate(row.start_date) }}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                {{ row.type }}
              </span>
            </div>

            <!-- Group Info Grid -->
            <div class="flex justify-between items-center gap-5 text-sm text-gray-700">
              <div>
                <p class="font-medium text-gray-500">Code</p>
                <p class="text-gray-900 font-semibold">{{ row.code }}</p>
              </div>

              <div>
                <p class="font-medium text-gray-500">Total Lectures</p>
                <p class="text-primary font-bold text-lg">
                  {{ row.total_lec }}
                </p>
              </div>
              <div>
                <span :class="{
                  'text-green-600': row.is_active,
                  'text-red-600': !row.is_active,
                }" class="inline-block mt-1 px-2 py-1 rounded text-sm font-medium" :style="{
                    backgroundColor: row.is_active ? '#d1fae5' : '#fee2e2',
                    color: row.is_active ? '#047857' : '#be123c',
                  }">
                  {{ row.is_active ? "Active" : "Inactive" }}
                </span>
              </div>

              <!-- Conditional Display Based on Type -->
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <!-- Pagination -->
      <Pagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
        :page-numbers="pageNumbers" @update:current-page="goToPage" />
      <!-- <div
        v-if="totalPages > 1"
        class="mt-6 flex justify-center items-center space-x-2"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          @click="goToPage(page)"
          class="px-3 py-1 border rounded"
          :class="{
            'bg-indigo-600 text-white font-bold rounded-full':
              page === currentPage,
            'bg-white text-gray-700 hover:bg-gray-100': page !== currentPage,
            'cursor-default': page === '...',
          }"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div> -->
    </div>
  </div>
</template>
