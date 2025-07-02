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

// 🧠 الأعمدة اللي عايز تخفيها لكل cardName
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
  Invoices: [], // لو حبيت تخفي من Invoices بعدين
  // Add more if needed
};

const statusOptions = ['pending', 'open', 'closed']; // عدلها حسب الحالات المتاحة

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

  // لو الكارد ريكويست، خليه يحط created_at أول حاجة
  if (props.cardName === 'Requests') {
    const withoutCreatedAt = props.headers.filter(h => h !== 'created_at');
    return ['created_at', ...withoutCreatedAt];
  }

  return props.headers;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.data ? props.data.slice(start, start + pageSize) : [];
});

const pageNumbers = computed(() => {
  const pages = [];
  const total = totalPages.value;
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (currentPage.value <= 3) pages.push(1, 2, 3, "...", total);
    else if (currentPage.value >= total - 2)
      pages.push(1, "...", total - 2, total - 1, total);
    else pages.push(1, "...", currentPage.value, "...", total);
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

// ✨ الدالة اللي بتقول لو العمود ده المفروض يبان ولا لأ
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
      <table class="min-w-full border border-gray-300 text-center">
        <thead>
          <tr class="bg-gray-300 text-primary text-lg">
            <template v-for="col in computedHeaders " :key="col">
              <th
                :key="col"
                v-if="shouldShowColumn(col)"
                class="border border-blue-300 px-4 py-3 capitalize"
              >
                   {{
      col === 'value'
        ? 'Request'
        : col === 'created_at'
        ? 'Date'
        : col.replace(/_/g, ' ')
    }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
       <tr v-for="(row, rowIndex) in paginatedData" :key="rowIndex" class="hover:bg-gray-50 ">
  <template v-for="col in computedHeaders" :key="col">
    <td v-if="shouldShowColumn(col)" class="border max-w-50 break-words border-gray-300 px-4 py-2">
      <!-- Expanded Text in Requests -->
      <template
        v-if="props.cardName === 'Requests' &&
          ['value', 'comment', 'manager_response', 'employee_response'].includes(col)"
      >
        <span class="block">
          <span v-if="`${rowIndex}-${col}` === expandedCell.key">
            {{ row[col] }}
            <button
              class="ml-2 text-sm text-indigo-600 underline"
              @click="toggleExpand(rowIndex, col)"
            >
              Less
            </button>
          </span>
          <span v-else class="w-40">
            {{ row[col]?.slice(0, 20) }}
            <span v-if="row[col]?.length > 40">
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

        <!-- ✅ Show related *_at under the field -->
       <span v-if="col === 'employee_response'" class="text-sm text-gray-500 block mt-1">
  {{ row.employee_response_at ? `At: ${formatDate(row.employee_response_at)}` : '' }}
</span>
<span v-if="col === 'manager_response'" class="text-sm text-gray-500 block mt-1">
  {{ row.manager_response_at ? `At: ${formatDate(row.manager_response_at)}` : '' }}
</span>




      </template>
      <span
  v-else-if="col === 'status' && props.cardName === 'Requests'"
>
  <select
    v-model="row.status"
    @change="handleStatusChange(row)"
    class="bg-transparent w-full font-semibold
      focus:outline-none cursor-pointer 
      text-green-600"
    :class="{
      'text-green-600': row.status === 'paid',
      'text-red-600': row.status === 'closed',
      'text-yellow-500': row.status === 'partialPaid',
    }"
  >
    <option
      v-for="status in statusOptions"
      :key="status"
      :value="status"
      class="text-black px-2 text-sm "
    >
      {{ status }}
    </option>
  </select>
</span>

      <!-- Other fields -->
      <span v-else-if="col === 'total_lec'">
        {{ row.type === 'online' ? 0 : row[col] ?? '' }}
      </span>

      <span v-else-if="col === 'start_date'">
        {{ row.type === 'class' ? formatDate(row[col]) : '_' }}
      </span>

      <span v-else-if="col === 'student_start'">
        {{ row.type === 'online' ? formatDate(row[col]) : '_' }}
      </span>

      <span v-else-if="col === 'paid_date'">
        {{ row.status === 'paid' ? row[col] : '-' }}
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
        {{ row[col] ?? '' }}
      </span>
    </td>
  </template>
</tr>

        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="cardName === 'Invoices'"
        class="mt-6 flex justify-center items-center space-x-2"
      >
        <button
          @click="currentPage.value--"
          :disabled="currentPage.value === 1"
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
            'bg-indigo-600 text-white': page === currentPage.value,
            'bg-white text-gray-700 hover:bg-gray-100':
              page !== currentPage.value,
            'cursor-default': page === '...',
          }"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>

        <button
          @click="currentPage.value++"
          :disabled="currentPage.value === totalPages.value"
          class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
