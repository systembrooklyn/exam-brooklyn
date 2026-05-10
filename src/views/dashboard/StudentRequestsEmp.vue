<template>
  <div
    class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-3 py-3 sm:px-4 sm:py-3"
  >
    <div class="w-full max-w-none">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3"
      >
        <div class="flex items-center gap-3 min-w-0">
          <router-link
            to="/systems"
            class="shrink-0 p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
          >
            <ArrowLeft class="w-5 h-5" />
          </router-link>
          <div class="min-w-0">
            <h1
              class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              Student requests
            </h1>
            <p
              v-if="apiMessage"
              class="text-gray-600 dark:text-gray-300 text-sm mt-1 truncate"
            >
              {{ apiMessage }}
              <span v-if="rows.length" class="text-gray-500">
                — {{ rows.length }} record(s)</span
              >
            </p>
            <p v-else class="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Student requests and complaints from API.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#624ff6] text-white text-sm font-medium shadow hover:opacity-95 disabled:opacity-50"
          :disabled="loading"
          @click="fetchRequests('refresh')"
        >
          <Loader2
            v-if="loading && fetchSource === 'refresh'"
            class="w-4 h-4 animate-spin"
          />
          <RefreshCw v-else class="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div
        class="mb-2 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/30 bg-white dark:bg-gray-800 px-3 py-3 space-y-3 shadow-sm"
      >
        <p
          class="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          <SlidersHorizontal class="h-3.5 w-3.5 text-[#624ff6]" aria-hidden="true" />
          Filters
        </p>
        <!-- Row 1: four filters (employee with first row) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label :class="filterLabelClass">From date</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <Calendar class="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                v-model="filters.from_date"
                type="date"
                :class="filterInputInnerClass"
              />
            </div>
          </div>
          <div>
            <label :class="filterLabelClass">To date</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <Calendar class="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                v-model="filters.to_date"
                type="date"
                :class="filterInputInnerClass"
              />
            </div>
          </div>
          <div>
            <label :class="filterLabelClass">Status</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <ListFilter class="h-4 w-4" aria-hidden="true" />
              </span>
              <select v-model="filters.status" :class="filterSelectInnerClass">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div
            ref="employeeDropdownRootRef"
            class="relative min-w-0"
          >
            <label :class="filterLabelClass">Employee</label>
            <button
              type="button"
              :class="[filterShellClass, 'p-0 cursor-pointer text-left w-full']"
              :aria-expanded="employeeDropdownOpen"
              aria-haspopup="listbox"
              @click="toggleEmployeeDropdown"
            >
              <span :class="filterIconSlotClass">
                <UserRound class="h-4 w-4" aria-hidden="true" />
              </span>
              <span
                class="flex min-h-[2.5rem] flex-1 min-w-0 items-center justify-between gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <span class="truncate">{{ selectedEmployeeTriggerLabel }}</span>
                <ChevronDown
                  class="h-4 w-4 shrink-0 text-gray-500 transition-transform"
                  :class="{ 'rotate-180': employeeDropdownOpen }"
                />
              </span>
            </button>
            <div
              v-show="employeeDropdownOpen"
              class="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg"
              role="listbox"
              @mousedown.prevent
            >
              <div
                class="border-b border-gray-100 dark:border-gray-700 px-2 pb-1.5 pt-1"
              >
                <input
                  ref="employeeSelectSearchInputRef"
                  v-model="employeeSelectSearchQuery"
                  type="search"
                  autocomplete="off"
                  placeholder="Search name or fingerprint..."
                  class="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#624ff6] focus:ring-1 focus:ring-[#624ff6] outline-none"
                  @keydown.escape.prevent="closeEmployeeDropdown"
                />
              </div>
              <ul class="max-h-48 overflow-y-auto text-sm">
                <li>
                  <button
                    type="button"
                    role="option"
                    class="w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer"
                    :class="{
                      'bg-indigo-50 dark:bg-gray-700 font-medium text-indigo-800 dark:text-indigo-200':
                        filterEmployeeId === '' || filterEmployeeId == null,
                    }"
                    @click="selectEmployeeFilter('')"
                  >
                    All employees
                  </button>
                </li>
                <li v-for="emp in filteredEmployeesForSelect" :key="emp.id">
                  <button
                    type="button"
                    role="option"
                    class="w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer"
                    :class="{
                      'bg-indigo-50 dark:bg-gray-700 font-medium text-indigo-800 dark:text-indigo-200':
                        String(filterEmployeeId) === String(emp.id),
                    }"
                    @click="selectEmployeeFilter(emp.id)"
                  >
                    <span>{{ hrEmployeeDisplayName(emp) }}</span>
                    <span
                      v-if="pickEmployeeFingerprint(emp)"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      ({{ pickEmployeeFingerprint(emp) }})
                    </span>
                  </button>
                </li>
                <li
                  v-if="filteredEmployeesForSelect.length === 0"
                  class="px-3 py-2 text-gray-400 text-xs"
                >
                  No employees match.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Row 2: type, field, search -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label :class="filterLabelClass">Type</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <Tags class="h-4 w-4" aria-hidden="true" />
              </span>
              <select v-model="filters.type" :class="filterSelectInnerClass">
                <option value="">All</option>
                <option value="request">Request</option>
                <option value="complain">Complain</option>
                <option value="edit">Edit</option>
              </select>
            </div>
          </div>
          <div>
            <label :class="filterLabelClass">Field</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <TextCursor class="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                v-model="filters.field"
                type="text"
                placeholder="e.g. Material, Scholarship"
                :class="filterInputInnerClass"
              />
            </div>
          </div>
          <div>
            <label :class="filterLabelClass">Search</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <SearchIcon class="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                v-model="filters.value"
                type="search"
                placeholder="Search"
                :class="filterInputInnerClass"
                @keydown.enter.prevent="fetchRequests('apply')"
              />
            </div>
          </div>
        </div>
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end pt-0.5"
        >
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-md bg-[#624ff6] px-4 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
              :disabled="loading"
              @click="fetchRequests('apply')"
            >
              <Loader2
                v-if="loading && fetchSource === 'apply'"
                class="mr-2 h-4 w-4 animate-spin"
              />
              Apply filters
            </button>
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              :disabled="loading"
              @click="clearFilters"
            >
              Clear
            </button>
            <p
              v-if="employeesLoadError"
              class="text-xs text-amber-600 dark:text-amber-400 w-full sm:w-auto"
            >
              Employee list failed to load.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="loading && rows.length === 0"
        class="w-full flex flex-col justify-center items-center py-16 min-h-[220px] bg-white dark:bg-gray-800 rounded-t-xl rounded-b-lg border border-[#624ff6]/20 dark:border-[#624ff6]/35 shadow-md fade-in"
        role="status"
        aria-live="polite"
      >
        <div
          class="animate-spin rounded-full h-10 w-10 border-4 border-[#624ff6] border-t-transparent"
        />
        <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Loading requests…
        </p>
      </div>

      <div v-else-if="rows.length > 0" class="fade-in w-full space-y-4">
        <div class="flex flex-wrap justify-between items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-lg cursor-pointer select-none"
            @click="toggleSortByDate"
          >
            Sort by date
            <span>
              <ArrowDownUp v-if="sortOrder === 'asc'" class="w-4 h-4" />
              <ArrowUpDown v-else class="w-4 h-4" />
            </span>
          </button>
        </div>

        <div
          v-for="(row, rowIndex) in paginatedRows"
          :key="row.id ?? rowIndex"
          class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2"
          >
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{
                formatDate(row.created_at)
              }}</span>
              <span
                class="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1"
              >
                <GraduationCap class="w-4 h-4 shrink-0" aria-hidden="true" />
                <span dir="auto" class="truncate max-w-[14rem] sm:max-w-xs">{{
                  row.student?.name || "—"
                }}</span>
              </span>
              <span
                v-if="row.student?.st_num != null || row.id != null"
                class="text-xs text-gray-500 dark:text-gray-400 tabular-nums"
              >
                {{ formatStudentNums(row) }}
              </span>
              <span
                v-if="row.employee?.name"
                class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <UserPen class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span dir="auto">{{ row.employee.name }}</span>
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="row.field"
                dir="auto"
                class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ row.field }}
              </span>
              <span
                v-if="row.type"
                class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
              >
                {{ row.type }}
              </span>
              <div class="relative inline-block min-w-[120px] text-center">
                <select
                  v-model="row.status"
                  class="w-full text-center cursor-pointer px-3 py-1 rounded-full text-sm font-medium capitalize appearance-none pr-6 focus:outline-none focus:ring-0 border-0"
                  :class="statusSelectClass(row.status)"
                  @change="updateRowStatus(row)"
                >
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div
                  v-if="loadingStatusId === row.id"
                  class="absolute top-1/2 right-2 -translate-y-1/2 pointer-events-none"
                >
                  <div
                    class="border-2 border-gray-300 border-t-green-600 rounded-full w-4 h-4 animate-spin"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
            style="direction: ltr"
          >
            <div
              class="max-w-none text-gray-800 dark:text-gray-200 font-medium text-sm leading-relaxed mb-2 sm:mb-0 flex-1 min-w-0"
            >
              <div class="mixed-text-container" dir="auto">
                <div
                  v-if="expandKey(row.id, 'value') === expandedCell.key"
                  class="mixed-text-content"
                >
                  {{ displayCell(row.value) }}
                  <button
                    type="button"
                    dir="ltr"
                    class="ms-2 inline text-sm text-indigo-600 dark:text-indigo-400 underline align-baseline"
                    @click.stop="toggleExpand(row.id, 'value')"
                  >
                    Less
                  </button>
                </div>
                <div v-else class="mixed-text-content">
                  {{ truncateWords(displayCell(row.value)) }}
                  <button
                    v-if="wordCount(displayCell(row.value)) > 35"
                    type="button"
                    dir="ltr"
                    class="ms-1 inline text-sm text-indigo-600 dark:text-indigo-400 underline align-baseline"
                    @click.stop="toggleExpand(row.id, 'value')"
                  >
                    More
                  </button>
                </div>
              </div>
              <p
                v-if="row.comment"
                class="text-xs text-gray-500 dark:text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-600 pt-2"
              >
                <span class="font-semibold text-gray-600 dark:text-gray-300"
                  >Comment:</span
                >
                <span dir="auto" class="inline pl-1 align-top">{{
                  row.comment
                }}</span>
              </p>
              <p
                v-if="row.student?.email"
                dir="ltr"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate"
              >
                {{ row.student.email }}
              </p>
            </div>
            <div
              class="flex items-center gap-2 shrink-0"
              style="direction: ltr; unicode-bidi: isolate"
            >
              <button
                v-if="!row.employee_response && canEmpReply"
                type="button"
                class="flex items-center justify-center gap-1 cursor-pointer bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-semibold text-sm px-3 py-1 rounded-lg shadow-sm transition"
                @click="openReplyModal(row, 'emp_res')"
              >
                Reply
                <MessageCircleReply class="w-[15px] h-[15px]" aria-hidden="true" />
              </button>
              <button
                v-if="!row.manager_response && canMngReply"
                type="button"
                class="flex items-center justify-center gap-1 cursor-pointer bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-semibold text-sm px-3 py-1 rounded-lg shadow-sm transition"
                @click="openReplyModal(row, 'mng_res')"
              >
                Reply
                <MessageCircleReply class="w-[15px] h-[15px]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="space-y-4 text-sm pt-3">
            <div
              v-if="row.manager_response"
              class="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border-s-4 border-indigo-400"
            >
              <strong
                dir="ltr"
                class="text-indigo-600 dark:text-indigo-400 block mb-1"
                >Manager reply:</strong
              >
              <div class="mixed-text-container" dir="auto">
                <div class="mixed-text-content">{{ row.manager_response }}</div>
              </div>
              <div class="flex flex-wrap items-center gap-4 mt-3">
                <span
                  v-if="row.manager_response_at"
                  class="text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1"
                >
                  <Clock class="w-[13px] h-[13px]" />
                  {{ formatDate(row.manager_response_at) }}
                </span>
                <span
                  v-if="row.manager?.name"
                  class="text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1"
                >
                  <UsersRound class="w-[13px] h-[13px]" />
                  {{ row.manager.name }}
                </span>
              </div>
            </div>

            <div
              v-if="row.employee_response"
              class="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border-s-4 border-blue-400"
            >
              <strong
                dir="ltr"
                class="text-blue-600 dark:text-blue-400 block mb-1"
                >Employee reply:</strong
              >
              <div class="mixed-text-container" dir="auto">
                <div class="mixed-text-content">{{ row.employee_response }}</div>
              </div>
              <div class="flex flex-wrap items-center gap-4 mt-3">
                <span
                  v-if="row.employee_response_at"
                  class="text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1"
                >
                  <Clock class="w-[13px] h-[13px]" />
                  {{ formatDate(row.employee_response_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-numbers="pageNumbers"
          @update:current-page="(p) => (currentPage = p)"
        />
      </div>

      <div
        v-else-if="!loading"
        class="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 fade-in"
      >
        <div class="relative inline-block mb-6">
          <div
            class="absolute inset-0 rounded-full bg-[#624ff6]/10 dark:bg-[#624ff6]/20 blur-3xl scale-150"
          />
          <img
            src="@/assets/undraw_empty_4zx0.png"
            alt=""
            class="relative mx-auto w-56 sm:w-72 md:w-80 max-w-full drop-shadow-xl"
          />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          No requests found
        </h2>
        <p
          class="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm sm:text-base leading-relaxed"
        >
          There are no student requests for the current filters, or none exist yet. Adjust your
          filters and click <span class="text-[#624ff6] font-semibold">Apply filters</span>, or
          <span class="text-[#624ff6] font-semibold">Clear</span> to reset.
        </p>
      </div>

      <ReplyRequestModal
        v-if="showReplyModal"
        v-model="showReplyModal"
        :field-key="replyKey"
        :loading-reply="loadingReply"
        @send-reply="handleReply"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Clock,
  GraduationCap,
  ListFilter,
  Loader2,
  MessageCircleReply,
  RefreshCw,
  Search as SearchIcon,
  SlidersHorizontal,
  Tags,
  TextCursor,
  UserPen,
  UserRound,
  UsersRound,
} from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { GET_STUDENT_REQUEST_EMP } from "@/api/Api";
import formatDate from "@/components/global/FormDate";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import ReplyRequestModal from "@/components/srmDashboard/ReplyRequestModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useRequestStore } from "@/stores/srmStore/requestStore";
import notyf from "@/components/global/notyf";
import { hrEmployeeDisplayName } from "@/utils/hrEmployeePickerLabel";
import { handleError } from "@/stores/handleError";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const requestStore = useRequestStore();

const loading = ref(false);
/** Drives which button shows a spinner: refresh | apply | initial (none). */
const fetchSource = ref(null);
const apiMessage = ref("");
const rows = ref([]);

const canEmpReply = computed(() => authStore.hasPermission("emp-reply"));
const canMngReply = computed(() => authStore.hasPermission("mng-reply"));

const showReplyModal = ref(false);
const selectedRequestId = ref(null);
const replyKey = ref("emp_res");
const loadingReply = ref(false);

const sortOrder = ref("desc");
const currentPage = ref(1);
const pageSize = 5;
const expandedCell = ref({});
const loadingStatusId = ref(null);

const sortedRows = computed(() => {
  const list = [...rows.value];
  list.sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return sortOrder.value === "asc" ? da - db : db - da;
  });
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pageSize)),
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedRows.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  if (total <= 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

watch(
  () => rows.value.length,
  () => {
    currentPage.value = 1;
  },
);

function toggleSortByDate() {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
}

function expandKey(rowId, field) {
  return `${rowId}-${field}`;
}

function formatStudentNums(row) {
  const st =
    row?.student?.st_num != null && String(row.student.st_num).trim() !== ""
      ? String(row.student.st_num).trim()
      : "";
  const id = row?.id != null ? String(row.id) : "";
  if (st && id) return `${st} · ${id}`;
  if (st) return st;
  return id || "—";
}

function displayCell(val) {
  return val ?? "No data available";
}

function truncateWords(text) {
  const s = displayCell(text);
  const words = String(s).split(/\s+/);
  if (words.length > 25) return words.slice(0, 25).join(" ") + "...";
  return s;
}

function wordCount(text) {
  return String(displayCell(text))
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function toggleExpand(rowId, field) {
  const k = expandKey(rowId, field);
  expandedCell.value =
    expandedCell.value.key === k ? {} : { key: k, rowId, field };
}

function statusSelectClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "closed")
    return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200";
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200";
  if (s === "approved")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (s === "rejected")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
  return "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
}

