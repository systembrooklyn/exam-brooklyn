<template>
  <div
    class="w-full overflow-x-auto bg-white shadow-md dark:bg-gray-800"
    :class="
      roundedTop
        ? 'rounded-t-xl rounded-b-lg border border-[#624ff6]/20 dark:border-[#624ff6]/35 overflow-hidden'
        : 'rounded-lg'
    "
  >
    <div>
      <div class="flex flex-col pt-1 m-h-screen">
        <div
          v-if="showSearch"
          class="bg-white items-center justify-between w-full flex rounded-full shadow-lg sticky"
          :class="compact ? 'p-1.5 mb-3' : 'p-2 mb-5'"
          style="top: 5px"
        >
          <div>
            <div class="p-2 mr-1 rounded-full hover:bg-gray-100 cursor-pointer">
              <svg
                class="h-6 w-6 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <!-- Search Input with Blur Effect -->
          <input
            class="font-bold uppercase rounded-full w-full pl-4 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline text-xs"
            :class="[
              compact ? 'py-2 lg:text-xs' : 'py-4 lg:text-sm',
              {
                'blur-effect':
                  filteredItems?.length === 0 && search.length > 0,
              },
            ]"
            type="text"
            v-model="search"
            placeholder="Search by name..."
          />
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div
      v-if="!filteredItems.length && loading"
      :class="compact ? 'flex justify-center items-center py-10' : 'flex justify-center items-center py-20'"
    >
      <div
        class="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10"
      ></div>
    </div>

    <div v-else>
      <!-- Table -->
      <table
        class="min-w-[600px] w-full divide-y text-center divide-gray-200"
        :class="compact ? 'text-sm' : ''"
      >
        <thead class="bg-gradient-to-r bg-primary text-white">
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              class="text-center font-semibold tracking-wide"
              :class="
                compact
                  ? 'px-3.5 py-3 text-sm sm:text-[0.9375rem]'
                  : 'px-6 py-4 text-base'
              "
            >
              {{ header.label }}
            </th>
            <th
              v-if="showEmployeeReply"
              class="text-center font-semibold tracking-wide"
              :class="
                compact
                  ? 'px-3.5 py-3 text-sm sm:text-[0.9375rem]'
                  : 'px-6 py-4 text-base'
              "
            >
              Reply
            </th>
            <th
              v-if="!hideActions"
              class="text-center font-semibold tracking-wide"
              :class="
                compact
                  ? 'px-3.5 py-3 text-sm sm:text-[0.9375rem]'
                  : 'px-6 py-4 text-base'
              "
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Render data rows -->
          <tr
            v-for="item in paginatedItems"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="header in headers"
              :key="header.key"
              class="break-words align-middle"
              :class="[
                compact ? 'px-3 py-2' : 'px-6 py-4',
                collapsibleTextKeys.includes(header.key)
                  ? 'whitespace-normal text-start max-w-[12rem] sm:max-w-[14rem]'
                  : header.key === 'field'
                    ? 'whitespace-normal max-w-[11rem] sm:max-w-[13rem]'
                    : header.key === 'student_st_num_and_id'
                      ? 'whitespace-normal text-start align-middle'
                    : attributedReplyKeys.includes(header.key)
                      ? 'whitespace-normal text-start align-top max-w-[min(92vw,26rem)] sm:max-w-lg lg:max-w-2xl'
                  : 'whitespace-nowrap',
              ]"
            >
              <!-- Special handling for Courses column -->
              <div v-if="header.key === 'courses'">
                <span>
                  {{
                    item.courses
                      .slice(0, expandedRows[item.id] || COURSES_INCREMENT)
                      .map((c) => c.name)
                      .join(", ")
                  }}
                </span>
                <span v-if="item.courses.length > COURSES_INCREMENT">
                  <button
                    class="ml-2 text-indigo-600 underline text-xs"
                    @click="toggleExpand(item.id, item.courses.length)"
                  >
                    {{
                      (expandedRows[item.id] || COURSES_INCREMENT) <
                      item.courses.length
                        ? "More"
                        : "Less"
                    }}
                  </button>
                </span>
              </div>

              <div
                v-else-if="header.key === 'student_st_num_and_id'"
                class="text-start font-medium text-gray-900 dark:text-gray-100 tabular-nums"
              >
                <span class="text-xs sm:text-sm">{{
                  formatStudentNumAndId(item)
                }}</span>
              </div>

              <span
                v-else-if="badgeKeys.includes(header.key)"
                :class="badgeSpanClass(header.key, item)"
              >
                {{ badgeDisplayText(item, header.key) }}
              </span>

              <div v-else-if="collapsibleTextKeys.includes(header.key)">
                <span class="whitespace-pre-wrap break-words leading-snug">{{
                  displayCollapsibleText(item, header.key)
                }}</span>
                <button
                  v-if="collapsibleNeedsToggle(item, header.key)"
                  type="button"
                  class="mt-0.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs font-medium underline-offset-2 hover:underline block w-full text-start"
                  @click="toggleTextMore(item.id, header.key)"
                >
                  {{
                    isTextMoreExpanded(item.id, header.key)
                      ? "See less"
                      : "See more"
                  }}
                </button>
              </div>

              <div
                v-else-if="attributedReplyKeys.includes(header.key)"
                class="min-w-0 w-full text-start"
              >
                <template
                  v-if="!String(rawCellValue(item, header.key) ?? '').trim()"
                >
                  <span class="text-gray-400 dark:text-gray-500">—</span>
                </template>
                <template
                  v-else-if="
                    parseAttributedReply(rawCellValue(item, header.key))
                      .hasAttribution
                  "
                >
                  <div
                    :class="[
                      'rounded-lg border p-2.5 sm:p-3 shadow-sm',
                      header.key === 'employee_response'
                        ? 'bg-blue-50/95 dark:bg-blue-950/35 border-blue-200/90 dark:border-blue-800/55'
                        : 'bg-indigo-50/95 dark:bg-indigo-950/35 border-indigo-200/90 dark:border-indigo-800/55',
                    ]"
                  >
                    <div
                      class="flex flex-wrap items-center gap-x-2 gap-y-1 pb-2 mb-2 border-b border-gray-900/10 dark:border-white/10"
                    >
                      <span
                        class="text-[9px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Responded by
                      </span>
                      <span
                        class="text-[11px] sm:text-xs font-semibold text-gray-800 dark:text-gray-100 break-all sm:break-words"
                        :title="
                          parseAttributedReply(rawCellValue(item, header.key))
                            .actor
                        "
                      >
                        {{
                          parseAttributedReply(rawCellValue(item, header.key))
                            .actor
                        }}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <p
                        class="whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-gray-100 leading-relaxed"
                      >
                        {{ displayAttributedReplyBody(item, header.key) }}
                      </p>
                      <button
                        v-if="attributedReplyBodyNeedsToggle(item, header.key)"
                        type="button"
                        class="mt-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs font-medium underline-offset-2 hover:underline text-start"
                        @click="toggleTextMore(item.id, header.key)"
                      >
                        {{
                          isTextMoreExpanded(item.id, header.key)
                            ? "See less"
                            : "See more"
                        }}
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    :class="[
                      'rounded-lg border p-2.5 sm:p-3 shadow-sm',
                      header.key === 'employee_response'
                        ? 'bg-blue-50/95 dark:bg-blue-950/35 border-blue-200/90 dark:border-blue-800/55'
                        : 'bg-indigo-50/95 dark:bg-indigo-950/35 border-indigo-200/90 dark:border-indigo-800/55',
                    ]"
                  >
                    <p
                      class="whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-gray-100 leading-relaxed"
                    >
                      {{ displayAttributedReplyBody(item, header.key) }}
                    </p>
                    <button
                      v-if="attributedReplyBodyNeedsToggle(item, header.key)"
                      type="button"
                      class="mt-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs font-medium underline-offset-2 hover:underline text-start"
                      @click="toggleTextMore(item.id, header.key)"
                    >
                      {{
                        isTextMoreExpanded(item.id, header.key)
                          ? "See less"
                          : "See more"
                      }}
                    </button>
                  </div>
                </template>
              </div>

              <!-- Default rendering for other columns -->
              <span
                v-else-if="
                  linkNameToDetails &&
                  (header.key === 'name' || header.key === 'student.name')
                "
                @click="showDetails(item)"
                class="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {{ getValueByPath(item, header.key) }}
              </span>
              <span v-else>
                {{ getValueByPath(item, header.key) }}
              </span>
            </td>

            <td
              v-if="showEmployeeReply"
              class="whitespace-nowrap align-middle"
              :class="compact ? 'px-3 py-2' : 'px-6 py-4'"
            >
              <button
                v-if="canShowEmployeeReplyButton(item)"
                type="button"
                class="inline-flex items-center justify-center gap-1 cursor-pointer bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/55 text-blue-800 dark:text-blue-200 font-semibold text-xs px-3 py-1 rounded-lg shadow-sm transition"
                style="direction: auto; unicode-bidi: plaintext"
                @click="emit('employee-reply', item)"
              >
                Reply
                <MessageCircleReply class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
              <span v-else class="text-gray-400 dark:text-gray-500">—</span>
            </td>

            <td
              v-if="!hideActions"
              class="whitespace-nowrap space-x-6"
              :class="compact ? 'px-3 py-2' : 'px-6 py-4'"
            >
              <button
                v-if="canEdit"
                type="button"
                :disabled="isEditLoadingForRow(item)"
                @click="emit('edit', item)"
                class="text-indigo-600 hover:text-indigo-800 transition inline-flex items-center justify-center min-w-[1.25rem] min-h-[1.25rem] cursor-pointer disabled:opacity-60 disabled:cursor-pointer"
              >
                <span
                  v-if="isEditLoadingForRow(item)"
                  class="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"
                  aria-hidden="true"
                />
                <Edit v-else class="w-4 h-4 shrink-0" />
              </button>
              <button
                v-show="!isReservation || canDelete"
                @click="emit('delete', item.id)"
                class="text-red-600 cursor-pointer hover:text-red-800 transition inline-flex items-center gap-1"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>

          <!-- No results found for the search -->
          <tr v-if="filteredItems.length === 0 && search.length > 0">
            <td
              :colspan="headers.length + tailColumnCount"
              class="text-start font-bold text-gray-700"
              :class="compact ? 'px-3 py-2 text-sm' : 'px-6 py-4'"
            >
              No results found for "{{ search }}".
            </td>
          </tr>
          <tr v-if="filteredItems.length === 0 && !loading">
            <td
              :colspan="headers.length + tailColumnCount"
              class="text-center font-bold text-gray-600"
              :class="compact ? 'px-3 py-2 text-sm' : 'px-6 py-4'"
            >
              No data found.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        class="flex justify-center gap-3 mt-4 p-4"
        v-if="filteredItems.length > 0"
      >
        <button
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
        >
          Previous
        </button>
        <div class="flex items-center">
          <span class="text-sm text-gray-500">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
        </div>
        <button
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <DetailsPopup
      v-if="selectedExam"
      :selectedExam="selectedExam"
      :isCourse="isCourse"
      :isExam="isExam"
      :isReservation="isReservation"
      :isInstructors="isInstructors"
      :isEmployee="isEmployee"
      @close="selectedExam = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Edit, MessageCircleReply, Trash2 } from "lucide-vue-next";
