<template>
  <div class="max-h-[min(70vh,720px)] overflow-y-auto pr-1 -mr-1 space-y-6">
    <!-- Plan basics -->
    <section class="rounded-xl border border-gray-200 bg-slate-50/50 p-4 sm:p-5">
      <h3 class="text-sm font-semibold text-indigo-900 mb-4">Plan details</h3>
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
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
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
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
              class="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
              class="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
      class="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 sm:p-6 shadow-sm"
    >
      <h3 class="text-base font-bold text-indigo-950 mb-4">Add course by code</h3>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5" for="sp-code"
            >Course code</label
          >
          <input
            id="sp-code"
            v-model="courseCodeInput"
            type="text"
            placeholder="e.g. 5001"
            class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none"
            @keydown.enter.prevent="loadCourseByCode"
          />
        </div>
        <div class="flex items-end sm:pb-0">
          <button
            type="button"
            :disabled="loadingGroups || !courseCodeInput.trim()"
            class="w-full sm:w-auto sm:min-w-[200px] inline-flex justify-center items-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
            @click="loadCourseByCode"
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
    <section v-if="!form.course_groups?.length" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 px-4 text-center">
      <BookOpen class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm font-medium text-gray-700">No courses in this plan yet</p>
      <p class="text-xs text-gray-500 mt-1">Use course code above to add the first one.</p>
    </section>

    <div v-else class="space-y-4">
      <article
        v-for="(cg, ci) in form.course_groups"
        :key="courseKey(cg, ci)"
        class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        <header
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white text-sm font-bold shrink-0 shadow-sm"
              >{{ ci + 1 }}</span
            >
            <div class="min-w-0">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Course code</p>
              <p class="text-xl font-mono font-bold text-gray-900 tracking-tight">
                {{ cg.course_code }}
              </p>
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
          <button
            type="button"
            class="text-sm text-red-600 hover:text-red-800 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            @click="removeCourse(ci)"
          >
            Remove
          </button>
        </header>

        <!-- Groups -->
        <div class="px-4 pb-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <h4
              class="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2"
            >
              <Users class="w-5 h-5 text-indigo-600" />
              Groups
            </h4>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
              @click="addEmptyGroup(ci)"
            >
              <Plus class="w-4 h-4 shrink-0" />
              Add group
            </button>
          </div>

          <div v-if="!visibleGroups(cg).length" class="text-xs text-gray-500 py-4 text-center rounded-lg bg-gray-50 border border-gray-100">
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
                  v-for="(g, gi) in visibleGroups(cg)"
                  :key="groupRowKey(ci, g, gi)"
                  :class="isLockedExistingGroup(g) ? 'bg-gray-50/90' : 'hover:bg-slate-50/80'"
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
import { LucideUser, BookOpen, Plus, Users, Trash2 } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { useCourseStore } from "@/stores/courseStore";
import notyf from "@/components/global/notyf";
import { mapApiGroupToForm } from "@/utils/scholarshipPlan";

const props = defineProps({
  form: Object,
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const courseStore = useCourseStore();
const courseCodeInput = ref("");
const loadingGroups = ref(false);

onMounted(() => {
  if (!Array.isArray(props.form.course_groups)) {
    props.form.course_groups = [];
  }
});

function courseKey(cg, i) {
  return cg.course_code != null ? `c-${cg.course_code}` : `idx-${i}`;
}

function groupRowKey(ci, g, gi) {
  if (g.id != null) return `grp-${ci}-${g.id}`;
  return g._uiKey ?? `grp-${ci}-${gi}`;
}

function isLockedExistingGroup(g) {
  return !props.isEditing && g.id != null;
}

function visibleGroups(cg) {
  return (cg?.groups ?? []).filter((g) => !g?._deleted);
}

function extractGroupsFromResponse(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.groups)) return raw.groups;
  if (raw && raw.data && Array.isArray(raw.data)) return raw.data;
  return [];
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
  props.form.course_groups = list;
}

async function loadCourseByCode() {
  const code = String(courseCodeInput.value).trim();
  if (!code) return;

  if (props.form.course_groups?.some((cg) => String(cg.course_code) === code)) {
    notyf.error("This course code is already in the plan.");
    return;
  }

  loadingGroups.value = true;
  try {
    /** GET /courses/{code}/groups — same value user typed, no catalog lookup */
    const raw = await courseStore.fetchCourseGroups(code, { silent: true });
    const groupsList = extractGroupsFromResponse(raw).map((g, index) => ({
      ...mapApiGroupToForm(g),
      _uiKey: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    }));

    const numCode = Number(code);
    const entry = {
      course_code: Number.isFinite(numCode) ? numCode : code,
      course_name: "",
      course_type: "module",
      course_start_date: "",
      course_is_active: true,
      is_new_course: false,
      requires_group_setup: false,
      groups: groupsList.length ? groupsList : [emptyGroup()],
    };

    appendCourseGroup(entry);
    courseCodeInput.value = "";
    notyf.success("Groups loaded. Adjust groups if needed, then save the plan.");
  } catch (err) {
    if (isMissingOrInvalidCourseError(err)) {
      const entry = buildNewCourseEntry(code);
      appendCourseGroup(entry);
      courseCodeInput.value = "";
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
  list.splice(index, 1);
  props.form.course_groups = list;
}
</script>