async function updateRowStatus(row) {
  const prev = row.status;
  if (loadingStatusId.value === row.id) return;
  loadingStatusId.value = row.id;
  try {
    const updated = await requestStore.updateRequest(row.id, {
      status: row.status,
    });
    if (!updated) {
      row.status = prev;
    } else {
      const idx = rows.value.findIndex(
        (r) => String(r.id) === String(updated.id ?? row.id),
      );
      if (idx !== -1) {
        rows.value[idx] = { ...rows.value[idx], ...updated };
      }
    }
  } catch {
    row.status = prev;
  } finally {
    loadingStatusId.value = null;
  }
}

function openReplyModal(row, key = "emp_res") {
  selectedRequestId.value = row?.id ?? null;
  replyKey.value = key;
  showReplyModal.value = true;
}

async function handleReply({ key, value }) {
  const id = selectedRequestId.value;
  if (id == null || id === "") return;
  const valueTrim = String(value ?? "").trim();
  const rowBefore = rows.value.find((r) => String(r.id) === String(id));
  const isManager = key === "mng_res";
  const hadReplyBefore = isManager
    ? String(rowBefore?.manager_response ?? "").trim().length > 0
    : String(rowBefore?.employee_response ?? "").trim().length > 0;

  loadingReply.value = true;
  try {
    const updated = await requestStore.updateRequest(
      id,
      { [key]: value },
      { suppressError: true, suppressSuccess: true },
    );
    if (updated) {
      const idx = rows.value.findIndex(
        (r) => String(r.id) === String(updated.id ?? id),
      );
      if (idx !== -1) {
        rows.value[idx] = { ...rows.value[idx], ...updated };
      }
      showReplyModal.value = false;
      notyf.success("Reply saved");
      return;
    }

    await fetchRequests("reply-sync");
    const rowAfter = rows.value.find((r) => String(r.id) === String(id));
    const respAfter = isManager
      ? String(rowAfter?.manager_response ?? "").trim()
      : String(rowAfter?.employee_response ?? "").trim();
    const prefixOk =
      !valueTrim ||
      respAfter.includes(valueTrim) ||
      respAfter.includes(valueTrim.slice(0, Math.min(60, valueTrim.length)));
    const saved =
      respAfter.length > 0 && (!hadReplyBefore || prefixOk);

    if (saved) {
      showReplyModal.value = false;
      notyf.success("Reply saved");
      return;
    }

    notyf.error("The reply could not be saved. Please try again or refresh.");
  } finally {
    loadingReply.value = false;
  }
}

