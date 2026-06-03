<template>
  <div
    class="w-full overflow-x-auto dark:bg-gray-800"
    :class="
      embedded
        ? 'rounded-none border-0 bg-transparent shadow-none'
        : roundedTop
          ? 'rounded-t-2xl rounded-b-xl border border-gray-150 bg-white shadow-sm dark:border-gray-700/60 overflow-hidden'
          : 'rounded-2xl border border-gray-150 dark:border-gray-700/60 bg-white shadow-sm overflow-hidden'
    "
  >
    <div>
      <div class="flex flex-col pt-0">
        <!-- Modern Card Search Header -->
        <div
          v-if="showSearch"
          class="flex items-center justify-between"
          :class="embedded ? 'px-4 py-3 border-b border-gray-100 dark:border-gray-750 bg-transparent' : 'px-6 py-4 border-b border-gray-150 dark:border-gray-700/60 bg-white dark:bg-gray-800'"
        >
          <div class="relative w-full max-w-sm">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              v-model="search"
              :placeholder="embedded ? 'Search by name...' : 'Search...'"
              class="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div
      v-if="!sortedFilteredItems.length && loading"
      :class="compact ? 'flex justify-center items-center py-10' : 'flex justify-center items-center py-20'"
    >
      <div
        class="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10"
      ></div>
    </div>

    <div v-else>
      <!-- Table -->
      <table
        class="w-full min-w-[960px] table-auto divide-y divide-gray-200 text-center dark:divide-gray-700 md:min-w-[1024px]"
        :class="compact ? 'text-sm' : ''"
      >
        <thead
          class="bg-slate-50/75 dark:bg-slate-900/40 border-b border-gray-150 dark:border-gray-700/60 text-gray-500 dark:text-gray-400"
          :class="[
            embedded ? 'sticky top-0 z-[2] shadow-sm' : '',
          ]"
        >
          <tr>
            <th
              v-if="selectable"
              class="w-12 px-4 py-4 text-center align-middle"
            >
              <input
                type="checkbox"
                :checked="isAllSelected"
                :ref="(el) => { if (el) el.indeterminate = isSomeSelected }"
                @change="toggleSelectAllRows"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </th>
            <th
              v-for="header in headers"
              :key="header.key"
              class="font-bold tracking-wider text-center align-middle text-xs uppercase whitespace-nowrap"
              :class="
                compact
                  ? 'px-3.5 py-3'
                  : 'px-6 py-4'
              "
            >
              <button
                v-if="header.sortable"
                type="button"
                class="mx-auto flex w-full max-w-[11rem] items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-center font-bold tracking-wider text-xs uppercase text-gray-500 dark:text-gray-400 transition hover:bg-gray-100/70 dark:hover:bg-gray-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                @click="toggleSortByColumn(header)"
                :aria-sort="
                  sortColumnKey === header.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                "
                :aria-label="`Sort by ${header.label}`"
              >
                <span class="leading-snug">{{ header.label }}</span>
                <ArrowUpWideNarrow
                  v-if="sortHeaderState(header) === 'asc'"
                  class="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <ArrowDownWideNarrow
                  v-else-if="sortHeaderState(header) === 'desc'"
                  class="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <ArrowUpDown
                  v-else
                  class="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-550"
                  aria-hidden="true"
                />
              </button>
              <template v-else>{{ header.label }}</template>
            </th>
            <th
              v-if="showEmployeeReply"
              class="text-center font-bold tracking-wider text-xs uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap"
              :class="
                compact
                  ? 'px-3.5 py-3'
                  : 'px-6 py-4'
              "
            >
              Reply
            </th>
            <th
              v-if="!hideActions"
              class="text-center font-bold tracking-wider text-xs uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap"
              :class="
                compact
                  ? 'px-3.5 py-3'
                  : 'px-6 py-4'
              "
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
          <!-- Render data rows -->
          <tr
            v-for="item in paginatedItems"
            :key="item.id"
            class="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 bg-white dark:bg-gray-800 transition-all duration-150 group border-b border-gray-100 dark:border-gray-700/50"
          >
            <td
              v-if="selectable"
              class="w-12 px-4 py-4 text-center align-middle"
            >
              <input
                type="checkbox"
                :checked="isSelectedRow(item.id)"
                @change="toggleSelectRow(item.id)"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </td>
            <td
              v-for="header in headers"
              :key="header.key"
              :class="bodyTdClass(header)"
            >
              <!-- Special handling for Courses column -->
              <div v-if="header.key === 'courses'" :class="cellsCentered ? 'text-center' : ''">
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
                :class="[
                  cellsCentered ? 'text-center' : 'text-start',
                  'font-medium text-gray-900 dark:text-gray-100 tabular-nums',
                ]"
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

              <div v-else-if="collapsibleTextKeys.includes(header.key)" :class="cellsCentered ? 'flex flex-col items-center gap-0.5' : ''">
                <span class="whitespace-pre-wrap break-words leading-snug">{{ displayCollapsibleText(item, header.key) }}</span>
                <button
                  v-if="collapsibleNeedsToggle(item, header.key)"
                  type="button"
                  class="mt-0.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs font-medium underline-offset-2 hover:underline"
                  :class="
                    cellsCentered
                      ? 'mx-auto inline-block w-auto text-center'
                      : 'block w-full text-start'
                  "
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
                class="min-w-0 w-full"
                :class="cellsCentered ? 'flex flex-col items-center text-center' : 'text-start'"
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

              <!-- Booking: date on first line, full time (incl. AM/PM) on second -->
              <div
                v-else-if="header.key === 'booking_datetime'"
                class="flex flex-col gap-0.5 leading-tight tabular-nums"
                :class="cellsCentered ? 'items-center text-center' : 'items-center'"
              >
                <template v-for="bd in [bookingDatetimeLines(item)]" :key="`${item?.id}-${bd?.dateLine ?? ''}-${bd?.timeLine ?? ''}`">
                  <template v-if="bd">
                    <span class="text-gray-900 dark:text-gray-100">{{ bd.dateLine }}</span>
                    <span class="text-slate-600 dark:text-slate-400">{{ bd.timeLine }}</span>
                  </template>
                  <span v-else class="text-gray-400 dark:text-gray-500">—</span>
                </template>
              </div>

              <!-- Default rendering for other columns -->
              <span
                v-else-if="
                  linkNameToDetails &&
                  (header.key === 'name' || header.key === 'student.name')
                "
                @click="showDetails(item)"
                :class="
                  cellsCentered
                    ? 'inline-flex cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 transition-colors'
                    : 'cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 transition-colors'
                "
              >
                {{ getValueByPath(item, header.key) }}
              </span>
              <span v-else :class="cellsCentered && 'inline-block max-w-full'">{{ getValueByPath(item, header.key) }}</span>
            </td>

            <td
              v-if="showEmployeeReply"
              class="whitespace-nowrap align-middle"
              :class="[
                compact ? 'px-3 py-2' : 'px-6 py-4',
                cellsCentered && 'text-center',
              ]"
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
              class="whitespace-nowrap align-middle"
              :class="[
                compact ? 'px-3 py-2' : 'px-6 py-4',
                cellsCentered ? 'text-center' : '',
              ]"
            >
              <div class="flex items-center gap-2" :class="cellsCentered ? 'justify-center' : ''">
                <button
                  v-if="canEdit"
                  type="button"
                  :disabled="isEditLoadingForRow(item)"
                  @click="emit('edit', item)"
                  class="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 transition-all duration-200 cursor-pointer shadow-sm inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Edit"
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
                  type="button"
                  @click="emit('delete', item.id)"
                  class="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 hover:text-rose-750 transition-all duration-200 cursor-pointer shadow-sm inline-flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 class="w-4 h-4 shrink-0" />
                </button>
              </div>
            </td>
          </tr>

          <!-- No results found for the search -->
          <tr v-if="sortedFilteredItems.length === 0 && search.length > 0">
            <td
              :colspan="headers.length + tailColumnCount"
              class="font-bold text-gray-700 dark:text-gray-300"
              :class="[
                compact ? 'px-3 py-2 text-sm' : 'px-6 py-4',
                cellsCentered ? 'text-center' : 'text-start',
              ]"
            >
              No results found for "{{ search }}".
            </td>
          </tr>
          <tr v-if="sortedFilteredItems.length === 0 && !loading">
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
        class="mt-4 flex justify-center gap-3 border-t border-slate-100 p-4"
        :class="embedded ? 'bg-slate-50/60' : ''"
        v-if="sortedFilteredItems.length > 0"
      >
        <button
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5346e0] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>
        <div class="flex items-center">
          <span class="text-sm text-slate-600">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
        </div>
        <button
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5346e0] disabled:cursor-not-allowed disabled:opacity-45"
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
import { Edit, MessageCircleReply, Trash2, ArrowUpDown, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-vue-next";
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
  /** Body cells horizontally centered (padding unchanged). */
  cellsCentered: {
    type: Boolean,
    default: false,
  },
  /** Column keys that use tabular-nums while staying centered when applicable. */
  tabularColumnKeys: {
    type: Array,
    default: () => [],
  },
  /** Sits inside a parent card: no outer shadow/radius/border so layout stays one surface. */
  embedded: {
    type: Boolean,
    default: false,
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
  selectable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "edit",
  "delete",
  "open-scholarship-detail",
  "employee-reply",
  "update:selected",
]);

