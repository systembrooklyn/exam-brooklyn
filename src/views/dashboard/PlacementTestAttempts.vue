<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 animate-fade-in">
    <div
      class="mx-auto w-full min-w-0 max-w-[1800px] px-2.5 sm:px-4 md:px-5 lg:px-6 xl:px-8"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
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
        class="mb-1.5 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/30 bg-white dark:bg-gray-800 px-2 py-2 space-y-2 shadow-sm"
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
            class="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2 xl:grid-cols-4 xl:gap-x-3 xl:gap-y-1.5 2xl:gap-x-4 items-end"
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
              <label :class="filterLabelClass">Student ID</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <IdCard class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input
                  v-model="stId"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="Optional"
                  :class="filterInputInnerClass"
                  @keydown.enter.prevent="fetchAttempts('apply')"
                />
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
        v-if="loading && !attempts.length"
        class="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-[#624ff6] border-t-transparent" />
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading attempts…</p>
      </div>

      <section
        v-else-if="attempts.length"
        class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#624ff6]/[0.06] to-transparent dark:from-[#624ff6]/10"
        >
          <p class="text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ apiMessage || "Results" }}
            <span class="text-gray-500 dark:text-gray-400 font-normal">
              — {{ attempts.length }} attempt(s)
            </span>
          </p>
        </div>

        <div
          v-if="contactPhones"
          class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-slate-50/90 dark:bg-slate-900/40"
        >
          <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone(s)</span>
          <span class="text-[11px] sm:text-xs font-mono text-gray-700 dark:text-gray-200 tracking-tight break-all">{{
            contactPhones
          }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  Test
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden md:table-cell">
                  Student
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap w-[1%]">Score</th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden lg:table-cell">
                  Duration
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden xl:table-cell">
                  Questions
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Started</th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Status</th>

                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden sm:table-cell">
                  Completed
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden lg:table-cell">
                  Started by
                </th>
                <th class="px-4 sm:px-5 py-4 text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap hidden xl:table-cell">
                  Branch
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in paginatedAttempts"
                :key="row._key"
                class="border-b border-gray-100 dark:border-gray-700/80 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-4 py-3 align-top">
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ row.testName }}</span>
                  <dl v-if="row.studentLine" class="mt-1 md:hidden text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <dt class="sr-only">Student</dt>
                    <dd>{{ row.studentLine }}</dd>
                  </dl>
                </td>
                <td class="px-4 py-3 align-top text-gray-700 dark:text-gray-300 hidden md:table-cell max-w-[220px]">
                  <div class="font-medium text-gray-900 dark:text-gray-100 truncate" :title="row.studentName">
                    {{ row.studentName }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate" :title="row.studentEmail">
                    {{ row.studentEmail }}
                  </div>
                </td>
                <td class="px-4 py-3 align-middle">
                  <span :class="scoreCellClass(row.scoreRaw)">{{ row.scoreDisplay }}</span>
                </td>
                
                <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-300 tabular-nums hidden lg:table-cell">
                  {{ row.durationDisplay }}
                </td>
                <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-300 tabular-nums hidden xl:table-cell">
                  {{ row.questionsDisplay }}
                </td>
                <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                  {{ row.startedDisplay }}
                </td>
                <td class="px-4 py-3 align-top">
                  <span :class="statusClass(row.status)">{{ formatStatus(row.status) }}</span>
                </td>
                <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap hidden sm:table-cell">
                  {{ row.completedDisplay }}
                </td>
                <td class="px-4 py-3 align-top text-gray-700 dark:text-gray-300 hidden lg:table-cell max-w-[140px] truncate" :title="row.staffName">
                  {{ row.staffName }}
                </td>
                <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-400 text-sm hidden xl:table-cell max-w-[120px] truncate" :title="row.branch">
                  {{ row.branch }}
                </td>
              </tr>
            </tbody>
          </table>
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
        v-else-if="!loading && !attempts.length"
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Calendar, IdCard, Loader2, RefreshCw, SlidersHorizontal } from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { PT_ATTEMPTS } from "@/api/Api";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import notyf from "@/components/global/notyf";

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
    "inline-flex min-w-[2.75rem] items-center justify-center rounded-xl font-extrabold tabular-nums leading-none shadow-sm ";
  if (score === null || score === undefined || score === "") {
    return (
      base +
      "px-3 py-2 text-sm bg-gray-100 text-gray-500 ring-1 ring-gray-200/80 dark:bg-gray-700/80 dark:text-gray-400 dark:ring-gray-600"
    );
  }
  return (
    base +
    "px-3.5 py-2.5 text-lg sm:text-xl text-white bg-gradient-to-br from-[#624ff6] via-[#5746e6] to-[#4338ca] ring-2 ring-[#624ff6]/35 shadow-md shadow-[#624ff6]/30"
  );
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

const fromApi = computed(() => toApiDate(fromIso.value));
const toApi = computed(() => toApiDate(toIso.value));

/** Start true: avoid empty-state flash before initial fetch with default dates. */
const loading = ref(true);
/** Drives spinners: apply | refresh */
const fetchSource = ref(null);
const errorText = ref("");
const rawPayload = ref(null);

function clearFilters() {
  fromIso.value = defaultFromIso();
  toIso.value = defaultToIso();
  stId.value = "";
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

const attempts = computed(() => {
  const p = rawPayload.value;
  let rows = [];
  if (Array.isArray(p)) rows = p;
  else if (p?.data != null && Array.isArray(p.data)) rows = p.data;

  const mapped = rows.map((r, idx) => {
    const st = r.student || {};
    const pt = r.ptest || {};
    const u = r.user || {};
    const started = r.started_at;
    return {
      _key: `${started ?? "row"}-${idx}`,
      testName: pt.name?.trim?.() || pt.name || "—",
      studentName: st.name || "—",
      studentEmail: st.email || "",
      studentLine: [st.name, st.email].filter(Boolean).join(" · ") || "—",
      scoreRaw: r.score,
      scoreDisplay: displayScore(r.score),
      status: r.status,
      durationDisplay: pt.duration != null && pt.duration !== "" ? `${pt.duration} min` : "—",
      questionsDisplay: pt.questions_count != null && pt.questions_count !== "" ? String(pt.questions_count) : "—",
      startedDisplay: displayDateTime(r.started_at),
      completedDisplay: displayDateTime(r.completed_at),
      staffName: u.name || "—",
      branch: u.branch || "—",
      _sort: started ? new Date(started.replace(" ", "T")).getTime() : 0,
    };
  });

  mapped.sort((a, b) => b._sort - a._sort);
  return mapped;
});

const currentPage = ref(1);
/** Same page size as Student requests. */
const pageSize = 10;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(attempts.value.length / pageSize)),
);

const paginatedAttempts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return attempts.value.slice(start, start + pageSize);
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