const filterLabelClass =
  "block text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1";
const filterShellClass =
  "flex min-h-[2.5rem] rounded-lg border border-[#624ff6]/25 dark:border-[#624ff6]/35 bg-white dark:bg-gray-900 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#624ff6]/25 focus-within:border-[#624ff6]/45";
const filterIconSlotClass =
  "flex w-10 shrink-0 items-center justify-center self-stretch border-r border-[#624ff6]/15 dark:border-[#624ff6]/25 bg-[#624ff6]/[0.07] dark:bg-[#624ff6]/12 text-[#624ff6]";
const filterInputInnerClass =
  "min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none";
const filterSelectInnerClass =
  "min-h-[2.5rem] min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none";

/** Filter fields — sent only when set (server rejects null). */
const filters = ref({
  from_date: "",
  to_date: "",
  status: "",
  type: "",
  field: "",
  value: "",
});

const filterEmployeeId = ref("");
const employeeDropdownOpen = ref(false);
const employeeSelectSearchQuery = ref("");
const employeeSelectSearchInputRef = ref(null);
const employeeDropdownRootRef = ref(null);
const employeesLoadError = ref(false);

function pickEmployeeFingerprint(emp) {
  if (!emp) return "";
  const raw = emp.fingerprint ?? emp.personal_info?.fingerprint;
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  return s || "";
}

