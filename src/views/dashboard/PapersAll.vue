<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 animate-fade-in">
    <div class="mx-auto w-full min-w-0 max-w-[1200px] px-2.5 sm:px-4 md:px-5 lg:px-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Student Papers
          </h1>
          <p v-if="apiMessage" class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-0.5">
            {{ apiMessage }}
            <span v-if="papers.length" class="text-gray-500">
              — {{ papers.length }} paper(s) · {{ studentGroups.length }} student(s)
            </span>
          </p>
          <p v-else class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
            One accordion per student — expand to see that student&apos;s papers.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#624ff6] text-white text-xs sm:text-sm font-medium shadow hover:opacity-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          :disabled="loading"
          @click="fetchPapers('refresh')"
        >
          <Loader2 v-if="loading && fetchSource === 'refresh'" class="w-4 h-4 animate-spin" />
          <RefreshCw v-else class="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div
        class="mb-3 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/30 bg-white dark:bg-gray-800 px-2 py-2 shadow-sm"
      >
        <p
          class="flex items-center gap-1 text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
        >
          <SlidersHorizontal class="h-3 w-3 text-[#624ff6]" aria-hidden="true" />
          Filters
          <span
            v-if="filtersApplied.length"
            class="normal-case font-normal text-gray-400"
          >
            ({{ filtersApplied.join(", ") }})
          </span>
        </p>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end"
        >
          <div class="min-w-0">
            <label :class="filterLabelClass">From date</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <input v-model="filters.from" type="date" :class="filterInputInnerClass" />
            </div>
          </div>
          <div class="min-w-0">
            <label :class="filterLabelClass">To date</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <input v-model="filters.to" type="date" :class="filterInputInnerClass" />
            </div>
          </div>
          <div class="min-w-0">
            <label :class="filterLabelClass">Status</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <ListFilter class="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <select v-model="filters.status" :class="filterSelectInnerClass">
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="final_approve">Final approve</option>
              </select>
            </div>
          </div>
          <div class="min-w-0">
            <label :class="filterLabelClass">Paper type</label>
            <select
              v-model="filterType"
              class="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#624ff6] focus:ring-1 focus:ring-[#624ff6] outline-none"
            >
              <option value="">All types</option>
              <option v-for="t in paperTypeOptions" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-1.5 pt-2">
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center rounded-md bg-[#624ff6] px-3 text-xs sm:text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="loading"
            @click="fetchPapers('apply')"
          >
            <Loader2 v-if="loading && fetchSource === 'apply'" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Apply filters
          </button>
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="loading"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        v-if="loading && !papers.length"
        class="flex items-center justify-center py-16 text-gray-500"
      >
        <Loader2 class="w-8 h-8 animate-spin text-[#624ff6]" />
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-red-700 dark:text-red-300 text-sm"
      >
        {{ error }}
      </div>

      <div v-else-if="filteredStudentGroups.length" class="space-y-2">
        <article
          v-for="group in paginatedStudentGroups"
          :key="group.studentId"
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
          <button
            type="button"
            class="w-full flex items-start gap-3 text-left px-3 sm:px-4 py-3 bg-gray-50/90 dark:bg-gray-900/40 hover:bg-gray-100/90 dark:hover:bg-gray-900/60 transition-colors cursor-pointer"
            :aria-expanded="isStudentExpanded(group.studentId)"
            @click="toggleStudent(group.studentId)"
          >
            <span class="mt-0.5 text-[#624ff6] shrink-0">
              <ChevronDown v-if="isStudentExpanded(group.studentId)" class="w-5 h-5" />
              <ChevronRight v-else class="w-5 h-5" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 gap-y-1">
                <h2 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {{ group.student?.name || "Unknown student" }}
                </h2>
                <span
                  v-if="group.student?.st_num"
                  class="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full tabular-nums"
                >
                  St #{{ group.student.st_num }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ group.papers.length }} paper(s)
                  <span v-if="group.pendingCount" class="text-amber-600 dark:text-amber-400 font-medium">
                    · {{ group.pendingCount }} pending
                  </span>
                </span>
              </div>
              <div
                v-if="group.student?.email || formatStudentPhones(group.student).length"
                class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400"
              >
                <span v-if="group.student?.email" class="break-all">
                  {{ group.student.email }}
                </span>
                <template v-if="formatStudentPhones(group.student).length">
                  <span
                    v-if="group.student?.email"
                    class="hidden sm:inline text-gray-300 dark:text-gray-600"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <span
                    v-for="(ph, pi) in formatStudentPhones(group.student)"
                    :key="pi"
                    class="tabular-nums text-gray-600 dark:text-gray-300"
                  >
                    <span v-if="pi > 0" class="text-gray-300 dark:text-gray-600 mx-1">·</span>{{ ph }}
                  </span>
                </template>
              </div>
            </div>
          </button>

          <div
            v-show="isStudentExpanded(group.studentId)"
            class="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700"
          >
            <section
              v-for="paper in group.papers"
              :key="paper.id"
              class="px-3 sm:px-4 py-3"
            >
              <div class="flex items-start gap-2">
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-semibold text-gray-900 dark:text-white">
                      {{ formatPaperType(paper.type) }}
                    </span>
                    <span
                      class="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      :class="statusBadgeClass(paper)"
                    >
                      {{ statusLabel(paper) }}
                    </span>
                    <span class="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
                      {{ formatDate(paper.created_at) }}
                    </span>
                    <a
                      v-if="paper.link"
                      :href="paper.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-0.5 text-xs text-[#624ff6] hover:underline cursor-pointer"
                    >
                      <ExternalLink class="w-3 h-3" />
                      View file
                    </a>
                  </div>
                  <p
                    v-if="paper.current_status"
                    class="text-[11px] text-gray-500 dark:text-gray-400 leading-snug"
                  >
                    <span class="font-medium capitalize text-gray-600 dark:text-gray-300">
                      {{ paper.current_status.action }}
                    </span>
                    <span v-if="paper.current_status.notes"> — {{ paper.current_status.notes }}</span>
                    <span v-if="paper.current_status.action_by?.name">
                      · {{ paper.current_status.action_by.name }}
                    </span>
                    <span v-if="paper.current_status.created_at">
                      · {{ formatDate(paper.current_status.created_at) }}
                    </span>
                  </p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  :disabled="!canReview(paper) || updatingId === paper.id"
                  @click="openStatusModal(paper, 'approve')"
                >
                  <Check class="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  :disabled="!canReview(paper) || updatingId === paper.id"
                  @click="openStatusModal(paper, 'reject')"
                >
                  <X class="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
              </div>

            </section>
          </div>
        </article>

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
        class="text-center py-10 px-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">No papers found</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Adjust filters or refresh when students upload documents.
        </p>
      </div>
    </div>

    <!-- Status notes modal -->
    <div
      v-if="showStatusModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      @click.self="closeStatusModal"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="statusModalTitleId"
      >
        <div
          class="flex items-center justify-between px-5 py-4 text-white"
          :class="statusModalAction === 'approve' ? 'bg-emerald-600' : 'bg-red-600'"
        >
          <h2 :id="statusModalTitleId" class="text-base sm:text-lg font-semibold">
            {{ statusModalAction === "approve" ? "Approve paper" : "Reject paper" }}
          </h2>
          <button
            type="button"
            aria-label="Close"
            class="h-8 w-8 grid place-items-center rounded-full hover:bg-white/15 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="!!updatingId"
            @click="closeStatusModal"
          >
            &times;
          </button>
        </div>

        <div class="px-5 pt-4 pb-2 space-y-3">
          <p v-if="statusModalPaper" class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-medium text-gray-900 dark:text-white">
              {{ statusModalPaper.student?.name || "Student" }}
            </span>
            · {{ formatPaperType(statusModalPaper.type) }}
          </p>
          <div>
            <label
              for="paper-status-notes"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Notes <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="paper-status-notes"
              ref="statusNotesInputRef"
              v-model="modalNotes"
              rows="4"
              placeholder="Add a note for this review…"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#624ff6] focus:border-transparent resize-y min-h-[100px]"
              :disabled="!!updatingId"
              @keydown.enter.ctrl.prevent="confirmStatusUpdate"
            />
          </div>
        </div>

        <div class="px-5 pb-5 pt-2 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="!!updatingId"
            @click="closeStatusModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 transition"
            :class="statusModalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'"
            :disabled="!!updatingId || !statusModalPaper"
            @click="confirmStatusUpdate"
          >
            <Loader2 v-if="updatingId" class="w-4 h-4 animate-spin" />
            <span>{{ statusModalAction === "approve" ? "Confirm approve" : "Confirm reject" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ListFilter,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { PAPERS_ALL, PAPER_STATUS } from "@/api/Api";
import formatDate from "@/components/global/FormDate";
import notyf from "@/components/global/notyf";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import { handleError } from "@/stores/handleError";

const filterLabelClass =
  "block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5";
const filterShellClass =
  "flex items-center rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden focus-within:border-[#624ff6] focus-within:ring-1 focus-within:ring-[#624ff6]";
const filterIconSlotClass =
  "flex shrink-0 items-center justify-center pl-2 text-gray-400";
const filterInputInnerClass =
  "min-w-0 flex-1 border-0 bg-transparent py-1.5 pr-2 text-sm text-gray-900 dark:text-gray-100 outline-none";
const filterSelectInnerClass =
  "min-w-0 flex-1 border-0 bg-transparent py-1.5 pr-2 text-sm text-gray-900 dark:text-gray-100 outline-none cursor-pointer";

const PAPER_TYPE_LABELS = {
  experience_letter: "Experience letter",
  hr_letter: "HR letter",
  certificate: "Certificate",
  back_id: "Back ID",
  front_id: "Front ID",
};

const paperTypeOptions = Object.entries(PAPER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const loading = ref(true);
const fetchSource = ref(null);
const error = ref(null);
const apiMessage = ref("");
const papers = ref([]);
const filters = ref({ from: "", to: "", status: "" });
const filtersApplied = ref([]);
const filterType = ref("");
const currentPage = ref(1);
const pageSize = 10;
const expandedStudents = ref(new Set());
const showStatusModal = ref(false);
const statusModalPaper = ref(null);
const statusModalAction = ref("approve");
const modalNotes = ref("");
const statusNotesInputRef = ref(null);
const updatingId = ref(null);
const updatingAction = ref(null);

const statusModalTitleId = "paper-status-modal-title";

const filteredPapers = computed(() => {
  let list = papers.value;
  if (filterType.value) {
    list = list.filter((p) => p.type === filterType.value);
  }
  return list;
});

/** Stable key so student_id `3` and `"3"` group together. */
function paperStudentKey(paper) {
  const raw = paper.student_id ?? paper.student?.id;
  if (raw != null && String(raw).trim() !== "") return String(raw).trim();
  return `unknown-${paper.id}`;
}

const studentGroups = computed(() => {
  const map = new Map();
  for (const paper of papers.value) {
    const studentId = paperStudentKey(paper);
    if (!map.has(studentId)) {
      map.set(studentId, {
        studentId,
        student: paper.student,
        papers: [],
        pendingCount: 0,
      });
    }
    const g = map.get(studentId);
    g.papers.push(paper);
    if (canReview(paper)) g.pendingCount += 1;
  }
  for (const g of map.values()) {
    g.papers.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.papers[0]?.created_at || "";
    const tb = b.papers[0]?.created_at || "";
    return String(tb).localeCompare(String(ta));
  });
});

const filteredStudentGroups = computed(() => {
  const map = new Map();
  for (const paper of filteredPapers.value) {
    const studentId = paperStudentKey(paper);
    if (!map.has(studentId)) {
      const base = studentGroups.value.find((g) => g.studentId === studentId);
      map.set(studentId, {
        studentId,
        student: paper.student ?? base?.student,
        papers: [],
        pendingCount: 0,
      });
    }
    const g = map.get(studentId);
    g.papers.push(paper);
    if (canReview(paper)) g.pendingCount += 1;
  }
  for (const g of map.values()) {
    g.papers.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.papers[0]?.created_at || "";
    const tb = b.papers[0]?.created_at || "";
    return String(tb).localeCompare(String(ta));
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudentGroups.value.length / pageSize)),
);

const paginatedStudentGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredStudentGroups.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  if (total <= 7) {
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

watch([filteredStudentGroups, filterType], () => {
  currentPage.value = 1;
});

function buildPapersQueryParams() {
  const params = {};
  const f = filters.value;
  if (f.from?.trim()) params.from = f.from.trim();
  if (f.to?.trim()) params.to = f.to.trim();
  if (f.status?.trim()) params.status = f.status.trim();
  return params;
}

function clearFilters() {
  filters.value = { from: "", to: "", status: "" };
  filterType.value = "";
  fetchPapers("apply");
}

function formatPaperType(type) {
  if (!type) return "—";
  return PAPER_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

function formatStudentPhones(student) {
  const raw = student?.phones;
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => String(p ?? "").trim()).filter(Boolean);
}

function paperStatusKey(paper) {
  const action = paper?.current_status?.action;
  if (!action) return "pending";
  if (action === "rejected") return "rejected";
  if (action === "final_approve") return "final_approve";
  if (action === "approve" || action === "approved") return "approved";
  return "pending";
}

function statusLabel(paper) {
  const key = paperStatusKey(paper);
  if (key === "approved") return "Approved";
  if (key === "final_approve") return "Final approve";
  if (key === "rejected") return "Rejected";
  return "Pending";
}

function statusBadgeClass(paper) {
  const key = paperStatusKey(paper);
  if (key === "approved" || key === "final_approve")
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200";
  if (key === "rejected")
    return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
  return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200";
}

function canReview(paper) {
  return paperStatusKey(paper) === "pending";
}

function isStudentExpanded(id) {
  return expandedStudents.value.has(id);
}

function toggleStudent(id) {
  const next = new Set(expandedStudents.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedStudents.value = next;
}

async function fetchPapers(source = "initial") {
  const silent = source === "silent";
  if (!silent) {
    fetchSource.value = source;
    loading.value = true;
  }
  error.value = null;
  try {
    const { data } = await apiClient.get(PAPERS_ALL, {
      params: buildPapersQueryParams(),
    });
    apiMessage.value = data?.message ?? "";
    filtersApplied.value = Array.isArray(data?.filters_applied)
      ? data.filters_applied
      : [];
    papers.value = Array.isArray(data?.data) ? data.data : [];
    if (!silent) {
      expandedStudents.value = new Set();
      currentPage.value = 1;
    }
  } catch (e) {
    const msg =
      e?.response?.data?.message || e?.message || "Failed to load papers.";
    if (!silent) {
      error.value = msg;
      papers.value = [];
    }
    handleError(e);
  } finally {
    if (!silent) loading.value = false;
    fetchSource.value = null;
  }
}

function openStatusModal(paper, action) {
  if (!canReview(paper)) return;
  statusModalPaper.value = paper;
  statusModalAction.value = action;
  modalNotes.value = "";
  showStatusModal.value = true;
  nextTick(() => statusNotesInputRef.value?.focus());
}

function closeStatusModal() {
  showStatusModal.value = false;
  statusModalPaper.value = null;
  modalNotes.value = "";
}

async function confirmStatusUpdate() {
  const paper = statusModalPaper.value;
  const action = statusModalAction.value;
  if (!paper) return;
  await updateStatus(paper, action, modalNotes.value);
}

async function updateStatus(paper, action, notesInput = "") {
  const id = paper.id;
  const notesRaw = String(notesInput ?? "").trim();
  const notes = notesRaw || null;

  updatingId.value = id;
  updatingAction.value = action;
  try {
    const { data } = await apiClient.patch(PAPER_STATUS(id), { action, notes });
    notyf.success(data?.message || `Paper ${action === "approve" ? "approved" : "rejected"}.`);
    closeStatusModal();
    await fetchPapers("silent");
  } catch (e) {
    handleError(e);
  } finally {
    updatingId.value = null;
    updatingAction.value = null;
  }
}

onMounted(() => {
  fetchPapers("initial");
});
</script>
