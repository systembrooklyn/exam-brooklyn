<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 animate-fade-in">
    <div
      class="mx-auto w-full min-w-0 max-w-[1800px] px-2.5 sm:px-4 md:px-5 lg:px-6 xl:px-8"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 max-w-[90%] mx-auto">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Placement test attempts
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Look up placement attempts by date range and student ID; results show test, score, status, and who started
            the attempt.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#624ff6] text-white text-xs sm:text-sm font-medium shadow hover:opacity-95 disabled:opacity-50"
          :disabled="loading"
          @click="fetchAttempts('refresh')"
        >
          <Loader2 v-if="loading && fetchSource === 'refresh'" class="w-4 h-4 animate-spin" />
          <RefreshCw v-else class="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div
        class="mb-1.5 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/30 bg-white dark:bg-gray-800 px-2 py-2 space-y-2 shadow-sm max-w-[40%] mx-auto"
      >
        <p
          class="flex items-center gap-1 text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          <SlidersHorizontal class="h-3 w-3 text-[#624ff6]" aria-hidden="true" />
          Filters
        </p>
        <div
          class="min-w-0 overflow-x-auto pb-0.5 [scrollbar-width:thin] xl:overflow-x-visible [-webkit-overflow-scrolling:touch]"
        >
          <div
            class="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2 xl:grid-cols-3 xl:gap-x-3 xl:gap-y-1.5 2xl:gap-x-4 items-end"
          >
            <div class="min-w-0">
              <label :class="filterLabelClass">From date</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input v-model="fromIso" type="date" :title="fromApi || undefined" :class="filterInputInnerClass" />
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">To date</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input v-model="toIso" type="date" :title="toApi || undefined" :class="filterInputInnerClass" />
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">Status</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Activity class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <select v-model="stStatus" :class="filterInputInnerClass">
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end pt-0.5">
          <div class="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-md bg-[#624ff6] px-3 text-xs sm:text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
              :disabled="loading"
              @click="fetchAttempts('apply')"
            >
              <Loader2 v-if="loading && fetchSource === 'apply'" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Apply filters
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              :disabled="loading"
              @click="clearFilters"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="loading && !studentGroups.length"
        class="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-[#624ff6] border-t-transparent" />
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading attempts…</p>
      </div>

      <section
        v-else-if="studentGroups.length"
        class="space-y-4 max-w-[90%] mx-auto"
      >
        <div
          v-for="group in paginatedGroups"
          :key="group.student.id"
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
          <!-- Accordion Header -->
          <button
            class="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            @click="toggleStudent(group.student.id)"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="h-10 w-10 rounded-full bg-[#624ff6]/10 flex items-center justify-center text-[#624ff6] shrink-0">
                <User class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    {{ group.student.name || 'Unknown Student' }}
                  </h3>
                </div>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div
                    v-if="group.student.phonesString"
                    class="flex items-center gap-1.5 group/copy cursor-pointer hover:text-[#624ff6] transition-colors"
                    title="Click to copy phone"
                    @click.stop="copyToClipboard(group.student.phonesString, 'Phone')"
                  >
                    <Phone class="h-3.5 w-3.5" />
                    <span>{{ group.student.phonesString }}</span>
                    <Copy class="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                  </div>
                  <div
                    v-if="group.student.email"
                    class="flex items-center gap-1.5 group/copy cursor-pointer hover:text-[#624ff6] transition-colors"
                    title="Click to copy email"
                    @click.stop="copyToClipboard(group.student.email, 'Email')"
                  >
                    <Mail class="h-3.5 w-3.5" />
                    <span class="truncate max-w-[150px] sm:max-w-none">{{ group.student.email }}</span>
                    <Copy class="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                  </div>
                  <span class="bg-[#624ff6]/10 text-[#624ff6] px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    {{ group.attempts.length }} attempt(s)
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <button type="button" @click.stop="openFinalAcceptanceModal(group.student.id, 1)" v-if="authStore.can('action-final-acceptance')"
                class="inline-flex cursor-pointer items-center justify-center gap-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 text-green-800 dark:text-green-200 font-medium text-xs px-2 py-1 rounded-md transition">
                Force Pass
                <CheckCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
              <button type="button" @click.stop="openFinalAcceptanceModal(group.student.id, 0)" v-if="authStore.can('action-final-acceptance')"
                class="inline-flex cursor-pointer items-center justify-center gap-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-800 dark:text-red-200 font-medium text-xs px-2 py-1 rounded-md transition">
                Force Fail
                <XCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
              <span :class="statusClass(group.overallStatus)" class="text-[10px] sm:text-xs">
                {{ formatStatus(group.overallStatus) }}
              </span>
              <ChevronDown
                class="h-5 w-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': expandedStudents.includes(group.student.id) }"
              />
            </div>
          </button>

          <!-- Accordion Body -->
          <div
            v-if="expandedStudents.includes(group.student.id)"
            class="border-t border-gray-100 dark:border-gray-700 overflow-x-auto"
          >
            <table class="min-w-full text-left text-sm">
              <thead>
                <tr class="bg-gray-50/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Test</th>
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Score / Total</th>
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Duration</th>
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Dates</th>
                  <th class="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden xl:table-cell">Branch</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="row in group.attempts"
                  :key="row._key"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <td class="px-5 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">{{ row.testName }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-base tabular-nums text-gray-900 dark:text-white">
                          {{ row.scoreDisplay }} / {{ row.questionsCount }}
                        </span>
                        <span v-if="row.passFail" :class="passFailClass(row.passFail)">
                          {{ row.passFail }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                    {{ row.durationDisplay }}
                  </td>
                  <td class="px-5 py-4">
                    <span :class="statusClass(row.status)">{{ formatStatus(row.status) }}</span>
                  </td>
                  <td class="px-5 py-4 hidden sm:table-cell text-xs text-gray-500 dark:text-gray-400">
                    <div>Started: {{ row.startedDisplay }}</div>
                    <div v-if="row.status === 'completed'">Finished: {{ row.completedDisplay }}</div>
                  </td>
                  <td class="px-5 py-4 hidden xl:table-cell text-gray-600 dark:text-gray-400 max-w-[120px] truncate" :title="row.branch">
                    {{ row.branch }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-numbers="pageNumbers"
          @update:current-page="(p) => (currentPage = p)"
        />
      </section>

      <div
        v-else-if="!loading && !studentGroups.length"
        class="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-12 sm:py-16 text-center"
      >
        <div class="relative mx-auto mb-6 max-w-md">
          <div
            class="pointer-events-none absolute inset-0 rounded-full bg-[#624ff6]/10 blur-3xl scale-125 dark:bg-[#624ff6]/15"
            aria-hidden="true"
          />
          <img
            src="@/assets/undraw_empty_4zx0.png"
            alt=""
            class="relative mx-auto w-56 sm:w-72 md:w-80 max-w-full object-contain drop-shadow-sm dark:opacity-95"
          />
        </div>

        <div
          v-if="errorText"
          class="mt-2 max-w-lg mx-auto rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/35 px-4 py-3 text-left sm:text-center"
          role="alert"
        >
          <p class="text-sm sm:text-base font-semibold text-red-800 dark:text-red-200 leading-relaxed whitespace-pre-wrap break-words">
            {{ errorText }}
          </p>
        </div>

        <template v-else>
          <h2 class="text-xl sm:text-xl font-bold text-gray-900 dark:text-white">
            {{ emptyStateTitle }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
            {{ emptyStateSubtitle }}
          </p>
        </template>
      </div>

      <!-- Final Acceptance Modal -->
      <div v-if="showFinalAcceptanceModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity" @click="showFinalAcceptanceModal = false">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-5 animate-in zoom-in-95 duration-200" @click.stop>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span v-if="finalAcceptanceType === 1" class="text-green-600"><CheckCircle class="w-5 h-5"/></span>
            <span v-else class="text-red-600"><XCircle class="w-5 h-5"/></span>
            {{ finalAcceptanceType === 1 ? 'Force Pass' : 'Force Fail' }}
          </h3>
          <textarea
            v-model="finalAcceptanceNotes"
            rows="3"
            class="w-full p-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none resize-none"
            placeholder="Type your notes here..."
          ></textarea>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              @click="showFinalAcceptanceModal = false" :disabled="loadingFinalAcceptance">
              Cancel
            </button>
            <button type="button"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none"
              :class="finalAcceptanceType === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
              @click="submitFinalAcceptance" :disabled="loadingFinalAcceptance">
              <Loader2 v-if="loadingFinalAcceptance" class="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Calendar, IdCard, Loader2, RefreshCw, SlidersHorizontal, ChevronDown, User, Mail, Copy, Phone, Activity, CheckCircle, XCircle } from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { PT_ATTEMPTS, FINAL_ACCEPTANCE } from "@/api/Api";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import notyf from "@/components/global/notyf";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const filterLabelClass =
  "block text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-0.5";
const filterShellClass =
  "flex min-h-[2.25rem] rounded-md border border-[#624ff6]/25 dark:border-[#624ff6]/35 bg-white dark:bg-gray-900 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-[#624ff6]/25 focus-within:border-[#624ff6]/45";
const filterIconSlotClass =
  "flex w-8 shrink-0 items-center justify-center self-stretch border-r border-[#624ff6]/15 dark:border-[#624ff6]/25 bg-[#624ff6]/[0.07] dark:bg-[#624ff6]/12 text-[#624ff6]";
const filterInputInnerClass =
  "min-h-[2.25rem] min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none";

/** YYYY-MM-DD in local calendar */
function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** First day of current month, local */
function firstOfMonthIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function defaultFromIso() {
  return firstOfMonthIsoLocal();
}

function defaultToIso() {
  return todayIsoLocal();
}

function toApiDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function formatStatus(s) {
  if (!s) return "—";
  return String(s).replace(/_/g, " ");
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize";
  if (s === "completed") return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200`;
  if (s === "in_progress") return `${base} bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-100`;
  return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200`;
}

function displayScore(score) {
  if (score === null || score === undefined || score === "") return "—";
  return String(score);
}

/** Distinct score pill: strong purple gradient when numeric, muted pill for empty. */
function scoreCellClass(score) {
  const base =
    "inline-flex min-w-[2.75rem] items-center justify-center rounded-lg font-bold tabular-nums leading-none ";
  if (score === null || score === undefined || score === "") {
    return (
      base +
      "px-2 py-1 text-xs bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
    );
  }
  return base + "px-2.5 py-1.5 text-sm bg-[#624ff6]/10 text-[#624ff6]";
}

function passFailClass(status) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider";
  if (status === "Pass") return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50`;
  return `${base} bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50`;
}

function displayDateTime(v) {
  if (v == null || v === "") return "—";
  return String(v).replace("T", " ");
}

function phonesList(phones) {
  if (!phones) return "";
  if (Array.isArray(phones)) return phones.filter(Boolean).join(", ");
  return String(phones);
}

const fromIso = ref(defaultFromIso());
const toIso = ref(defaultToIso());
const stId = ref("");
const stStatus = ref("");

function copyToClipboard(text, label) {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => {
      notyf.success(`${label} copied to clipboard`);
    })
    .catch(() => {
      notyf.error(`Failed to copy ${label}`);
    });
}

const fromApi = computed(() => toApiDate(fromIso.value));
const toApi = computed(() => toApiDate(toIso.value));

/** Start true: avoid empty-state flash before initial fetch with default dates. */
const loading = ref(true);
/** Drives spinners: apply | refresh */
const fetchSource = ref(null);
const errorText = ref("");
const rawPayload = ref(null);

function clearFilters() {
  fromIso.value = "";
  toIso.value = "";
  stId.value = "";
  stStatus.value = "";
  errorText.value = "";
  rawPayload.value = null;
}

const apiMessage = computed(() => {
  const m = rawPayload.value?.message;
  return typeof m === "string" ? m : "";
});

const emptyStateTitle = computed(() =>
  rawPayload.value == null ? "No data yet" : "No attempts found",
);

const emptyStateSubtitle = computed(() =>
  rawPayload.value == null
    ? "From defaults to the first day of this month through today; results load automatically. Student ID is optional."
    : "No placement attempts for these filters. Try different dates or add a student ID.",
);

/** Phones once, outside the table (same student for all rows). */
const contactPhones = computed(() => {
  const p = rawPayload.value;
  let rows = [];
  if (Array.isArray(p)) rows = p;
  else if (p?.data != null && Array.isArray(p.data)) rows = p.data;
  const st = rows[0]?.student;
  return phonesList(st?.phones);
});

const expandedStudents = ref([]);

const showFinalAcceptanceModal = ref(false);
const finalAcceptanceStudentId = ref(null);
const finalAcceptanceType = ref(0);
const finalAcceptanceNotes = ref("");
const loadingFinalAcceptance = ref(false);

function openFinalAcceptanceModal(studentId, type) {
  finalAcceptanceStudentId.value = studentId;
  finalAcceptanceType.value = type;
  finalAcceptanceNotes.value = "";
  showFinalAcceptanceModal.value = true;
}

async function submitFinalAcceptance() {
  if (!finalAcceptanceStudentId.value) {
    notyf.error("Student ID is missing.");
    return;
  }
  loadingFinalAcceptance.value = true;
  try {
    const payload = {
      student_id: finalAcceptanceStudentId.value,
      is_accepted: finalAcceptanceType.value,
      notes: finalAcceptanceNotes.value
    };
    await apiClient.post(FINAL_ACCEPTANCE, payload);
    notyf.success(finalAcceptanceType.value === 1 ? "Force passed successfully" : "Force failed successfully");
    showFinalAcceptanceModal.value = false;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Action failed";
    notyf.error(msg);
  } finally {
    loadingFinalAcceptance.value = false;
  }
}

function toggleStudent(id) {
  const idx = expandedStudents.value.indexOf(id);
  if (idx > -1) expandedStudents.value.splice(idx, 1);
  else expandedStudents.value.push(id);
}

const studentGroups = computed(() => {
  const p = rawPayload.value;
  let rows = [];
  if (Array.isArray(p)) rows = p;
  else if (p?.data != null && Array.isArray(p.data)) rows = p.data;

  const groups = {};
  rows.forEach((r) => {
    const st = r.student || {};
    const stId = st.id || "unknown";
    if (!groups[stId]) {
      groups[stId] = {
        student: {
          id: stId,
          name: st.name || "Unknown Student",
          email: st.email || "",
          phonesString: Array.isArray(st.phones) ? st.phones.filter(Boolean).map(String).join(" - ") : (st.phones ? String(st.phones) : "")
        },
        attempts: []
      };
    }

    const pt = r.ptest || {};
    const u = r.user || {};
    const started = r.started_at;
    const score = r.score;
    const questionsCount = Number(pt.questions_count) || 0;
    const status = r.status || "";

    let passFail = null;
    if (status === "completed") {
      const numericScore = score === null || score === undefined ? 0 : Number(score);
      // Logic: score >= questions_count / 2 -> Pass, else Fail
      passFail = numericScore >= questionsCount / 2 ? "Pass" : "Fail";
    }

    groups[stId].attempts.push({
      _key: `${started ?? "row"}-${Math.random()}`,
      testName: pt.name?.trim?.() || pt.name || "—",
      scoreRaw: score,
      scoreDisplay: displayScore(score),
      questionsCount: questionsCount || 0,
      durationDisplay: pt.duration != null && pt.duration !== "" ? `${pt.duration} min` : "—",
      status: status,
      startedDisplay: displayDateTime(r.started_at),
      completedDisplay: displayDateTime(r.completed_at),
      staffName: u.name || "—",
      branch: u.branch || "—",
      passFail: passFail,
      _sort: started ? new Date(started.replace(" ", "T")).getTime() : 0,
    });
  });

  const result = Object.values(groups).map((g) => {
    g.attempts.sort((a, b) => b._sort - a._sort);
    
    // Overall Status Logic
    const anyInProgress = g.attempts.some(a => a.status === 'in_progress');
    const allCompleted = g.attempts.every(a => a.status === 'completed');
    
    if (anyInProgress) g.overallStatus = 'in_progress';
    else if (allCompleted && g.attempts.length > 0) g.overallStatus = 'completed';
    else g.overallStatus = 'other';
    
    return g;
  });

  // Sort groups by latest attempt
  result.sort((a, b) => {
    const latestA = a.attempts[0]?._sort || 0;
    const latestB = b.attempts[0]?._sort || 0;
    return latestB - latestA;
  });

  // Frontend Filter by Status
  if (!stStatus.value) return result;
  return result.filter(g => g.overallStatus === stStatus.value);
});

const currentPage = ref(1);
/** Same page size as Student requests. */
const pageSize = 10;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(studentGroups.value.length / pageSize)),
);

const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return studentGroups.value.slice(start, start + pageSize);
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
  () => rawPayload.value,
  () => {
    currentPage.value = 1;
  },
);

/**
 * @param {"apply" | "refresh" | "initial"} source — `initial`: page load (no button spinners).
 */
async function fetchAttempts(source = "apply") {
  errorText.value = "";
  fetchSource.value = source;
  const sidRaw = String(stId.value ?? "").trim();
  const sid = sidRaw === "" ? NaN : Number(sidRaw);
  if (sidRaw !== "" && (!Number.isFinite(sid) || sid < 1)) {
    errorText.value = "If you enter a student ID, it must be a valid positive number.";
    fetchSource.value = null;
    notyf.error(errorText.value);
    return;
  }
  const from = fromApi.value;
  const to = toApi.value;

  /** Dates & st_id optional; omit empty keys (backend may reject null). */
  const payload = {};
  if (from) payload.from = from;
  if (to) payload.to = to;
  if (sidRaw !== "" && Number.isFinite(sid) && sid >= 1) {
    payload.st_id = sid;
  }

  loading.value = true;
  try {
    const { data } = await apiClient.post(PT_ATTEMPTS, payload);
    rawPayload.value = data;
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Request failed";
    errorText.value = msg;
    rawPayload.value = e?.response?.data ?? { error: msg };
    notyf.error(msg);
  } finally {
    loading.value = false;
    fetchSource.value = null;
  }
}

onMounted(() => {
  fetchAttempts("initial");
});
</script>

<style scoped>
.animate-fade-in {
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