const filteredEmployeesForSelect = computed(() => {
  const list = employeeStore.employees || [];
  const q = String(employeeSelectSearchQuery.value ?? "")
    .toLowerCase()
    .trim();
  if (!q)
    return [...list].sort((a, b) =>
      hrEmployeeDisplayName(a).localeCompare(
        hrEmployeeDisplayName(b),
        undefined,
        { sensitivity: "base" },
      ),
    );
  return list
    .filter((emp) => {
      const label = hrEmployeeDisplayName(emp).toLowerCase();
      const fp = pickEmployeeFingerprint(emp).toLowerCase();
      return label.includes(q) || fp.includes(q);
    })
    .sort((a, b) =>
      hrEmployeeDisplayName(a).localeCompare(
        hrEmployeeDisplayName(b),
        undefined,
        { sensitivity: "base" },
      ),
    );
});

const selectedEmployeeTriggerLabel = computed(() => {
  const id = filterEmployeeId.value;
  if (id === "" || id == null) return "All employees";
  const list = employeeStore.employees || [];
  const emp = list.find((e) => String(e.id) === String(id));
  return emp ? hrEmployeeDisplayName(emp) : "All employees";
});

function closeEmployeeDropdown() {
  employeeDropdownOpen.value = false;
}

function toggleEmployeeDropdown() {
  employeeDropdownOpen.value = !employeeDropdownOpen.value;
  if (employeeDropdownOpen.value) {
    employeeSelectSearchQuery.value = "";
    nextTick(() => {
      employeeSelectSearchInputRef.value?.focus();
    });
  }
}