const tailColumnCount = computed(() => {
  let n = props.hideActions ? 0 : 1;
  if (props.showEmployeeReply) n += 1;
  if (props.selectable) n += 1;
  return n;
});

const isAllSelected = computed(() => {
  const filtered = filteredItems.value;
  if (!filtered.length) return false;
  return filtered.every((item) => props.selected.some((id) => String(id) === String(item.id)));
});

const isSomeSelected = computed(() => {
  const filtered = filteredItems.value;
  if (!filtered.length) return false;
  const numSelected = filtered.filter((item) => props.selected.some((id) => String(id) === String(item.id))).length;
  return numSelected > 0 && numSelected < filtered.length;
});

const isSelectedRow = (id) => {
  return props.selected.some((selectedId) => String(selectedId) === String(id));
};

const toggleSelectRow = (id) => {
  const newSelected = [...props.selected];
  const idx = newSelected.findIndex((selectedId) => String(selectedId) === String(id));
  if (idx >= 0) {
    newSelected.splice(idx, 1);
  } else {
    newSelected.push(id);
  }
  emit("update:selected", newSelected);
};

const toggleSelectAllRows = () => {
  const filtered = filteredItems.value;
  if (isAllSelected.value) {
    const newSelected = props.selected.filter((id) => !filtered.some((item) => String(item.id) === String(id)));
    emit("update:selected", newSelected);
  } else {
    const newSelected = [...props.selected];
    filtered.forEach((item) => {
      if (!newSelected.some((id) => String(id) === String(item.id))) {
        newSelected.push(item.id);
      }
    });
    emit("update:selected", newSelected);
  }
};

