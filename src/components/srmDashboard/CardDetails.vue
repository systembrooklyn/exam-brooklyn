<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  cardName: String,
  headers: Array,
  data: Array,
  loading: Boolean,
});

const currentPage = ref(1);
const pageSize = 12;
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
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"
      ></div>
    </div>

    <div v-else-if="!hasData">
      <img
        class="mx-auto h-80 mt-10"
        src="@/assets/undraw_empty_4zx0.png"
        alt="No Data"
      />
      <p class="text-center mt-4 font-semibold text-gray-500">No Data Found</p>
    </div>

    <div v-else>
      <div class="space-y-4">
        <div
          v-for="(row, rowIndex) in paginatedData"
          :key="rowIndex"
          class="border rounded-lg shadow-md bg-gray-700 p-4 bg-white"
        >
          <!-- Student & Employee Names + Status -->
          <div
            class="flex justify-between items-center text-sm text-gray-600 mb-3"
          >
            <div class="flex items-center space-x-6">
              <span> {{ row.field }}</span>
              <span>{{ formatDate(row.created_at) }}</span>
            </div>
            <span
              :class="{
                'text-green-600': row.status === 'closed',
                'text-yellow-600': row.status === 'pending',
              }"
            >
              ● {{ row.status }}
            </span>
          </div>

          <!-- Request Value -->
          <div class="mb-4">
            <div class="font-medium text-primary">
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

                <!-- Only show truncated text + More button if text is long enough -->
                <span v-else>
                  {{
                    displayValue(row.value).split(" ").slice(0, 35).join(" ")
                  }}

                  <!-- Show "More" only if total words > 20 -->
                  <span v-if="displayValue(row.value).split(' ').length > 20">
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

              <!-- Fallback in case 'value' isn't expandable (shouldn't happen here) -->
              <template v-else>
                {{ displayValue(row.value) }}
              </template>
            </div>
          </div>

          <!-- Optional: Show Manager / Employee Response if exists -->
          <div class="mt-3 pt-3 border-t border-gray-300">
            <!-- <button
        v-if="!expandedCell.key?.includes(rowIndex)"
        class="text-sm text-indigo-600 underline"
        @click.stop="toggleExpand(rowIndex, 'manager_response')"
      >
        Show Responses
      </button> -->
            <!-- <button
        v-if="!expandedCell.key?.includes(rowIndex)"
        class="text-sm text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full"
        @click.stop="toggleExpand(rowIndex, 'manager_response')"
      >
        Show Responses
      </button> -->

            <div class="text-sm space-y-2">
              <div v-if="row.manager_response" class="text-gray-800">
                <strong class="text-indigo-400">Manager Response:</strong>
                {{ row.manager_response }}
                <span
                  class="text-xs font-semibold text-black ml-2"
                  v-if="row.manager_response_at"
                >
                  (At: {{ formatDate(row.manager_response_at) }})
                </span>
              </div>
              <div v-if="row.employee_response" class="text-gray-800">
                <strong class="text-indigo-400">Employee Response:</strong>
                {{ row.employee_response }}
                <span
                  class="text-xs font-semibold text-black ml-2"
                  v-if="row.employee_response_at"
                >
                  (At: {{ formatDate(row.employee_response_at) }})
                </span>
              </div>

              <!-- <button
          class="text-sm text-indigo-600 underline mt-2"
          @click.stop="toggleExpand(rowIndex, 'manager_response')"
        >
          Hide Responses
        </button> -->
            </div>
          </div>
        </div>
      </div>
      <!-- <table class="min-w-full border border-gray-300 text-center">
        <thead>
          <tr class="bg-gray-300 text-primary text-lg">
            <template v-for="col in computedHeaders" :key="col">
              <th
                :key="col"
                v-if="shouldShowColumn(col)"
                class="border border-blue-300 px-4 py-3 capitalize"
              >
                {{
                  col === "value"
                    ? "Request"
                    : col === "created_at"
                    ? "Date"
                    : col.replace(/_/g, " ")
                }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in paginatedData"
            :key="rowIndex"
            class="hover:bg-gray-50"
          >
            <template v-for="col in computedHeaders" :key="col">
              <td
                v-if="shouldShowColumn(col)"
                class="border max-w-50 break-words border-gray-300 px-4 py-2"
              >
                
             
               <template v-if="expandableColumns.includes(col)"
                >
                  <span class="block">
                    <span v-if="`${rowIndex}-${col}` === expandedCell.key">
                      {{ displayValue(row[col]) }}
                      <button
                        class="ml-2 text-sm text-indigo-600 underline"
                        @click="toggleExpand(rowIndex, col)"
                      >
                        Less
                      </button>
                    </span>
                    <span v-else>
                      {{
                        displayValue(row[col]).split(" ").slice(0, 3).join(" ")
                      }}
                      <span v-if="displayValue(row[col]).split(' ').length > 3">
                        ...
                        <button
                          class="ml-1 text-sm text-indigo-600 underline cursor-pointer"
                          @click="toggleExpand(rowIndex, col)"
                        >
                          More
                        </button>
                      </span>
                    </span>
                  </span>

                  
                  <span
                    v-if="col === 'employee_response'"
                    class="text-sm text-gray-500 block mt-1"
                  >
                    {{
                      row.employee_response_at
                        ? `At: ${formatDate(row.employee_response_at)}`
                        : ""
                    }}
                  </span>
                  <span
                    v-if="col === 'manager_response'"
                    class="text-sm text-gray-500 block mt-1"
                  >
                    {{
                      row.manager_response_at
                        ? `At: ${formatDate(row.manager_response_at)}`
                        : ""
                    }}
                  </span>
                </template>
                
                <span v-else-if="col === 'total_lec'">
                  {{ row.type === "online" ? 0 : row[col] ?? "" }}
                </span>

                <span v-else-if="col === 'start_date'">
                  {{ row.type === "class" ? formatDate(row[col]) : "_" }}
                </span>

                <span v-else-if="col === 'student_start'">
                  {{ row.type === "online" ? formatDate(row[col]) : "_" }}
                </span>

                <span v-else-if="col === 'paid_date'">
                  {{
                    row.status === "paid"
                      ? displayValue(row[col])
                      : "No Data Available"
                  }}
                </span>

                <span
                  v-else-if="col === 'status'"
                  :class="{
                    'text-green-600 font-semibold': row[col] === 'paid',
                    'text-red-600 font-semibold': row[col] === 'unpaid',
                    'text-yellow-500 font-semibold': row[col] === 'partialPaid',
                  }"
                >
                  {{ row[col] }}
                </span>
                <span v-else>
                  {{ row[col] ?? "No Data Available" }}
                </span>
              </td>
            </template>
          </tr>
        </tbody>
      </table> -->

      <!-- Pagination -->
      <div
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
      </div>
    </div>
  </div>
</template>
