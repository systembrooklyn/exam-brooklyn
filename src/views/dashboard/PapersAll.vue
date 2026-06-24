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
              — {{ papers.length }} paper(s) · {{ filteredStudentGroups.length }} student(s)
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
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end"
        >
          <div class="min-w-0 sm:col-span-2 lg:col-span-1">
            <label :class="filterLabelClass">Search by name</label>
            <div :class="filterShellClass">
              <span :class="filterIconSlotClass">
                <User class="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <input
                v-model="nameSearch"
                type="search"
                autocomplete="off"
                placeholder="Student name…"
                :class="filterInputInnerClass"
              />
            </div>
          </div>
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
                <option
                  v-for="opt in statusFilterOptions"
                  :key="opt.value || 'pending'"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
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
                <!-- <span
                  v-if="group.student?.st_num"
                  class="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full tabular-nums"
                >
                  St #{{ group.student.st_num }}
                </span> -->
                <span v-if="group.student?.grade"
                  class="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full tabular-nums">
                  {{ group.student.grade }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ group.papers.length }} paper(s)
                  <!-- <span v-if="group.pendingCount" class="text-amber-600 dark:text-amber-400 font-medium">
                    · {{ group.pendingCount }} pending
                  </span> -->
                </span>
              </div>
              <div
                v-if="group.student?.email || formatStudentPhones(group.student).length"
                class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400"
              >
                <div
                  v-if="group.student?.email"
                  class="flex items-center gap-1.5 group/copy cursor-pointer hover:text-[#624ff6] transition-colors min-w-0"
                  title="Click to copy email"
                  @click.stop="copyToClipboard(group.student.email, 'Email')"
                >
                  <Mail class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span class="break-all">{{ group.student.email }}</span>
                  <Copy
                    class="h-3 w-3 shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </div>
                <div v-if="group.student.st_num"
                  class="flex items-center gap-1.5 group/copy cursor-pointer hover:text-[#624ff6] transition-colors min-w-0"
                  title="Click to copy email" @click.stop="copyToClipboard(group.student.st_num, 'Student number')">
                  <IdCard class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span class="break-all">{{ group.student.st_num }}</span>
                  <Copy class="h-3 w-3 shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                    aria-hidden="true" />
                </div>
                <div
                  v-for="(ph, pi) in formatStudentPhones(group.student)"
                  :key="`${group.studentId}-phone-${pi}`"
                  class="flex items-center gap-1.5 group/copy cursor-pointer hover:text-[#624ff6] transition-colors tabular-nums"
                  title="Click to copy phone"
                  @click.stop="copyToClipboard(ph, 'Phone')"
                >
                  <Phone class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{{ ph }}</span>
                  <Copy
                    class="h-3 w-3 shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </div>
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
              class="px-3 sm:px-4 py-3 sm:py-3.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/25"
            >
              <div
                class="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
              >
                <div class="min-w-0 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ formatPaperType(paper.type) }}
                    </h3>
                    <span
                      class="text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0"
                      :class="statusBadgeClass(paper)"
                    >
                      {{ statusLabel(paper) }}
                    </span>
                  </div>

                  <div
                    class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400"
                  >
                    <span class="inline-flex items-center gap-1 tabular-nums">
                      <Calendar class="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                      Submitted {{ formatDate(paper.created_at) }}
                    </span>
                    <a
                      v-if="paper.link"
                      :href="paper.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 font-medium text-[#624ff6] hover:underline cursor-pointer"
                    >
                      <ExternalLink class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      View file
                    </a>
                  </div>

                  <div
                    v-if="paperStatusEntries(paper).length"
                    class="space-y-1 max-w-2xl"
                  >
                    <p
                      v-for="(entry, si) in paperStatusEntries(paper)"
                      :key="`${paper.id}-status-${si}`"
                      class="text-[11px] leading-snug text-gray-600 dark:text-gray-400 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/40 px-2.5 py-1.5"
                    >
                      <span class="font-medium capitalize text-gray-700 dark:text-gray-300">
                        {{ entry.action }}
                      </span>
                      <span v-if="entry.notes"> — {{ entry.notes }}</span>
                      <span v-if="entry.action_by?.name" class="text-gray-500 dark:text-gray-500">
                        · {{ entry.action_by.name }}
                      </span>
                      <span v-if="entry.created_at" class="text-gray-500 dark:text-gray-500">
                        · {{ formatDate(entry.created_at) }}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  v-if="canShowPaperActionButtons(paper)"
                  class="flex flex-wrap items-center gap-2 sm:justify-end sm:pl-3 sm:border-l sm:border-gray-100 dark:sm:border-gray-700"
                >
                  <button
                    v-if="canShowApproveButton(paper)"
                    type="button"
                    :class="paperApproveBtnClass"
                    :disabled="updatingId === paper.id"
                    @click="openStatusModal(paper, 'approve')"
                  >
                    <Check class="w-3.5 h-3.5 shrink-0" />
                    {{ approveLabelForPaper(paper) }}
                  </button>
                  <button
                    v-if="canShowRejectButton(paper)"
                    type="button"
                    :class="paperRejectBtnClass"
                    :disabled="updatingId === paper.id"
                    @click="openStatusModal(paper, 'reject')"
                  >
                    <X class="w-3.5 h-3.5 shrink-0" />
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
          {{ emptyStateMessage }}
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
          class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
        >
          <h2
            :id="statusModalTitleId"
            class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
          >
            {{ statusModalTitle }}
          </h2>
          <button
            type="button"
            aria-label="Close"
            class="h-8 w-8 grid place-items-center rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
              Notes
              <span
                v-if="statusModalAction === 'reject'"
                class="text-rose-600 dark:text-rose-400 font-normal"
              >
                (required)
              </span>
              <span v-else class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="paper-status-notes"
              ref="statusNotesInputRef"
              v-model="modalNotes"
              rows="4"
              :placeholder="
                statusModalAction === 'reject'
                  ? 'Add a reason for rejecting this paper…'
                  : 'Add a note for this review…'
              "
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
            :class="
              isApproveLikeAction(statusModalAction)
                ? `${paperModalConfirmBtnBase} bg-emerald-100 text-emerald-800 border-emerald-200/60 hover:bg-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/50 dark:hover:bg-emerald-900/60`
                : `${paperModalConfirmBtnBase} bg-rose-100 text-rose-800 border-rose-200/60 hover:bg-rose-200/80 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800/50 dark:hover:bg-rose-900/60`
            "
            :disabled="!!updatingId || !statusModalPaper || !canConfirmStatusUpdate"
            @click="confirmStatusUpdate"
          >
            <Loader2 v-if="updatingId" class="w-4 h-4 animate-spin" />
            <span>{{ statusModalConfirmLabel }}</span>
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
  Copy,
  ExternalLink,
  IdCard,
  ListFilter,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  SlidersHorizontal,
  User,
  X,
} from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { PAPERS_ALL, PAPER_STATUS } from "@/api/Api";
import formatDate from "@/components/global/FormDate";
import notyf from "@/components/global/notyf";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import { handleError } from "@/stores/handleError";
import { useAuthStore } from "@/stores/auth";