/** Density + horizontal alignment per column key (padding unchanged). */
function bodyTdClass(header) {
  const pad = props.compact ? "px-3 py-2" : "px-6 py-4";
  const tab = props.tabularColumnKeys?.includes(header.key) ? "tabular-nums" : "";
  const c = props.cellsCentered ? "text-center" : "";

  if (props.collapsibleTextKeys.includes(header.key)) {
    const ha = props.cellsCentered ? "text-center" : "text-start";
    return ["break-words", "align-middle", pad, "whitespace-normal", ha, "max-w-[12rem] sm:max-w-[14rem]", tab].filter(Boolean).join(" ");
  }
  if (header.key === "field") {
    const parts = ["break-words", "align-middle", pad, "whitespace-normal", "max-w-[11rem] sm:max-w-[13rem]"];
    if (props.cellsCentered) parts.push("text-center");
    if (tab) parts.push(tab);
    return parts.join(" ");
  }
  if (header.key === "student_st_num_and_id") {
    const ha = props.cellsCentered ? "text-center" : "text-start";
    return ["break-words", "align-middle", pad, "whitespace-normal", ha, "tabular-nums"].join(" ");
  }
  if (props.attributedReplyKeys.includes(header.key)) {
    const ha = props.cellsCentered ? "text-center" : "text-start";
    return ["break-words", pad, "whitespace-normal", ha, "align-top", "max-w-[min(92vw,26rem)] sm:max-w-lg lg:max-w-2xl", tab].filter(Boolean).join(" ");
  }
  if (header.key === "booking_datetime") {
    return ["break-words", "align-middle", pad, "whitespace-normal", c, "tabular-nums"].filter(Boolean).join(" ");
  }

  const parts = ["break-words", "align-middle", pad, "whitespace-nowrap"];
  if (c) parts.push(c);
  if (tab) parts.push(tab);
  return parts.join(" ");
}

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