import DetailsPopup from "../global/DetailsPopup.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const expandedRows = ref({});
/** `${rowId}::${columnKey}` → expanded */
const expandedTextCells = ref({});

const COURSES_INCREMENT = 3;

const props = defineProps({
  headers: Array,
  items: Array,
  loading: Boolean,
  isExam: Boolean,
  isInstructors: Boolean,
  isEmployee: Boolean,
  isCourse: Boolean,
  resourceType: String,
  isReservation: Boolean,
  isPlacementTests: Boolean,
  hideActions: Boolean,
  /** When set to an item id, that row's edit button shows an inline spinner */
  loadingEditId: {
    type: [Number, String],
    default: null,
  },
  /** When false, name / student.name cells are plain text (no details popup). */
  linkNameToDetails: {
    type: Boolean,
    default: true,
  },
  /** Column keys (e.g. status, type) rendered as pill badges. */
  badgeKeys: {
    type: Array,
    default: () => [],
  },
  /** Tighter table/search/pagination spacing. */
  compact: {
    type: Boolean,
    default: false,
  },
  /** Long text columns: truncate with See more / See less. */
  collapsibleTextKeys: {
    type: Array,
    default: () => [],
  },
  collapsibleTextMaxChars: {
    type: Number,
    default: 80,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  /** Rounded top corners + light accent border (e.g. below filter strip). */
  roundedTop: {
    type: Boolean,
    default: false,
  },
  /** Extra column with SRM-style employee reply button (no response yet). */
  showEmployeeReply: {
    type: Boolean,
    default: false,
  },
  /**
   * Values like "responded by : name / message" — shows small attribution on the side
   * (top on mobile) and the message body with optional See more for long text.
   */
  attributedReplyKeys: {
    type: Array,
    default: () => [],
  },
  attributedReplyMaxChars: {
    type: Number,
    default: 280,
  },
});

const emit = defineEmits([
  "edit",
  "delete",
  "open-scholarship-detail",
  "employee-reply",
]);

const tailColumnCount = computed(() => {
  let n = props.hideActions ? 0 : 1;
  if (props.showEmployeeReply) n += 1;
  return n;
});

function canShowEmployeeReplyButton(item) {
  const v = item?.employee_response;
  if (v === null || v === undefined) return true;
  return String(v).trim() === "";
}

/**
 * API pattern: "responded by : actor / body" — slash optional spacing;
 * actor is non-greedy up to first "/".
 */
const ATTRIBUTED_REPLY_RE =
  /^responded\s+by\s*:\s*(.+?)\s*\/\s*([\s\S]*)$/i;

function parseAttributedReply(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return { hasAttribution: false, actor: "", body: "" };
  const m = s.match(ATTRIBUTED_REPLY_RE);
  if (m) {
    return {
      hasAttribution: true,
      actor: m[1].trim(),
      body: m[2].trim(),
    };
  }
  return { hasAttribution: false, actor: "", body: s };
}

function formatStudentNumAndId(item) {
  const stRaw = item?.student?.st_num;
  const idRaw = item?.id;
  const st =
    stRaw != null && String(stRaw).trim() !== ""
      ? String(stRaw).trim()
      : "";
  const id =
    idRaw != null && String(idRaw).trim() !== ""
      ? String(idRaw).trim()
      : "";
  if (!st && !id) return "—";
  if (st && id) return `${st} · ${id}`;
  if (st) return st;
  return id;
}

function attributedReplyBodyNeedsToggle(item, key) {
  if (!props.attributedReplyKeys?.includes(key)) return false;
  const { body } = parseAttributedReply(rawCellValue(item, key));
  return body.length > props.attributedReplyMaxChars;
}

function displayAttributedReplyBody(item, key) {
  const p = parseAttributedReply(rawCellValue(item, key));
  const body = p.body;
  if (!body) return "—";
  if (
    isTextMoreExpanded(item.id, key) ||
    body.length <= props.attributedReplyMaxChars
  ) {
    return body;
  }
  return `${body.slice(0, props.attributedReplyMaxChars)}…`;
}

const search = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const selectedExam = ref(null);

// Function to check if the user has the required permission

const canEdit = computed(() =>
  authStore.hasPermission(`edit-${props.resourceType}`)
);
const canDelete = computed(() =>
  authStore.hasPermission(`delete-${props.resourceType}`)
);

function isEditLoadingForRow(item) {
  const lid = props.loadingEditId;
  if (lid == null || lid === "") return false;
  return String(lid) === String(item?.id);
}

function rawCellValue(item, path) {
  if (path === "student_st_num_and_id") {
    const st = item?.student?.st_num;
    const id = item?.id;
    const parts = [];
    if (st != null && String(st).trim() !== "") parts.push(String(st).trim());
    if (id != null && String(id).trim() !== "") parts.push(String(id));
    return parts.join(" · ");
  }
  const v = path
    .split(".")
    .reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), item);
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

