<template>
  <div class="max-h-[min(74vh,760px)] overflow-y-auto pr-1 -mr-1 space-y-4">
    <!-- Plan basics -->
    <section class="rounded-xl border border-gray-200 bg-slate-50/50 p-3.5 sm:p-4">
      <h3 class="text-sm font-semibold text-indigo-900 mb-3">Plan details</h3>
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
      >
        <div class="min-w-0 flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="sp-name"
            >Scholarship name</label
          >
          <div class="relative">
            <LucideUser
              class="text-gray-400 w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="sp-name"
              v-model="form.name"
              type="text"
              placeholder="e.g. BRC, MBA…"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
        <div class="shrink-0 w-full sm:w-auto">
          <span class="block text-sm font-medium text-gray-700 mb-1">Study format</span>
          <div
            class="inline-flex w-full sm:w-auto justify-stretch rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
            role="radiogroup"
            aria-label="Study format"
          >
            <label
              class="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              :class="
                form.study_type === 'online'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              "
            >
              <input
                v-model="form.study_type"
                type="radio"
                value="online"
                class="sr-only"
              />
              Online
            </label>
            <label
              class="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              :class="
                form.study_type === 'class'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              "
            >
              <input v-model="form.study_type" type="radio" value="class" class="sr-only" />
              Class
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- Material / course code -->
    <section
      class="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-3.5 sm:p-4 shadow-sm"
    >
      <h3 class="text-sm sm:text-base font-bold text-indigo-950 mb-3">Add course</h3>
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5" for="sp-course-select"
            >Course (name + code)</label
          >
          <multiselect
            id="sp-course-select"
            v-model="selectedCourseOption"
            :options="courseOptions"
            :custom-label="formatCourseOption"
            track-by="value"
            placeholder="Select course by name or code"
            :searchable="true"
            :allow-empty="true"
            :show-labels="false"
            :close-on-select="true"
            :taggable="true"
            tag-placeholder="Type a new course code then press Enter"
            @tag="handleNewCourseCodeTag"
            class="course-select"
          />
        </div>
        <div class="flex items-end sm:pb-0">
          <button
            type="button"
            :disabled="loadingGroups || !selectedCourseOption"
            class="w-full sm:w-auto sm:min-w-[190px] inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0"
            @click="loadCourseByCode(selectedCourseOption?.value)"
          >
            <span
              v-if="loadingGroups"
              class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            <Plus v-else class="w-5 h-5 shrink-0" />
            Add course &amp; load groups
          </button>
        </div>
      </div>
    </section>

    <!-- Course groups -->
    <section v-if="!form.course_groups?.length" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 px-4 text-center">
      <BookOpen class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-sm font-medium text-gray-700">No courses in this plan yet</p>
      <p class="text-xs text-gray-500 mt-1">Use course code above to add the first one.</p>
    </section>

    <div v-else class="space-y-3">
      <article
        v-for="(cg, ci) in form.course_groups"
        :key="ensureCourseItemKey(cg)"
        data-scholarship-course-item
        class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow"
        :class="{
          'opacity-60': draggingCourseIndex === ci,
          'ring-2 ring-indigo-400 ring-offset-1':
            dragOverCourseIndex === ci && draggingCourseIndex !== ci,
        }"
      >
        <header
          class="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-100 cursor-pointer"
          @click="toggleCourseExpansion(ensureCourseItemKey(cg))"
        >
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              class="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200/80 touch-none inline-flex select-none"
              role="button"
              tabindex="0"
              aria-label="Drag to reorder course"
              title="Drag to reorder"
              @click.stop
              @keydown.enter.prevent
              @keydown.space.prevent
              @pointerdown="onCourseGripPointerDown(ci, $event)"
            >
              <GripVertical class="w-4 h-4 pointer-events-none" />
            </span>
            <button
              type="button"
              class="shrink-0 text-indigo-600 hover:text-indigo-800 rounded p-1 hover:bg-indigo-50 transition-colors"
              :aria-label="isCourseExpanded(ensureCourseItemKey(cg)) ? 'Collapse course groups' : 'Expand course groups'"
              @click.stop="toggleCourseExpansion(ensureCourseItemKey(cg))"
            >
              <ChevronDown v-if="isCourseExpanded(ensureCourseItemKey(cg))" class="w-4 h-4" />
              <ChevronRight v-else class="w-4 h-4" />
            </button>
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shrink-0 shadow-sm"
              >{{ ci + 1 }}</span
            >
            <div class="min-w-0">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Course name</p>
              <div class="flex items-center gap-2">
              <p class="text-lg font-semibold text-gray-900 tracking-tight truncate max-w-[200px] sm:max-w-[280px]">
                {{ cg.course_name || `Course ${cg.course_code}` }}
              </p>
              <p class="text-[11px] text-gray-500 mt-0.5 font-mono tabular-nums">
                #{{ cg.course_code }}
              </p>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span
                  class="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold border border-slate-200 capitalize"
                >
                  {{ (cg.course_type || "module").toLowerCase() }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                  :class="
                    isCourseActive(cg)
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  "
                >
                  {{ isCourseActive(cg) ? "Active" : "Inactive" }}
                </span>
              </div>
            </div>
            <span
              v-if="cg.is_new_course"
              class="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-semibold border border-amber-200"
            >
              New course
            </span>
            <span
              v-else
              class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-semibold border border-emerald-200"
            >
              Existing course
            </span>
            <span
              v-if="cg.requires_group_setup"
              class="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-[11px] font-semibold border border-rose-200"
            >
              Setup groups required
            </span>
          </div>

          <div class="ml-auto w-full sm:w-[300px] rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2">
            <template v-if="bookingPriorityGroup(cg)">
              <p class="text-[10px] uppercase tracking-wide font-semibold text-indigo-600">
                Booking Group:
                <span class="text-gray-900">
                  {{ bookingPriorityGroup(cg).group_name || "—" }}
                </span>
                <span class="text-gray-900 font-bold">
                  #Code: {{ bookingPriorityGroup(cg).group_code || "—" }}
                </span>
              </p>
              <p class="text-[10px] uppercase tracking-wide font-semibold text-indigo-600">
                Start:
                <span class="text-gray-900 font-bold">
                  {{ formatBookingDate(bookingPriorityGroup(cg).group_start_date) }}
                </span>
              </p>
            </template>
            <p v-else class="text-[11px] text-gray-500">No active group for booking.</p>
          </div>

          <button
            type="button"
            class="text-xs text-red-600 hover:text-red-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            @click.stop
            @click="removeCourse(ci)"
          >
            Remove
          </button>
        </header>

        <!-- Groups -->
        <div v-show="isCourseExpanded(ensureCourseItemKey(cg))" class="px-3.5 pb-3.5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2.5">
            <h4
              class="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2"
            >
              <Users class="w-5 h-5 text-indigo-600" />
              Groups
            </h4>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
              @click="addEmptyGroup(ci)"
            >
              <Plus class="w-4 h-4 shrink-0" />
              Add group
            </button>
          </div>

          <div v-if="!visibleGroupsSorted(cg).length" class="text-xs text-gray-500 py-4 text-center rounded-lg bg-gray-50 border border-gray-100">
            No groups — click “Add group” or reload course code.
          </div>

          <div v-else class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  <th class="px-2 py-2 w-10 text-center">#</th>
                  <th class="px-2 py-2 w-[140px]">Code</th>
                  <th class="px-2 py-2 min-w-[160px]">Name</th>
                  <th class="px-2 py-2 w-[100px]">Type</th>
                  <th class="px-2 py-2 min-w-[180px]">Start</th>
                  <th class="px-2 py-2 w-20 text-right">Lec.</th>
                  <th class="px-2 py-2 min-w-[120px] text-center">Status</th>
                  <th class="px-2 py-2 w-14"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(g, gi) in visibleGroupsSorted(cg)"
                  :key="groupRowKey(ci, g, gi)"
                  :class="groupRowClass(cg, g)"
                >
                  <td
                    class="px-2 py-2 align-middle text-center text-xs font-semibold text-indigo-700 tabular-nums"
                  >
                    {{ gi + 1 }}
                  </td>
                  <td class="px-2 py-1.5 align-top">
                    <input
                      v-model="g.group_code"
                      type="text"
                      :disabled="isLockedExistingGroup(g)"
                      class="w-full min-w-0 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono"
                    />
                  </td>
                  <td class="px-2 py-1.5 align-top">
                    <input
                      v-model="g.group_name"
                      type="text"
                      class="w-full min-w-[140px] border border-gray-200 rounded px-2 py-1.5 text-xs"
                    />
                  </td>
                  <td class="px-2 py-1.5 align-top">
                    <select
                      v-model="g.group_type"
                      class="w-full border border-gray-200 rounded px-1 py-1.5 text-xs capitalize bg-white"
                    >
                      <option value="class">class</option>
                      <option value="online">online</option>
                    </select>
                  </td>
                  <td class="px-2 py-1.5 align-top">
                    <input
                      v-model="g.group_start_date"
                      type="datetime-local"
                      class="w-full min-w-[170px] border border-gray-200 rounded px-2 py-1.5 text-xs"
                    />
                  </td>
                  <td class="px-2 py-1.5 align-top text-right">
                    <input
                      v-model.number="g.group_total_lec"
                      type="number"
                      min="0"
                      class="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-right"
                    />
                  </td>
                  <td class="px-2 py-2 align-middle">
                    <div class="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                      <button
                        type="button"
                        role="switch"
                        :aria-checked="g.group_is_active"
                        :aria-label="g.group_is_active ? 'Active' : 'Inactive'"
                        class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        :class="g.group_is_active ? 'bg-emerald-500' : 'bg-gray-300'"
                        @click="g.group_is_active = !g.group_is_active"
                      >
                        <span
                          class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out"
                          :class="g.group_is_active ? 'translate-x-5' : 'translate-x-0.5'"
                        />
                      </button>
                      <span
                        class="text-[11px] font-medium"
                        :class="g.group_is_active ? 'text-emerald-700' : 'text-gray-500'"
                      >
                        {{ g.group_is_active ? "Active" : "Inactive" }}
                      </span>
                    </div>
                  </td>
                  <td class="px-1 py-1.5 align-middle text-center">
                    <button
                      type="button"
                      class="text-gray-400 hover:text-red-600 p-1 rounded"
                      title="Remove group"
                      @click="removeGroup(ci, g)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import {
  LucideUser,
  BookOpen,
  Plus,
  Users,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-vue-next";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { useCourseStore } from "@/stores/courseStore";
import notyf from "@/components/global/notyf";
import { mapApiGroupToForm } from "@/utils/scholarshipPlan";
import formatDate from "../global/FormDate";

const props = defineProps({
  form: Object,
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:courseGroups"]);

/** Keep course list in sync with parent ref (Modal → list); avoids stale UI when nested prop assign does not re-render. */
function replaceCourseGroups(nextList) {
  const list = Array.isArray(nextList) ? [...nextList] : [];
  emit("update:courseGroups", list);
}

const courseStore = useCourseStore();
const selectedCourseOption = ref(null);
const loadingGroups = ref(false);
const customCourseOptions = ref([]);
const expandedCourseKeys = ref(new Set());
const draggingCourseIndex = ref(null);
const dragOverCourseIndex = ref(null);

let pointerReorderCleanup = null;

function courseIndexFromPointer(clientY) {
  const nodes = document.querySelectorAll("[data-scholarship-course-item]");
  if (!nodes.length) return null;
  for (let i = 0; i < nodes.length; i++) {
    const r = nodes[i].getBoundingClientRect();
    if (clientY >= r.top && clientY <= r.bottom) return i;
  }
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const r = nodes[i].getBoundingClientRect();
    const mid = (r.top + r.bottom) / 2;
    const d = Math.abs(clientY - mid);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function applyCourseReorder(fromIndex, toIndex) {
  if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
  const list = [...(props.form.course_groups ?? [])];
  if (fromIndex < 0 || fromIndex >= list.length) return;
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  replaceCourseGroups(list);
}

function onCourseGripPointerDown(ci, e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  pointerReorderCleanup?.();
  draggingCourseIndex.value = ci;
  dragOverCourseIndex.value = ci;
  const el = e.currentTarget;
  try {
    el.setPointerCapture(e.pointerId);
  } catch (_) {
    /* ignore */
  }

  const onMove = (ev) => {
    const idx = courseIndexFromPointer(ev.clientY);
    if (idx != null) dragOverCourseIndex.value = idx;
  };

  const onEnd = (ev) => {
    try {
      el.releasePointerCapture(ev.pointerId);
    } catch (_) {
      /* ignore */
    }
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onEnd);
    document.removeEventListener("pointercancel", onEnd);
    pointerReorderCleanup = null;
    const toIndex = courseIndexFromPointer(ev.clientY);
    const from = draggingCourseIndex.value;
    draggingCourseIndex.value = null;
    dragOverCourseIndex.value = null;
    applyCourseReorder(from, toIndex);
  };

  pointerReorderCleanup = () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onEnd);
    document.removeEventListener("pointercancel", onEnd);
    draggingCourseIndex.value = null;
    dragOverCourseIndex.value = null;
  };

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onEnd);
  document.addEventListener("pointercancel", onEnd);
}
const courseOptions = computed(() => {
  const list = Array.isArray(courseStore.courses) ? courseStore.courses : [];
  const base = list
    .map((course) => {
      const code = course?.code ?? course?.course_code ?? course?.id;
      const name = course?.name ?? course?.course_name ?? "Course";
      return {
        label: `${name} (${code ?? "—"})`,
        value: String(code ?? "").trim(),
        name,
        code,
      };
    })
    .filter((opt) => opt.value);
  return [...base, ...customCourseOptions.value];
});

