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
    <div
      v-if="prefillPosition && !isEdit"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3"
    >
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

    <!-- Form Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

      <!-- Row 1: Position + Department -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Position <span class="text-red-500">*</span></label>
          <select
            v-model="form.position_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            :disabled="!!prefillPosition && !isEdit"
          >
            <option value="">Select position...</option>
            <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Department <span class="text-red-500">*</span></label>
          <select
            v-model="form.department_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select department...</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.department_name || d.name }}</option>
          </select>
        </div>
      </div>

      <!-- Row 2: Branch + Requested Count -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Branch <span class="text-xs text-gray-400">(optional)</span></label>
          <select
            v-model="form.branch_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">All branches / not specific</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Requested Count <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.requested_count"
            type="number"
            min="1"
            placeholder="e.g. 2"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Row 2b: Requested By Employee -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Requested By <span class="text-red-500">*</span></label>
          <select
            v-model="form.requested_by_employee_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select employee...</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ employeeName(emp) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Replacement For <span class="text-xs text-gray-400">(if replacement)</span></label>
          <select
            v-model="form.replacement_for_employee_id"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">None / Not a replacement</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ employeeName(emp) }}</option>
          </select>
        </div>
      </div>

      <!-- Row 3: Priority + Employment Type -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Priority <span class="text-red-500">*</span></label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="p in PRIORITIES"
              :key="p.value"
              type="button"
              @click="form.priority = p.value"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
              :class="form.priority === p.value ? p.activeCls : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Employment Type <span class="text-red-500">*</span></label>
          <select
            v-model="form.employment_type"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select type...</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <!-- Row 4: Request Type + Needed Before -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Request Type <span class="text-red-500">*</span></label>
          <select
            v-model="form.request_type"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select type...</option>
            <option value="replacement">Replacement</option>
            <option value="expansion">Expansion</option>
            <option value="temporary">Temporary</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Needed Before <span class="text-xs text-gray-400">(optional)</span></label>
          <input
            v-model="form.needed_before"
            type="date"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Row 5: Budget Range -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Budget From <span class="text-xs text-gray-400">(optional)</span></label>
          <input
            v-model.number="form.budget_salary_from"
            type="number"
            min="0"
            placeholder="e.g. 5000"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Budget To <span class="text-xs text-gray-400">(optional)</span></label>
          <input
            v-model.number="form.budget_salary_to"
            type="number"
            min="0"
            placeholder="e.g. 8000"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Row 6: Reason -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Reason <span class="text-xs text-gray-400">(optional)</span></label>
        <textarea
          v-model="form.reason"
          rows="3"
          placeholder="Why is this position needed?"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      <!-- Row 7: Notes -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Notes <span class="text-xs text-gray-400">(optional)</span></label>
        <textarea
          v-model="form.notes"
          rows="2"
          placeholder="Additional notes for HR..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      <!-- Validation Error -->
      <p v-if="validationError" class="text-sm text-red-500 flex items-center gap-1.5">
        <AlertTriangle class="w-4 h-4" /> {{ validationError }}
      </p>

      <!-- Submit Buttons -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          @click="$router.back()"
          class="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="store.submitting"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <span v-if="store.submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          {{ isEdit ? 'Save Changes' : 'Create Request' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next';
import { useJobRequestsStore } from '@/stores/recruitment/jobRequestsStore';
import { useHrPositionsStore } from '@/stores/hr/positions';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useReservationStore } from '@/stores/reservations';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';

const route  = useRoute();
const router = useRouter();

const store           = useJobRequestsStore();
const positionsStore  = useHrPositionsStore();
const deptsStore      = useHrDepartmentsStore();
const reservationStore = useReservationStore();
const employeesStore  = useHrEmployeesStore();
const authStore       = useAuthStore();

// ── Mode ──────────────────────────────────────────────────────────────────
const isEdit = computed(() => !!route.params.id);

// ── Pre-fill from ManpowerOverview via query params ───────────────────────
// ManpowerOverview will navigate:
//   router.push({ name: 'recruitment-job-request-create',
//                 query: { position_id: row.position.id, position_name: row.position.name, department_id: row.deptId, vacancy: row.vacancy } })
const prefillPosition = computed(() =>
  route.query.position_id
    ? { id: Number(route.query.position_id), name: route.query.position_name }
    : null
);

// ── Dropdowns ─────────────────────────────────────────────────────────────
const positions   = computed(() => positionsStore.positions);
const departments = computed(() => deptsStore.departments);
const branches    = computed(() => reservationStore.branches);
const employees   = computed(() => employeesStore.employees);

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  const name = joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
  const fp = emp?.fingerprint ?? emp?.fingerPrint ?? pi?.fingerprint ?? pi?.fingerPrint ?? emp?.user?.fingerPrint;
  return fp ? `${name} (${fp})` : name;
};