function badgeDisplayText(item, path) {
  const t = rawCellValue(item, path);
  return t || "—";
}

function badgeSpanClass(key, item) {
  const v = rawCellValue(item, key).toLowerCase();
  const base =
    key === "field"
      ? props.compact
        ? "inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[10px] font-semibold leading-tight"
        : "inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold"
      : props.compact
        ? "inline-flex items-center justify-center px-2 py-0 rounded-full text-[10px] font-semibold capitalize leading-tight"
        : "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize";
  let tone =
    "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600";
  if (key === "status") {
    if (v === "pending")
      tone =
        "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700";
    else if (v === "closed")
      tone =
        "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600";
    else if (v === "approved" || v === "resolved")
      tone =
        "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700";
    else if (v === "rejected")
      tone =
        "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800";
  } else if (key === "type") {
    if (v === "complain")
      tone =
        "bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-700";
    else if (v === "request")
      tone =
        "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-100 dark:border-sky-700";
    else if (v === "edit")
      tone =
        "bg-violet-100 text-violet-900 border border-violet-200 dark:bg-violet-900/40 dark:text-violet-100 dark:border-violet-700";
  } else if (key === "field") {
    tone =
      "bg-[#624ff6]/12 text-[#4f3dd4] border border-[#624ff6]/30 dark:bg-[#624ff6]/25 dark:text-[#ddd6fe] dark:border-[#624ff6]/45 font-medium whitespace-normal text-center leading-snug";
  }
  return `${base} ${tone}`;
}