function formatCourseOption(option) {
  if (!option) return "";
  return `${option.name} (${option.code})`;
}

function handleNewCourseCodeTag(rawValue) {
  const code = String(rawValue ?? "").trim();
  if (!code) return;
  const alreadyExists = courseOptions.value.some(
    (opt) => String(opt.value ?? "").toLowerCase() === code.toLowerCase()
  );
  if (alreadyExists) {
    selectedCourseOption.value = courseOptions.value.find(
      (opt) => String(opt.value ?? "").toLowerCase() === code.toLowerCase()
    );
    return;
  }
  const option = {
    label: `Course ${code} (${code})`,
    value: code,
    name: `Course ${code}`,
    code,
  };
  customCourseOptions.value = [...customCourseOptions.value, option];
  selectedCourseOption.value = option;
}

onMounted(() => {
  if (!Array.isArray(props.form?.course_groups)) {
    replaceCourseGroups([]);
  }
  courseStore.fetchCourses();
});

onBeforeUnmount(() => {
  pointerReorderCleanup?.();
});

/** Stable id for list :key, expand/collapse, and drag reorder (mutates cg once). */
function ensureCourseItemKey(cg) {
  if (cg._accordionKey) return cg._accordionKey;
  const id = cg.id ?? cg.course_id;
  if (id != null) {
    cg._accordionKey = `course-${id}`;
    return cg._accordionKey;
  }
  const code = cg.course_code;
  if (code != null && code !== "") {
    cg._accordionKey = `code-${code}`;
    return cg._accordionKey;
  }
  cg._accordionKey = `cg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return cg._accordionKey;
}

function groupRowKey(ci, g, gi) {
  if (g.id != null) return `grp-${ci}-${g.id}`;
  return g._uiKey ?? `grp-${ci}-${gi}`;
}

function isCourseExpanded(key) {
  return expandedCourseKeys.value.has(key);
}

function toggleCourseExpansion(key) {
  const next = new Set(expandedCourseKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedCourseKeys.value = next;
}

function isLockedExistingGroup(g) {
  return !props.isEditing && g.id != null;
}

function isCourseActive(cg) {
  const v = cg?.course_is_active;
  return v === true || v === 1;
}

function visibleGroups(cg) {
  return (cg?.groups ?? []).filter((g) => !g?._deleted);
}

function visibleGroupsSorted(cg) {
  return [...visibleGroups(cg)].sort(
    (a, b) => toTimestamp(b?.group_start_date) - toTimestamp(a?.group_start_date)
  );
}

function extractGroupsFromResponse(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.groups)) return raw.groups;
  if (raw && raw.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

function extractCourseMetaFromResponse(raw) {
  if (raw?.meta?.course) return raw.meta.course;
  if (raw?.course) return raw.course;
  return null;
}

function isMissingOrInvalidCourseError(err) {
  const status = err?.response?.status;
  const message = String(err?.response?.data?.message ?? "")
    .trim()
    .toLowerCase();
  const courseCodeErrors = err?.response?.data?.errors?.course_code;
  const hasCourseCodeInvalidError = Array.isArray(courseCodeErrors)
    ? courseCodeErrors.some((msg) =>
        String(msg ?? "").toLowerCase().includes("invalid")
      )
    : String(courseCodeErrors ?? "").toLowerCase().includes("invalid");
  if (status === 404) return true;
  if (status === 422) return true;
  if (status >= 400 && status < 500) return true;
  if (hasCourseCodeInvalidError) return true;
  if (status === 400) {
    return message.includes("invalid") || message.includes("not found");
  }
  return false;
}

function buildNewCourseEntry(code) {
  const numCode = Number(code);
  return {
    course_code: Number.isFinite(numCode) ? numCode : code,
    course_name: `Course ${code}`,
    course_type: "module",
    course_start_date: "",
    course_is_active: true,
    is_new_course: true,
    requires_group_setup: true,
    groups: [emptyGroup()],
  };
}

/** Replace array reference so Vue reliably re-renders (esp. edit modal + nested form). */
function appendCourseGroup(entry) {
  const list = Array.isArray(props.form.course_groups)
    ? [...props.form.course_groups]
    : [];
  list.push(entry);
  replaceCourseGroups(list);
}

async function loadCourseByCode(inputCode) {
  const code = String(inputCode ?? "").trim();
  if (!code) return;

  if (props.form.course_groups?.some((cg) => String(cg.course_code) === code)) {
    notyf.error("This course code is already in the plan.");
    return;
  }

  loadingGroups.value = true;
  try {
    /** GET /courses/{code}/groups — same value user typed, no catalog lookup */
    const raw = await courseStore.fetchCourseGroups(code, {
      silent: true,
      fullResponse: true,
    });
    const courseMeta = extractCourseMetaFromResponse(raw);
    const groupsList = extractGroupsFromResponse(raw).map((g, index) => ({
      ...mapApiGroupToForm(g),
      _uiKey: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    }));

    const numCode = Number(code);
    const entry = {
      course_code: Number.isFinite(numCode) ? numCode : code,
      course_name: String(courseMeta?.name ?? "").trim() || `Course ${code}`,
      course_type: String(courseMeta?.type ?? "module").toLowerCase(),
      course_start_date: courseMeta?.start_date ?? "",
      course_is_active:
        courseMeta?.is_active === undefined || courseMeta?.is_active === null
          ? true
          : courseMeta.is_active === 1 || courseMeta.is_active === true,
      is_new_course: false,
      requires_group_setup: false,
      groups: groupsList.length ? groupsList : [emptyGroup()],
    };

    appendCourseGroup(entry);
    selectedCourseOption.value = null;
    notyf.success("Groups loaded. Adjust groups if needed, then save the plan.");
  } catch (err) {
    if (isMissingOrInvalidCourseError(err)) {
      const entry = buildNewCourseEntry(code);
      appendCourseGroup(entry);
      selectedCourseOption.value = null;
      notyf.success(
        "Course code not found. Added as a new course, now add its groups before saving."
      );
    } else {
      notyf.error("Failed to load course groups. Please try again.");
    }
  } finally {
    loadingGroups.value = false;
  }
}

function emptyGroup() {
  return {
    _uiKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    group_code: "",
    group_name: "",
    group_type: "online",
    group_start_date: "",
    group_total_lec: 0,
    group_is_active: true,
  };
}

function addEmptyGroup(courseIndex) {
  const cg = props.form.course_groups[courseIndex];
  const groups = Array.isArray(cg.groups) ? [...cg.groups] : [];
  groups.unshift(emptyGroup());
  cg.groups = groups;
}

function removeGroup(courseIndex, group) {
  if (group?.id != null) {
    group._deleted = true;
    return;
  }
  const course = props.form.course_groups[courseIndex];
  const groups = [...(course.groups ?? [])];
  const idx = groups.findIndex((x) => x === group);
  if (idx >= 0) {
    groups.splice(idx, 1);
    course.groups = groups;
  }
}

function removeCourse(index) {
  const list = [...(props.form.course_groups ?? [])];
  const removed = list[index];
  list.splice(index, 1);
  replaceCourseGroups(list);
  if (removed) {
    const removedKey = ensureCourseItemKey(removed);
    const next = new Set(expandedCourseKeys.value);
    next.delete(removedKey);
    expandedCourseKeys.value = next;
  }
}

function normalizeType(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toTimestamp(raw) {
  if (raw == null || raw === "") return Number.NEGATIVE_INFINITY;
  const s = String(raw).trim();

  const direct = Date.parse(s);
  if (!Number.isNaN(direct)) return direct;

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

function bookingPriorityGroup(course) {
  const scholarshipType = normalizeType(props.form?.study_type);
  const scopedGroups = visibleGroups(course).filter((group) => {
    if (scholarshipType !== "online" && scholarshipType !== "class") return true;
    return normalizeType(group?.group_type) === scholarshipType;
  });

  const activeGroups = scopedGroups.filter(isActiveGroup);
  if (!activeGroups.length) return null;

  const sortedByDateAsc = [...activeGroups].sort(
    (a, b) => toTimestamp(a?.group_start_date) - toTimestamp(b?.group_start_date)
  );

  const now = new Date();
  const tenDaysLater = new Date(now);
  tenDaysLater.setDate(now.getDate() + 10);
  const thresholdTs = tenDaysLater.getTime();

  const upcoming = sortedByDateAsc.find(
    (group) => toTimestamp(group?.group_start_date) >= thresholdTs
  );
  if (upcoming) return upcoming;

  return sortedByDateAsc[sortedByDateAsc.length - 1] ?? null;
}

function isSameGroup(a, b) {
  if (!a || !b) return false;
  const aId = a?.id ?? a?.group_id ?? null;
  const bId = b?.id ?? b?.group_id ?? null;
  if (aId != null && bId != null) return String(aId) === String(bId);
  return String(a?.group_code ?? "") === String(b?.group_code ?? "");
}

function groupRowClass(course, group) {
  if (isSameGroup(group, bookingPriorityGroup(course))) {
    return "bg-amber-50/70 ring-1 ring-inset ring-amber-200 hover:bg-amber-100/70";
  }
  return isLockedExistingGroup(group) ? "bg-gray-50/90" : "hover:bg-slate-50/80";
}

function formatBookingDate(raw) {
  if (raw == null || raw === "") return "—";
  const s = String(raw);
  const parts = s.split(" ");
  const datePart = formatDate(s);
  if (parts.length >= 2 && parts[1]) {
    const time = parts[1].slice(0, 5);
    if (time && time !== "00:00") return `${datePart} ${time}`;
  }
  return datePart;
}
</script>