// ── Priority Options ──────────────────────────────────────────────────────
const PRIORITIES = [
  { value: 'low',    label: 'Low',    activeCls: 'bg-blue-50 border-blue-300 text-blue-700' },
  { value: 'medium', label: 'Medium', activeCls: 'bg-amber-50 border-amber-300 text-amber-700' },
  { value: 'high',   label: 'High',   activeCls: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: 'urgent', label: 'Urgent', activeCls: 'bg-red-50 border-red-400 text-red-700' },
];

// ── Form State ────────────────────────────────────────────────────────────
const form = reactive({
  position_id:                   '',
  department_id:                 '',
  branch_id:                     '',
  requested_count:               1,
  priority:                      'medium',
  employment_type:               '',
  request_type:                  '',
  needed_before:                 '',
  budget_salary_from:            '',
  budget_salary_to:              '',
  reason:                        '',
  notes:                         '',
  requested_by_employee_id:      '',
  replacement_for_employee_id:   '',
});

const validationError = ref('');

// ── Validation ────────────────────────────────────────────────────────────
const validate = () => {
  if (!form.position_id)    return 'Position is required.';
  if (!form.department_id)  return 'Department is required.';
  if (!form.requested_count || form.requested_count < 1) return 'Requested count must be at least 1.';
  if (!form.priority)       return 'Priority is required.';
  if (!form.employment_type) return 'Employment type is required.';
  if (!form.request_type)   return 'Request type is required.';
  if (!form.requested_by_employee_id) return 'Please select who is requesting (Requested By).';
  return '';
};

// ── Payload Builder ───────────────────────────────────────────────────────────
const buildPayload = () => {
  const p = {
    position_id:                form.position_id,
    department_id:              form.department_id,
    requested_by_employee_id:   form.requested_by_employee_id,
    requested_count:            form.requested_count,
    priority:                   form.priority,
    employment_type:            form.employment_type,
    request_type:               form.request_type,
  };
  if (form.branch_id)                       p.branch_id                     = form.branch_id;
  if (form.needed_before)                   p.needed_before                 = form.needed_before;
  if (form.budget_salary_from)              p.budget_salary_from            = form.budget_salary_from;
  if (form.budget_salary_to)                p.budget_salary_to              = form.budget_salary_to;
  if (form.reason)                          p.reason                        = form.reason;
  if (form.notes)                           p.notes                         = form.notes;
  if (form.replacement_for_employee_id)     p.replacement_for_employee_id   = form.replacement_for_employee_id;
  return p;
};

// ── Submit ────────────────────────────────────────────────────────────────
const handleSave = async () => {
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
  await Promise.all([
    positionsStore.getPositions(),
    deptsStore.getDepartments(),
    reservationStore.fetchBranches?.() || Promise.resolve(),
    employeesStore.getEmployees?.() || Promise.resolve(),
  ]);

  // Pre-fill from manpower query
  if (prefillPosition.value) {
    form.position_id   = prefillPosition.value.id;
    form.department_id = Number(route.query.department_id) || '';
    form.requested_count = Number(route.query.vacancy) || 1;
    form.request_type  = 'expansion';
  }

  // Load existing for edit
  if (isEdit.value) {
    const req = await store.fetchRequest(route.params.id);
    if (req) {
      Object.assign(form, {
        position_id:                    req.position?.id  ?? req.position_id  ?? '',
        department_id:                  req.department?.id ?? req.department_id ?? '',
        branch_id:                      req.branch?.id    ?? req.branch_id    ?? '',
        requested_count:                req.requested_count ?? 1,
        priority:                       req.priority ?? 'medium',
        employment_type:                req.employment_type ?? '',
        request_type:                   req.request_type ?? '',
        needed_before:                  req.needed_before ?? '',
        budget_salary_from:             req.budget_salary_from ?? '',
        budget_salary_to:               req.budget_salary_to   ?? '',
        reason:                         req.reason ?? '',
        notes:                          req.notes  ?? '',
        requested_by_employee_id:       req.requested_by_employee?.id ?? req.requested_by_employee_id ?? '',
        replacement_for_employee_id:    req.replacement_for_employee?.id ?? req.replacement_for_employee_id ?? '',
      });
    }
  }
});
</script>