function textMoreKey(rowId, colKey) {
  return `${rowId}::${colKey}`;
}

function isTextMoreExpanded(rowId, colKey) {
  return !!expandedTextCells.value[textMoreKey(rowId, colKey)];
}

function toggleTextMore(rowId, colKey) {
  const k = textMoreKey(rowId, colKey);
  expandedTextCells.value = {
    ...expandedTextCells.value,
    [k]: !expandedTextCells.value[k],
  };
}

function collapsibleNeedsToggle(item, key) {
  return rawCellValue(item, key).length > props.collapsibleTextMaxChars;
}

function displayCollapsibleText(item, key) {
  const raw = rawCellValue(item, key);
  if (!raw) return "—";
  if (
    isTextMoreExpanded(item.id, key) ||
    raw.length <= props.collapsibleTextMaxChars
  ) {
    return raw;
  }
  return `${raw.slice(0, props.collapsibleTextMaxChars)}…`;
}

const toggleExpand = (rowId, totalCourses) => {
  if (!expandedRows.value[rowId]) {
    expandedRows.value[rowId] = COURSES_INCREMENT;
  } else if (expandedRows.value[rowId] < totalCourses) {
    expandedRows.value[rowId] += COURSES_INCREMENT;
  } else {
    expandedRows.value[rowId] = COURSES_INCREMENT;
  }
};