function selectEmployeeFilter(rawId) {
  filterEmployeeId.value =
    rawId === "" || rawId == null ? "" : String(rawId);
  employeeSelectSearchQuery.value = "";
  closeEmployeeDropdown();
}

function clearFilters() {
  filters.value = {
    from_date: "",
    to_date: "",
    status: "",
    type: "",
    field: "",
    value: "",
  };
  filterEmployeeId.value = "";
  fetchRequests("apply");
}

function onDocumentMousedownEmployeeDropdown(e) {
  if (!employeeDropdownOpen.value) return;
  const root = employeeDropdownRootRef.value;
  if (root && !root.contains(e.target)) {
    closeEmployeeDropdown();
  }
}

function buildFilterBody() {
  const f = filters.value;
  const body = {};
  if (f.from_date) body.from_date = f.from_date;
  if (f.to_date) body.to_date = f.to_date;
  if (f.status?.trim()) body.status = f.status.trim();
  if (f.type?.trim()) body.type = f.type.trim();
  if (f.field?.trim()) body.field = f.field.trim();
  if (f.value?.trim()) body.value = f.value.trim();
  if (filterEmployeeId.value) {
    const emp = employeeStore.employees.find(
      (e) => String(e.id) === String(filterEmployeeId.value),
    );
    if (emp) {
      const name = hrEmployeeDisplayName(emp).trim();
      if (name) body.emp_res = name;
    }
  }
  return body;
}