const sortColumnKey = ref(null);
const sortDirection = ref("desc");

function sortHeaderState(header) {
  if (!header?.sortable) return "idle";
  if (sortColumnKey.value !== header.key) return "idle";
  return sortDirection.value;
}

function toggleSortByColumn(header) {
  if (!header?.sortable) return;
  const k = header.key;
  if (sortColumnKey.value !== k) {
    sortColumnKey.value = k;
    sortDirection.value = "desc";
  } else {
    sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
  }
  currentPage.value = 1;
}

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
  } else if (key === "study_type") {
    if (v === "online")
      tone =
        "bg-blue-50 text-blue-750 border border-blue-150/45 dark:bg-blue-950/45 dark:text-blue-300 dark:border-blue-900/40";
    else if (v === "class")
      tone =
        "bg-purple-50 text-purple-750 border border-purple-150/45 dark:bg-purple-950/45 dark:text-purple-300 dark:border-purple-900/40";
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

/** Two-line booking display: date row, then time row (keeps AM/PM with the time). */
function formatBookingDatetimeParts(raw) {
  if (raw == null || raw === "") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const dateLine = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLine = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { dateLine, timeLine };
}

function bookingDatetimeLines(item) {
  return formatBookingDatetimeParts(item?.booking_datetime);
}

function formatBookingDatetimeForSearch(raw) {
  const p = formatBookingDatetimeParts(raw);
  if (!p) return typeof raw === "string" ? raw : "";
  return `${p.dateLine} ${p.timeLine}`;
}

function comparableSortValue(item, path) {
  if (!item || !path) return "";
  if (path === "booking_datetime") {
    const t = new Date(item.booking_datetime ?? 0).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  const v = path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), item);
  if (v == null || v === "") return "";
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (Array.isArray(v)) return v.join(",").toLowerCase();
  return String(v).toLowerCase();
}

function compareSortItems(a, b, path, direction) {
  const va = comparableSortValue(a, path);
  const vb = comparableSortValue(b, path);
  const dir = direction === "asc" ? 1 : -1;
  if (va === vb) return 0;
  if (typeof va === "number" && typeof vb === "number") {
    return (va - vb) * dir;
  }
  return (
    String(va).localeCompare(String(vb), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * dir
  );
}

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

const sortedFilteredItems = computed(() => {
  const list = [...filteredItems.value];
  const key = sortColumnKey.value;
  if (!key) return list;
  const direction = sortDirection.value;
  list.sort((a, b) => compareSortItems(a, b, key, direction));
  return list;
});

const totalPages = computed(() => {
  return Math.ceil(sortedFilteredItems.value.length / itemsPerPage);
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedFilteredItems.value.slice(start, end);
});

function getValueByPath(obj, path) {
  if (path === "booking_datetime") {
    const raw = obj[path];
    return formatBookingDatetimeForSearch(raw);
  }

  if (path === "name") {
    const name = obj.name || "";
    const abbrev = obj.abbrev || "";
    if (name && abbrev) {
      return `${name} (${abbrev})`;
    }
    return name;
  }

  if (path === "created_at" || path === "updated_at" || path === "Updated_at") {
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

  if (path === "price") {
    const raw = obj[path];
    if (raw === null || raw === undefined || raw === "") return "—";
    const num = Number(raw);
    return Number.isFinite(num) ? `${num.toLocaleString()}` : String(raw);
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
