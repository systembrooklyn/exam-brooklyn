<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-4"
      @click.self="close"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scholarship-detail-title"
      >
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
          <div
            class="animate-spin border-[3px] border-indigo-200 border-t-indigo-600 rounded-full w-11 h-11"
          />
          <p class="text-sm text-gray-500">Loading scholarship details…</p>
        </div>

        <template v-else-if="detail">
          <!-- Header -->
          <div
            class="shrink-0 px-5 sm:px-6 pt-5 pb-4 bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-b border-gray-100"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                  Scholarship plan
                </p>
                <h2
                  id="scholarship-detail-title"
                  class="text-2xl sm:text-3xl font-bold text-gray-900 truncate"
                >
                  {{ detail.name || "—" }}
                </h2>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"
                  >
                    {{ detail.study_type || "—" }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    ID {{ detail.id }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <dl
              class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
            >
              <div class="flex gap-2 rounded-lg bg-white/80 px-3 py-2 border border-gray-100">
                <Calendar class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <dt class="text-xs text-gray-500">Created</dt>
                  <dd class="font-medium text-gray-800">{{ formatDateTime(detail.created_at) }}</dd>
                </div>
              </div>
              <div class="flex gap-2 rounded-lg bg-white/80 px-3 py-2 border border-gray-100">
                <Calendar class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <dt class="text-xs text-gray-500">Last updated</dt>
                  <dd class="font-medium text-gray-800">{{ formatDateTime(detail.updated_at) }}</dd>
                </div>
              </div>
            </dl>
          </div>

          <!-- Body: courses -->
          <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <BookOpen class="w-5 h-5 text-indigo-600" />
                <h3 class="text-lg font-semibold text-gray-900">Courses &amp; groups</h3>
              </div>
              <span
                class="text-xs font-medium tabular-nums px-2 py-1 rounded-md bg-gray-100 text-gray-600"
              >
                {{ courseCount }} {{ courseCount === 1 ? "course" : "courses" }}
              </span>
            </div>

            <p
              v-if="!courses.length"
              class="text-sm text-gray-500 text-center py-10 rounded-xl border border-dashed border-gray-200 bg-gray-50/50"
            >
              No courses linked to this plan.
            </p>

            <div v-else class="space-y-3">
              <article
                v-for="course in courses"
                :key="course.course_id"
                class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  class="w-full flex items-start gap-3 sm:gap-4 text-left px-4 py-3.5 bg-gray-50/90 hover:bg-gray-100/90 transition-colors"
                  :aria-expanded="isExpanded(course.course_id)"
                  @click="toggleCourse(course.course_id)"
                >
                  <span class="mt-0.5 text-indigo-600 shrink-0">
                    <ChevronDown
                      v-if="isExpanded(course.course_id)"
                      class="w-5 h-5"
                    />
                    <ChevronRight v-else class="w-5 h-5" />
                  </span>
                  <div class="min-w-0 flex-1 pr-2">
                    <div class="flex flex-wrap items-center gap-2 gap-y-1">
                      <span class="font-semibold text-gray-900">{{ course.course_name }}</span>
                      <span
                        class="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700"
                      >
                        {{ course.course_code }}
                      </span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full capitalize bg-slate-100 text-slate-700"
                      >
                        {{ course.course_type || "—" }}
                      </span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full font-medium"
                        :class="activePillClass(course.course_is_active)"
                      >
                        {{ activeLabel(course.course_is_active) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      <span class="font-medium text-gray-600">Start:</span>
                      {{ formatDateTime(course.course_start_date) }}
                      <span class="mx-2 text-gray-300">·</span>
                      <span class="font-medium text-gray-600">Groups:</span>
                      {{ groupCount(course) }}
                    </p>
                  </div>

                  <div class="ml-auto w-[280px] lg:w-[350px] shrink-0">
                    <div
                      v-if="bookingPriorityGroup(course)"
                      class="rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2.5"
                    > 
                      <p class="text-[10px] uppercase tracking-wide font-semibold text-indigo-600">
                        Booking Group: <span class="text-gray-950">{{ bookingPriorityGroup(course).group_name || "—" }}</span> <span class="text-gray-950 font-bold">#code: {{ bookingPriorityGroup(course).group_code || "—" }}</span>
                      </p>
                      <p class="text-[10px] uppercase tracking-wide font-semibold text-indigo-600">
                        Start: <span class="text-gray-950 font-bold">{{ formatDateTime(bookingPriorityGroup(course).group_start_date) }}</span>
                      </p>
                    </div>

                    <div
                      v-else
                      class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[11px] leading-4 text-gray-500"
                    >
                      No active group for booking.
                    </div>
                  </div>
                </button>

                <div
                  v-show="isExpanded(course.course_id)"
                  class="border-t border-gray-100 bg-white relative overflow-y-auto"
                  style="max-height: 500px;"
                >
                  <div class="px-4 py-3">
                    <div
                      v-if="!groupList(course).length"
                      class="text-sm text-gray-500 py-4 text-center rounded-lg bg-gray-50"
                    >
                      No groups for this course.
                    </div>
                    <GroupTypeTabsTable
                      v-else
                      :groups="groupList(course)"
                      :highlighted-group="bookingPriorityGroup(course)"
                      empty-text="No groups for this type."
                    />
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div
            class="shrink-0 px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/80 flex justify-end"
          >
            <button
              type="button"
              class="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
              @click="close"
            >
              Close
            </button>
          </div>
        </template>

        <div v-else class="px-6 py-12 text-center text-gray-500 text-sm">No data loaded.</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-vue-next";
import GroupTypeTabsTable from "@/components/dashboard/GroupTypeTabsTable.vue";
import formatDate from "../global/FormDate";

const props = defineProps({
  modelValue: Boolean,
  detail: { type: Object, default: null },
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const expandedIds = ref(new Set());

const courses = computed(() => {
  const list = props.detail?.courses;
  return Array.isArray(list) ? list : [];
});

const courseCount = computed(() => courses.value.length);

function groupList(course) {
  const g = course?.groups;
  return Array.isArray(g) ? g : [];
}

function groupCount(course) {
  return groupList(course).length;
}

function toTimestamp(raw) {
  if (raw == null || raw === "") return Number.NEGATIVE_INFINITY;
  const s = String(raw).trim();

  const direct = Date.parse(s);
  if (!Number.isNaN(direct)) return direct;

  // Fallback for DD/MM/YYYY and DD/MM/YYYY HH:mm[:ss]
  const [datePart = "", timePart = "00:00:00"] = s.split(" ");
  const dmy = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dmy) return Number.NEGATIVE_INFINITY;

  const [, dd, mm, yyyy] = dmy;
  const normalizedTime = timePart.length === 5 ? `${timePart}:00` : timePart;
  const isoLike = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${normalizedTime}`;
  const parsed = Date.parse(isoLike);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function isActiveGroup(group) {
  return group?.group_is_active === true || group?.group_is_active === 1;
}

function normalizeType(value) {
  return String(value ?? "").trim().toLowerCase();
}

function bookingPriorityGroup(course) {
  const scholarshipType = normalizeType(props.detail?.study_type);
  const typedGroups =
    scholarshipType === "online" || scholarshipType === "class"
      ? groupList(course).filter(
          (group) => normalizeType(group?.group_type) === scholarshipType
        )
      : groupList(course);

  const activeGroups = typedGroups.filter(isActiveGroup);
  if (!activeGroups.length) return null;

  const sortedByDateAsc = [...activeGroups].sort(
    (a, b) => toTimestamp(a?.group_start_date) - toTimestamp(b?.group_start_date)
  );

  const now = new Date();
  const tenDaysLater = new Date(now);
  tenDaysLater.setDate(now.getDate() + 15);
  const thresholdTs = tenDaysLater.getTime();

  const upcoming = sortedByDateAsc.find(
    (group) => toTimestamp(group?.group_start_date) >= thresholdTs
  );
  if (upcoming) return upcoming;

  return sortedByDateAsc[sortedByDateAsc.length - 1] ?? null;
}

function isExpanded(courseId) {
  return expandedIds.value.has(courseId);
}

function toggleCourse(courseId) {
  const next = new Set(expandedIds.value);
  if (next.has(courseId)) next.delete(courseId);
  else next.add(courseId);
  expandedIds.value = next;
}

function activeLabel(val) {
  if (val === 1 || val === true) return "Active";
  if (val === 0 || val === false) return "Inactive";
  return "—";
}

function activePillClass(val) {
  if (val === 1 || val === true) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (val === 0 || val === false) {
    return "bg-gray-200 text-gray-600";
  }
  return "bg-gray-100 text-gray-600";
}

/** Date-only via FormDate; full datetime shown as DD/MM/YYYY + time when present */
function formatDateTime(raw) {
  if (raw == null || raw === "") return "—";
  const s = String(raw);
  const parts = s.split(" ");
  const datePart = formatDate(s);
  if (parts.length >= 2 && parts[1]) {
    const time = parts[1].slice(0, 5);
    if (time && time !== "00:00") {
      return `${datePart} · ${time}`;
    }
  }
  return datePart;
}

const close = () => emit("update:modelValue", false);

watch(
  () => props.detail,
  () => {
    expandedIds.value = new Set();
  },
  { immediate: true }
);
</script>