const PAPERS_PERMISSION = {
  ACTION: "students_papers_action",
  FINAL_ACTION: "students_papers_final_action",
};

const authStore = useAuthStore();

function defaultPapersStatusFilter() {
  return authStore.hasPermission(PAPERS_PERMISSION.FINAL_ACTION) ? "approved" : "";
}

const statusFilterOptions = computed(() => {
  const options = [
    { value: "", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "final_approve", label: "Final approve" },
  ];
  if (authStore.hasPermission(PAPERS_PERMISSION.FINAL_ACTION)) {
    return options.filter((o) => o.value !== "");
  }
  return options;
});

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

const paperActionBtnBase =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
const paperApproveBtnClass = `${paperActionBtnBase} bg-emerald-100 text-emerald-800 border-emerald-200/60 hover:bg-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/50 dark:hover:bg-emerald-900/60`;
const paperRejectBtnClass = `${paperActionBtnBase} bg-rose-100 text-rose-800 border-rose-200/60 hover:bg-rose-200/80 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800/50 dark:hover:bg-rose-900/60`;
const paperModalConfirmBtnBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

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
const filters = ref({
  from: "",
  to: "",
  status: defaultPapersStatusFilter(),
});
const filtersApplied = ref([]);
const filterType = ref("");
/** Client-side filter on loaded student groups (before pagination). */
const nameSearch = ref("");
const currentPage = ref(1);
const pageSize = 10;
const expandedStudents = ref(new Set());
const showStatusModal = ref(false);
const statusModalPaper = ref(null);
const statusModalAction = ref("approve");
/** UI only: final-approve flow still PATCHes action "approve". */
const statusModalIsFinalApprove = ref(false);
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
    if (paperNeedsUserAction(paper)) g.pendingCount += 1;
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
    if (paperNeedsUserAction(paper)) g.pendingCount += 1;
  }
  for (const g of map.values()) {
    g.papers.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }
  let groups = Array.from(map.values()).sort((a, b) => {
    const ta = a.papers[0]?.created_at || "";
    const tb = b.papers[0]?.created_at || "";
    return String(tb).localeCompare(String(ta));
  });
  const q = String(nameSearch.value ?? "").trim().toLowerCase();
  if (q) {
    groups = groups.filter((g) =>
      String(g.student?.name ?? "").toLowerCase().includes(q),
    );
  }
  return groups;
});

const emptyStateMessage = computed(() => {
  if (String(nameSearch.value ?? "").trim()) {
    return "No students match this name on the current loaded results. Clear the search or adjust filters.";
  }
  return "Adjust filters or refresh when students upload documents.";
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

watch([filterType, nameSearch], () => {
  currentPage.value = 1;
});

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = total;
});

function buildPapersQueryParams() {
  const params = {};
  const f = filters.value;
  if (f.from?.trim()) params.from = f.from.trim();
  if (f.to?.trim()) params.to = f.to.trim();
  if (f.status?.trim()) params.final_status = f.status.trim();
  return params;
}