// Function to format the created_at or updated_at date
const formatDate = (date) => {
  if (!date) return "";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleString("en-US", options);
};

const formatDateShort = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const filteredItems = computed(() => {
  if (!search.value) return props.items;
  const lowerSearch = search.value.toLowerCase();
  return props.items.filter((item) =>
    props.headers.some((header) => {
      const value = getValueByPath(item, header.key);
      return (
        typeof value === "string" && value.toLowerCase().includes(lowerSearch)
      );
    })
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage);
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

function getValueByPath(obj, path) {
  if (
    path === "created_at" ||
    path === "updated_at" ||
    path === "Updated_at" ||
    path === "booking_datetime"
  ) {
    const raw = obj[path];
    return props.compact ? formatDateShort(raw) : formatDate(raw);
  }

  if (path === "courses") {
    const fullCourses = obj.courses?.map((c) => c.name) || [];
    const isExpanded = expandedRows.value[obj.id];
    const displayCount = isExpanded ? fullCourses.length : 3;
    const displayedCourses = fullCourses.slice(0, displayCount);

    const moreOrLessBtn =
      fullCourses.length > 3
        ? `<button class="ml-2 text-indigo-600 underline" onclick="__TOGGLE__"> ${
            isExpanded ? "Less" : "More"
          }</button>`
        : "";

    return displayedCourses.join(", ") + moreOrLessBtn;
  }

  if (path === "roles") {
    return obj.roles && obj.roles.length > 0
      ? obj.roles.map((role) => `(${role.name})`).join(", ")
      : "No roles";
  }
  if (path === "permissions") {
    return obj.permissions && obj.permissions.length > 0
      ? obj.permissions.map((permissions) => `(${permissions.name})`).join(", ")
      : "No Permissions";
  }
  if (path === "instructor") {
    return obj.instructor && obj.instructor.length > 0
      ? obj.instructor.map((instructor) => `(${instructor.name})`).join(", ")
      : "No instructor";
  }

  if (path === "student.phones") {
    return Array.isArray(obj.student?.phones)
      ? obj.student.phones.join(", ")
      : "";
  }

  if (path === "student_st_num_and_id") {
    const st = obj?.student?.st_num;
    const id = obj?.id;
    const parts = [];
    if (st != null && String(st).trim() !== "") parts.push(String(st).trim());
    if (id != null && String(id).trim() !== "") parts.push(String(id));
    return parts.join(" · ");
  }

  return (
    path
      .split(".")
      .reduce((o, key) => (o && o[key] !== undefined ? o[key] : ""), obj) || ""
  );
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const showDetails = (row) => {
  if (props.resourceType === "scholarship") {
    emit("open-scholarship-detail", row.id);
    return;
  }
  selectedExam.value = row;
};

watch(search, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
/* Allow text wrapping in table cells */
td {
  word-wrap: break-word;
  white-space: normal;
}
</style>

<!-- v-if="canEdit"
v-if="canEdit"
v-if="canDelete"
v-if="canEdit || canDelete" -->