/**
 * @param {'refresh' | 'apply' | 'initial' | 'reply-sync'} source
 * `reply-sync`: refetch after reply without full-page loading or button spinners.
 */
async function fetchRequests(source = "apply") {
  const silent = source === "reply-sync";
  fetchSource.value = silent ? null : source;
  if (!silent) loading.value = true;
  try {
    const { data } = await apiClient.post(
      GET_STUDENT_REQUEST_EMP,
      buildFilterBody(),
    );
    apiMessage.value = data?.message || "";
    const raw = data?.data;
    rows.value = Array.isArray(raw) ? raw : [];
  } catch (e) {
    handleError(e);
    if (!silent) {
      rows.value = [];
      apiMessage.value = "";
    }
  } finally {
    if (!silent) loading.value = false;
    fetchSource.value = null;
  }
}

onMounted(async () => {
  document.addEventListener("mousedown", onDocumentMousedownEmployeeDropdown);
  employeesLoadError.value = false;
  try {
    await employeeStore.getEmployees();
  } catch {
    employeesLoadError.value = true;
  }
  await fetchRequests("initial");
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onDocumentMousedownEmployeeDropdown);
});
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
/* Mixed Arabic / English: use dir="auto" on .mixed-text-container in markup.
   unicode-bidi: plaintext keeps order natural for mixed scripts. */
.mixed-text-container {
  width: 100%;
  margin: 0.25rem 0;
}

.mixed-text-content {
  text-align: start;
  unicode-bidi: plaintext;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: normal;
  line-height: 1.65;
  padding: 0.25rem 0;
}

@media (max-width: 640px) {
  .mixed-text-content {
    font-size: 0.875rem;
    line-height: 1.35rem;
  }
}
</style>
