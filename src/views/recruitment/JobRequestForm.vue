<template>
  <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        <ArrowLeft class="w-5 h-5 text-gray-500" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? 'Edit Job Request' : 'New Job Request' }}
        </h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ isEdit ? 'Update the draft hiring request' : 'Submit a request to hire for a position' }}
        </p>
      </div>
    </div>

    <!-- Manpower Shortage Context Banner -->
    <div v-if="prefillPosition && !isEdit"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-semibold text-amber-800">Vacancy Detected</p>
        <p class="text-xs text-amber-600 mt-0.5">
          This request was initiated from <strong>Manpower Overview</strong> for position
          <strong>{{ prefillPosition.name }}</strong>.
          The position currently has open vacancies.
        </p>
      </div>
    </div>

    <!-- Capacity Guard Banner (manual create only) -->
    <div v-if="showCapacityBanner"
      class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div class="space-y-2 min-w-0">
        <p class="text-sm font-semibold text-red-800">{{ capacityBannerTitle }}</p>
        <p class="text-xs text-red-700 leading-relaxed">{{ capacityBannerMessage }}</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
          <router-link :to="{ name: 'hr-manpower-overview' }"
            class="text-indigo-600 hover:text-indigo-800 hover:underline">
            Open Manpower Overview
          </router-link>
          <router-link v-if="capacityStatus === 'blocked_full' || capacityStatus === 'error'"
            :to="{ name: 'hr-employees' }"
            class="text-indigo-600 hover:text-indigo-800 hover:underline">
            Open Employees
          </router-link>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <!-- Form-wide busy overlay (Path B/C + prefill) — keeps values, shows process -->
      <div v-if="formProcessBusy"
        class="absolute inset-0 z-20 rounded-2xl bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
        <p class="text-sm font-semibold text-gray-700">Loading position data…</p>
        <p class="text-xs text-gray-500 px-6 text-center">Checking requirements and manpower vacancy</p>
      </div>

      <!-- Row 1: Position + Department -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Position <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <select v-model="form.position_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-gray-50 disabled:text-gray-500"
              :disabled="(!!prefillPosition && !isEdit) || fieldLoading.position">
              <option value="">{{ fieldLoading.position ? 'Loading position...' : 'Select position...' }}</option>
              <option v-for="p in positions" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
            </select>
            <span v-if="fieldLoading.position"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Department <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <select v-model="form.department_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-gray-50"
              :disabled="fieldLoading.department">
              <option value="">{{ fieldLoading.department ? 'Loading department...' : 'Select department...' }}</option>
              <option v-for="d in departments" :key="d.id" :value="String(d.id)">{{ d.department_name || d.name }}</option>
            </select>
            <span v-if="fieldLoading.department"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>
      </div>

      <!-- Row 2: Branch + Requested Count -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Branch <span
              class="text-xs text-gray-400">(optional)</span></label>
          <div class="relative">
            <select v-model="form.branch_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-gray-50"
              :disabled="fieldLoading.branch">
              <option value="">{{ fieldLoading.branch ? 'Loading branch...' : 'All branches / not specific' }}</option>
              <option v-for="b in branches" :key="b.id" :value="String(b.id)">{{ b.name }}</option>
            </select>
            <span v-if="fieldLoading.branch"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Requested Count <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <input v-model.number="form.requested_count" type="number" min="1" placeholder="e.g. 2"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50"
              :disabled="fieldLoading.count" />
            <span v-if="fieldLoading.count"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>
      </div>

      <!-- Row 2b: Requested By Employee -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Requested By <span
              class="text-red-500">*</span></label>
          <select v-model="form.requested_by_employee_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
            <option value="">Select employee...</option>
            <option v-for="emp in employees" :key="emp.id" :value="String(emp.id)">{{ employeeName(emp) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Replacement For <span
              class="text-xs text-gray-400">(if replacement)</span></label>
          <select v-model="form.replacement_for_employee_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
            <option value="">None / Not a replacement</option>
            <option v-for="emp in employees" :key="emp.id" :value="String(emp.id)">{{ employeeName(emp) }}</option>
          </select>
        </div>
      </div>

      <!-- Row 3: Priority + Employment Type -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Priority <span
              class="text-red-500">*</span></label>
          <div class="flex gap-2 flex-wrap">
            <button v-for="p in PRIORITIES" :key="p.value" type="button" @click="form.priority = p.value"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
              :class="form.priority === p.value ? p.activeCls : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'">
              {{ p.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Employment Type <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <select v-model="form.employment_type"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-gray-50"
              :disabled="fieldLoading.employment">
              <option value="">{{ fieldLoading.employment ? 'Loading from requirements...' : 'Select type...' }}</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
            <span v-if="fieldLoading.employment"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>
      </div>

      <!-- Row 4: Request Type + Needed Before -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Request Type <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <select v-model="form.request_type"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-gray-50"
              :disabled="fieldLoading.requestType">
              <option value="">{{ fieldLoading.requestType ? 'Loading...' : 'Select type...' }}</option>
              <option value="replacement">Replacement</option>
              <option value="expansion">Expansion</option>
              <option value="temporary">Temporary</option>
              <option value="seasonal">Seasonal</option>
            </select>
            <span v-if="fieldLoading.requestType"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Needed Before <span
              class="text-xs text-gray-400">(optional)</span></label>
          <input v-model="form.needed_before" type="date"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </div>

      <!-- Row 5: Budget Range -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Budget From <span
              class="text-xs text-gray-400">(optional)</span></label>
          <div class="relative">
            <input v-model.number="form.budget_salary_from" type="number" min="0" placeholder="e.g. 5000"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50"
              :disabled="fieldLoading.budget" />
            <span v-if="fieldLoading.budget"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Budget To <span
              class="text-xs text-gray-400">(optional)</span></label>
          <div class="relative">
            <input v-model.number="form.budget_salary_to" type="number" min="0" placeholder="e.g. 8000"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50"
              :disabled="fieldLoading.budget" />
            <span v-if="fieldLoading.budget"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
            </span>
          </div>
        </div>
      </div>

      <!-- Row 6: Reason -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Reason <span
            class="text-xs text-gray-400">(optional)</span></label>
        <textarea v-model="form.reason" rows="3" placeholder="Why is this position needed?"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
      </div>

      <!-- Row 7: Notes -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Notes <span
            class="text-xs text-gray-400">(optional)</span></label>
        <div class="relative">
          <textarea v-model="form.notes" rows="2" placeholder="Additional notes for HR..."
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none disabled:bg-gray-50"
            :disabled="fieldLoading.notes" />
          <span v-if="fieldLoading.notes"
            class="pointer-events-none absolute right-3 top-3">
            <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
          </span>
        </div>
      </div>

      <!-- Validation Error -->
      <p v-if="validationError" class="text-sm text-red-500 flex items-center gap-1.5">
        <AlertTriangle class="w-4 h-4" /> {{ validationError }}
      </p>

      <!-- Submit Buttons -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" @click="$router.back()"
          class="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          Cancel
        </button>
        <button @click="handleSave" :disabled="!canSubmit"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
          <span v-if="store.submitting"
            class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          {{ isEdit ? 'Save Changes' : 'Create Request' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-vue-next';
import { useJobRequestsStore } from '@/stores/recruitment/jobRequestsStore';
import { useHrPositionsStore } from '@/stores/hr/positions';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useReservationStore } from '@/stores/reservations';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrPositionRequirementsStore } from '@/stores/hr/positionRequirements';
import { useManpowerPlansStore } from '@/stores/hr/manpowerPlans';

const route = useRoute();
const router = useRouter();

const store = useJobRequestsStore();
const positionsStore = useHrPositionsStore();
const deptsStore = useHrDepartmentsStore();
const reservationStore = useReservationStore();
const employeesStore = useHrEmployeesStore();
const requirementsStore = useHrPositionRequirementsStore();
const plansStore = useManpowerPlansStore();

const EMPLOYMENT_TYPES = new Set(['full_time', 'part_time', 'contract', 'internship', 'freelance']);
const MANUAL_DEBOUNCE_MS = 200;

// ── Mode ──────────────────────────────────────────────────────────────────
const isEdit = computed(() => !!route.params.id);

// ── Pre-fill from ManpowerOverview via query params ───────────────────────
const prefillPosition = computed(() =>
  route.query.position_id
    ? { id: route.query.position_id, name: route.query.position_name }
    : null
);

const hasQueryPrefill = computed(() => !!prefillPosition.value && !isEdit.value);

// ── Dropdowns ─────────────────────────────────────────────────────────────
const positions = computed(() => positionsStore.positions);
const departments = computed(() => deptsStore.departments);
const branches = computed(() => reservationStore.branches);
const employees = computed(() => employeesStore.employees);

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  const name = joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
  const fp = emp?.fingerprint ?? emp?.fingerPrint ?? pi?.fingerprint ?? pi?.fingerPrint ?? emp?.user?.fingerPrint;
  return fp ? `${name} (${fp})` : name;
};

const toId = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const parseKeywords = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return raw.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }
  return [];
};

const buildRequirementNotes = (req) => {
  const parts = [];
  if (req.gender && req.gender !== 'both') parts.push(`Gender: ${req.gender}`);
  if (req.education_level) parts.push(`Education: ${req.education_level}`);
  if (req.english_level) parts.push(`English: ${req.english_level}`);
  if (req.experience_min != null || req.experience_max != null) {
    parts.push(`Experience: ${req.experience_min ?? '?'}–${req.experience_max ?? '?'} yrs`);
  }
  if (req.age_min != null || req.age_max != null) {
    parts.push(`Age: ${req.age_min ?? '?'}–${req.age_max ?? '?'}`);
  }
  const keywords = parseKeywords(req.keywords);
  if (keywords.length) parts.push(`Keywords: ${keywords.join(', ')}`);
  return parts.length ? `From position requirements — ${parts.join(' · ')}` : '';
};

const resolvePositionDepartmentId = (positionId, requirement = null) => {
  const fromReq = toId(
    requirement?.department_id ??
    requirement?.department?.id ??
    requirement?.department?.department_id ??
    requirement?.position?.department_id ??
    requirement?.position?.department?.id ??
    requirement?.position?.department?.department_id
  );
  if (fromReq) return fromReq;

  const pos = positions.value.find((p) => String(p.id) === String(positionId));
  if (!pos) return '';
  return toId(
    pos.department_id ??
    pos.department?.id ??
    pos.department?.department_id
  );
};

// ── Priority Options ──────────────────────────────────────────────────────
const PRIORITIES = [
  { value: 'low', label: 'Low', activeCls: 'bg-blue-50 border-blue-300 text-blue-700' },
  { value: 'medium', label: 'Medium', activeCls: 'bg-amber-50 border-amber-300 text-amber-700' },
  { value: 'high', label: 'High', activeCls: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: 'urgent', label: 'Urgent', activeCls: 'bg-red-50 border-red-400 text-red-700' },
];

// ── Form State ────────────────────────────────────────────────────────────
const form = reactive({
  position_id: '',
  department_id: '',
  branch_id: '',
  requested_count: 1,
  priority: 'medium',
  employment_type: '',
  request_type: '',
  needed_before: '',
  budget_salary_from: '',
  budget_salary_to: '',
  reason: '',
  notes: '',
  requested_by_employee_id: '',
  replacement_for_employee_id: '',
});

const fieldLoading = reactive({
  position: false,
  department: false,
  branch: false,
  count: false,
  requestType: false,
  employment: false,
  budget: false,
  notes: false,
});

const validationError = ref('');
const mountDone = ref(false);
let requirementsReqSeq = 0;
let capacityReqSeq = 0;
let positionDebounceTimer = null;
let plansLoadPromise = null;
let plansLoadedOnce = false;

/** @type {import('vue').Ref<'idle' | 'checking' | 'ok' | 'blocked_no_plan' | 'blocked_full' | 'error'>} */
const capacityStatus = ref('idle');
const remainingVacancy = ref(0);
const capacityPlanCount = ref(0);

const capacityGuardEnabled = computed(() => !isEdit.value && !hasQueryPrefill.value);

const prefillBusy = computed(() =>
  Object.values(fieldLoading).some(Boolean)
);

const formProcessBusy = computed(() =>
  prefillBusy.value ||
  (capacityGuardEnabled.value && capacityStatus.value === 'checking')
);

const capacityBlocked = computed(() =>
  ['blocked_no_plan', 'blocked_full', 'error'].includes(capacityStatus.value)
);

const showCapacityBanner = computed(() =>
  capacityGuardEnabled.value && capacityBlocked.value
);

const capacityBannerTitle = computed(() => {
  if (capacityStatus.value === 'blocked_no_plan') return 'Manpower plan required';
  if (capacityStatus.value === 'blocked_full') return 'No open vacancy';
  if (capacityStatus.value === 'error') return 'Could not verify manpower';
  return 'Manpower check';
});

const capacityBannerMessage = computed(() => {
  if (capacityStatus.value === 'blocked_no_plan') {
    return 'This position has no manpower plan yet. Create or update the plan on Manpower Overview before opening a job request so headcount stays accurate.';
  }
  if (capacityStatus.value === 'blocked_full') {
    return 'This position is already at planned headcount (no open vacancy). Increase the ideal count on Manpower Overview, or process an employee departure on Employees so a seat frees up — then create the job request.';
  }
  if (capacityStatus.value === 'error') {
    return 'We could not verify manpower vacancy for this position. Try again, or open Manpower Overview to review plans.';
  }
  return '';
});

const canSubmit = computed(() => {
  if (store.submitting || prefillBusy.value) return false;
  if (!isEdit.value && capacityGuardEnabled.value) {
    if (capacityStatus.value === 'checking' || capacityBlocked.value) return false;
  }
  return true;
});

const clearFieldLoading = () => {
  Object.keys(fieldLoading).forEach((key) => {
    fieldLoading[key] = false;
  });
};

const resetCapacityState = () => {
  capacityStatus.value = 'idle';
  remainingVacancy.value = 0;
  capacityPlanCount.value = 0;
};

const ensureManpowerPlansLoaded = async () => {
  if (plansLoadedOnce) return;
  if (plansStore.plans.length > 0) {
    plansLoadedOnce = true;
    return;
  }
  if (plansLoadPromise) return plansLoadPromise;
  plansLoadPromise = plansStore.getPlans()
    .then(() => {
      plansLoadedOnce = true;
    })
    .catch((err) => {
      plansLoadPromise = null;
      throw err;
    });
  return plansLoadPromise;
};

const evaluateCapacityForPosition = async (positionId) => {
  if (!capacityGuardEnabled.value) {
    resetCapacityState();
    return;
  }
  if (!positionId) {
    resetCapacityState();
    return;
  }

  const seq = ++capacityReqSeq;
  capacityStatus.value = 'checking';

  try {
    await ensureManpowerPlansLoaded();
    if (seq !== capacityReqSeq) return;

    const matched = plansStore.plans.filter(
      (p) => String(plansStore.positionIdOf(p)) === String(positionId)
    );
    const vacancy = matched.reduce((sum, p) => sum + plansStore.vacancyOf(p), 0);
    capacityPlanCount.value = matched.length;
    remainingVacancy.value = vacancy;

    if (matched.length === 0) {
      capacityStatus.value = 'blocked_no_plan';
    } else if (vacancy <= 0) {
      capacityStatus.value = 'blocked_full';
    } else {
      capacityStatus.value = 'ok';
    }
  } catch {
    if (seq === capacityReqSeq) {
      capacityStatus.value = 'error';
      remainingVacancy.value = 0;
      capacityPlanCount.value = 0;
    }
  }
};
/** @param {'fillEmpty' | 'overwrite'} mode */
const applyRequirementsToForm = (req, { mode = 'fillEmpty' } = {}) => {
  if (!req) return;
  const overwrite = mode === 'overwrite';

  const jobType = String(req.job_type || '').trim();
  if (jobType && EMPLOYMENT_TYPES.has(jobType)) {
    if (overwrite || !form.employment_type) {
      form.employment_type = jobType;
    }
  }

  if (req.salary_min != null && req.salary_min !== '') {
    if (overwrite || form.budget_salary_from === '') {
      form.budget_salary_from = Number(req.salary_min);
    }
  }
  if (req.salary_max != null && req.salary_max !== '') {
    if (overwrite || form.budget_salary_to === '') {
      form.budget_salary_to = Number(req.salary_max);
    }
  }

  const hint = buildRequirementNotes(req);
  if (hint && (overwrite || !form.notes)) {
    form.notes = hint;
  }
};

const fetchAndApplyRequirementsForPosition = async (positionId) => {
  const seq = ++requirementsReqSeq;
  fieldLoading.employment = true;
  fieldLoading.budget = true;
  fieldLoading.notes = true;
  fieldLoading.department = true;

  try {
    let deptId = resolvePositionDepartmentId(positionId);
    if (deptId && seq === requirementsReqSeq) {
      form.department_id = deptId;
    }

    const res = await requirementsStore.getRequirements(positionId).catch(() => null);
    if (seq !== requirementsReqSeq) return;

    const list = res?.data;
    const existing = Array.isArray(list) && list.length > 0 ? list[0] : null;
    if (existing) {
      applyRequirementsToForm(existing, { mode: 'overwrite' });
    }

    // Re-resolve after requirements (nested position.department) + positions list
    deptId = resolvePositionDepartmentId(positionId, existing);
    if (!deptId) {
      const single = await positionsStore.getPosition?.(positionId).catch(() => null);
      if (single) {
        deptId = toId(
          single.department_id ??
          single.department?.id ??
          single.department?.department_id
        );
      }
    }
    if (deptId && seq === requirementsReqSeq) {
      form.department_id = deptId;
    }
  } finally {
    if (seq === requirementsReqSeq) {
      fieldLoading.employment = false;
      fieldLoading.budget = false;
      fieldLoading.notes = false;
      fieldLoading.department = false;
    }
  }
};

watch(
  () => form.position_id,
  (positionId) => {
    if (isEdit.value || hasQueryPrefill.value) return;

    if (positionDebounceTimer) clearTimeout(positionDebounceTimer);

    if (!positionId) {
      resetCapacityState();
      return;
    }

    // Block submit immediately (even if mount is still loading)
    capacityReqSeq += 1;
    capacityStatus.value = 'checking';

    // First selection can happen before mountDone; flush after mount finishes
    if (!mountDone.value) return;

    positionDebounceTimer = setTimeout(() => {
      fetchAndApplyRequirementsForPosition(positionId);
      evaluateCapacityForPosition(positionId);
    }, MANUAL_DEBOUNCE_MS);
  }
);

onBeforeUnmount(() => {
  if (positionDebounceTimer) clearTimeout(positionDebounceTimer);
  requirementsReqSeq += 1;
  capacityReqSeq += 1;
});

// ── Validation ────────────────────────────────────────────────────────────
const validate = () => {
  if (!form.position_id) return 'Position is required.';
  if (!form.department_id) return 'Department is required.';
  if (!form.requested_count || form.requested_count < 1) return 'Requested count must be at least 1.';
  if (!form.priority) return 'Priority is required.';
  if (!form.employment_type) return 'Employment type is required.';
  if (!form.request_type) return 'Request type is required.';
  if (!form.requested_by_employee_id) return 'Please select who is requesting (Requested By).';
  return '';
};

// ── Payload Builder ───────────────────────────────────────────────────────────
const buildPayload = () => {
  const p = {
    position_id: Number(form.position_id),
    department_id: Number(form.department_id),
    requested_by_employee_id: Number(form.requested_by_employee_id),
    requested_count: form.requested_count,
    priority: form.priority,
    employment_type: form.employment_type,
    request_type: form.request_type,
  };
  if (form.branch_id) p.branch_id = Number(form.branch_id);
  if (form.needed_before) p.needed_before = form.needed_before;
  if (form.budget_salary_from !== '' && form.budget_salary_from != null) {
    p.budget_salary_from = form.budget_salary_from;
  }
  if (form.budget_salary_to !== '' && form.budget_salary_to != null) {
    p.budget_salary_to = form.budget_salary_to;
  }
  if (form.reason) p.reason = form.reason;
  if (form.notes) p.notes = form.notes;
  if (form.replacement_for_employee_id) {
    p.replacement_for_employee_id = Number(form.replacement_for_employee_id);
  }
  return p;
};

// ── Submit ────────────────────────────────────────────────────────────────
const handleSave = async () => {
  if (!isEdit.value && capacityGuardEnabled.value && (capacityBlocked.value || capacityStatus.value === 'checking')) {
    validationError.value = capacityBannerMessage.value || 'Manpower vacancy must be available before creating a request.';
    return;
  }

  validationError.value = validate();
  if (validationError.value) return;

  const payload = buildPayload();
  if (isEdit.value) {
    await store.updateRequest(route.params.id, payload);
  } else {
    await store.createRequest(payload);
  }
  router.push({ name: 'recruitment-job-requests' });
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  const fromManpower = hasQueryPrefill.value;
  const queryDeptId = toId(route.query.department_id);
  const queryBranchId = toId(route.query.branch_id);

  if (fromManpower) {
    fieldLoading.position = true;
    fieldLoading.count = true;
    fieldLoading.requestType = true;
    if (queryDeptId) fieldLoading.department = true;
    if (queryBranchId) fieldLoading.branch = true;
    fieldLoading.employment = true;
    fieldLoading.budget = true;
    fieldLoading.notes = true;

    // Immediate query values (no network needed)
    form.position_id = toId(prefillPosition.value.id);
    form.requested_count = Number(route.query.vacancy) || 1;
    form.request_type = 'expansion';
    if (queryDeptId) form.department_id = queryDeptId;
    if (queryBranchId) form.branch_id = queryBranchId;

    fieldLoading.count = false;
    fieldLoading.requestType = false;
  }

  const dropdownPromise = Promise.all([
    positionsStore.getPositions(),
    deptsStore.getDepartments(),
    reservationStore.fetchBranches?.() || Promise.resolve(),
    employeesStore.getEmployees?.() || Promise.resolve(),
  ]);

  const requirementsPromise = fromManpower
    ? requirementsStore.getRequirements(prefillPosition.value.id).catch(() => null)
    : Promise.resolve(null);

  const [, requirementsRes] = await Promise.all([dropdownPromise, requirementsPromise]);

  if (fromManpower) {
    // Ensure selects show matched options after lists load
    form.position_id = toId(prefillPosition.value.id);
    if (queryDeptId) {
      form.department_id = queryDeptId;
    } else {
      form.department_id =
        resolvePositionDepartmentId(form.position_id, requirementsRes?.data?.[0]) ||
        form.department_id;
    }
    if (queryBranchId) form.branch_id = queryBranchId;

    const list = requirementsRes?.data;
    const existing = Array.isArray(list) && list.length > 0 ? list[0] : null;
    applyRequirementsToForm(existing, { mode: 'fillEmpty' });

    fieldLoading.position = false;
    fieldLoading.department = false;
    fieldLoading.branch = false;
    fieldLoading.employment = false;
    fieldLoading.budget = false;
    fieldLoading.notes = false;
  }

  // Load existing for edit
  if (isEdit.value) {
    const req = await store.fetchRequest(route.params.id);
    if (req) {
      Object.assign(form, {
        position_id: toId(req.position?.id ?? req.position_id),
        department_id: toId(req.department?.id ?? req.department_id),
        branch_id: toId(req.branch?.id ?? req.branch_id),
        requested_count: req.requested_count ?? 1,
        priority: req.priority ?? 'medium',
        employment_type: req.employment_type ?? '',
        request_type: req.request_type ?? '',
        needed_before: req.needed_before ?? '',
        budget_salary_from: req.budget_salary_from ?? '',
        budget_salary_to: req.budget_salary_to ?? '',
        reason: req.reason ?? '',
        notes: req.notes ?? '',
        requested_by_employee_id: toId(req.requested_by_employee?.id ?? req.requested_by_employee_id),
        replacement_for_employee_id: toId(req.replacement_for_employee?.id ?? req.replacement_for_employee_id),
      });
    }
    clearFieldLoading();
  }

  mountDone.value = true;

  // If Position was selected before mount finished, Path B/C never ran — flush now
  if (!isEdit.value && !hasQueryPrefill.value && form.position_id) {
    fetchAndApplyRequirementsForPosition(form.position_id);
    evaluateCapacityForPosition(form.position_id);
  }
});
</script>