function clearFilters() {
  filters.value = {
    from: "",
    to: "",
    status: defaultPapersStatusFilter(),
  };
  filterType.value = "";
  nameSearch.value = "";
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

function copyToClipboard(text, label) {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      notyf.success(`${label} copied to clipboard`);
    })
    .catch(() => {
      notyf.error(`Failed to copy ${label}`);
    });
}

function paperStatusEntries(paper) {
  const list = paper?.all_statuses;
  if (Array.isArray(list) && list.length) return list;
  if (paper?.current_status) return [paper.current_status];
  return [];
}

function paperStatusKey(paper) {
  const entries = paperStatusEntries(paper);
  const action =
    paper?.current_status?.action ?? entries[entries.length - 1]?.action;
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

function hasPaperActionPermission() {
  return authStore.hasPermission(PAPERS_PERMISSION.ACTION);
}

function hasPaperFinalActionPermission() {
  return authStore.hasPermission(PAPERS_PERMISSION.FINAL_ACTION);
}

function isApproveLikeAction(action) {
  return action === "approve";
}

/** First review: pending papers + students_papers_action. */
function canShowFirstApproveButton(paper) {
  const status = paperStatusKey(paper);
  return (status === "pending" || status === "rejected") && hasPaperActionPermission();
}

/** Final review: already approved + students_papers_final_action. */
function canShowFinalApproveButton(paper) {
  const status = paperStatusKey(paper);
  return (status === "approved" || status === "rejected") && hasPaperFinalActionPermission();
}

function canShowApproveButton(paper) {
  return canShowFirstApproveButton(paper) || canShowFinalApproveButton(paper);
}

/** Reject: pending + action, or approved awaiting final + final_action. */
function canShowRejectButton(paper) {
  const key = paperStatusKey(paper);
  if (key === "pending" && hasPaperActionPermission()) return true;
  if (key === "approved" && (hasPaperActionPermission() || hasPaperFinalActionPermission())) return true;
  return false;
}

function canShowPaperActionButtons(paper) {
  return canShowApproveButton(paper) || canShowRejectButton(paper);
}

function paperNeedsUserAction(paper) {
  return canShowPaperActionButtons(paper);
}

function approveLabelForPaper(paper) {
  return canShowFinalApproveButton(paper) ? "Final approve" : "Approve";
}

const statusModalTitle = computed(() => {
  if (statusModalAction.value === "reject") return "Reject paper";
  if (statusModalIsFinalApprove.value) return "Final approve paper";
  return "Approve paper";
});

const statusModalConfirmLabel = computed(() => {
  if (statusModalAction.value === "reject") return "Confirm reject";
  if (statusModalIsFinalApprove.value) return "Confirm final approve";
  return "Confirm approve";
});

const canConfirmStatusUpdate = computed(() => {
  if (statusModalAction.value !== "reject") return true;
  return String(modalNotes.value ?? "").trim().length > 0;
});

function canPerformPaperStatusAction(paper, action) {
  if (action === "reject") return canShowRejectButton(paper);
  if (action === "approve") return canShowApproveButton(paper);
  return false;
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
  const savedPage = currentPage.value;
  const savedExpanded = silent ? new Set(expandedStudents.value) : null;
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
    } else {
      expandedStudents.value = savedExpanded;
      currentPage.value = savedPage;
      await nextTick();
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
      }
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
  if (action !== "approve" && action !== "reject") return;
  if (!canPerformPaperStatusAction(paper, action)) return;
  statusModalPaper.value = paper;
  statusModalAction.value = action;
  statusModalIsFinalApprove.value =
    action === "approve" && canShowFinalApproveButton(paper);
  modalNotes.value = "";
  showStatusModal.value = true;
  nextTick(() => statusNotesInputRef.value?.focus());
}

function closeStatusModal() {
  showStatusModal.value = false;
  statusModalPaper.value = null;
  statusModalIsFinalApprove.value = false;
  modalNotes.value = "";
}

async function confirmStatusUpdate() {
  const paper = statusModalPaper.value;
  const action = statusModalAction.value;
  if (!paper) return;
  const notesRaw = String(modalNotes.value ?? "").trim();
  if (action === "reject" && !notesRaw) {
    notyf.error("A note is required when rejecting a paper.");
    return;
  }
  await updateStatus(paper, action, notesRaw);
}

async function updateStatus(paper, action, notesInput = "") {
  const id = paper.id;
  const notesRaw = String(notesInput ?? "").trim();
  if (action === "reject" && !notesRaw) {
    notyf.error("A note is required when rejecting a paper.");
    return;
  }
  const notes = notesRaw || null;

  updatingId.value = id;
  updatingAction.value = action;
  try {
    const { data } = await apiClient.patch(PAPER_STATUS(id), { action, notes });
    const fallback =
      action === "approve"
        ? statusModalIsFinalApprove.value
          ? "Paper final approved."
          : "Paper approved."
        : "Paper rejected.";
    notyf.success(data?.message || fallback);
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
  if (authStore.hasPermission(PAPERS_PERMISSION.FINAL_ACTION)) {
    filters.value.status = "approved";
  }
  fetchPapers("initial");
});
</script>
