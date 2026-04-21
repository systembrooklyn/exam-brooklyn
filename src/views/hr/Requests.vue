<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employee Requests</h1>
        <p class="text-gray-500 mt-1">Manage leave, overtime, and shift changes</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="canAccessPendingQueue"
          type="button"
          @click="pendingQueueMode = !pendingQueueMode"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors cursor-pointer"
          :class="pendingQueueMode ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600'"
        >
          {{ pendingQueueMode ? 'Show all my requests' : 'Show all pending requests' }}
        </button>
        <button
          v-if="showBulkSelectionColumn"
          type="button"
          :disabled="
            selectedRequestIds.length === 0 ||
            !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) ||
            store.loading
          "
          class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          :class="
            selectedRequestIds.length > 0 &&
            authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) &&
            !store.loading
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          "
          @click="confirmBulkApprove"
        >
          Bulk approve
        </button>
        <button
          v-if="
            authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST) ||
            authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS)
          "
          type="button"
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="text-xl">+</span> New Request
        </button>
      </div>
    </div>

    <div class="mb-4">
      <div class="relative max-w-md">
        <LucideSearch
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          placeholder="Search by employee name or fingerprint..."
          class="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
    </div>

    <!-- Profile Missing Error -->
    <div v-if="profileError" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6">
        <div class="flex items-center gap-3">
            <LucideAlertTriangle class="w-5 h-5 flex-shrink-0" />
            <div>
                <p class="font-bold">Personal Profile Not Found</p>
                <p class="text-sm opacity-90">To view your requests or create new ones, you must first have an employee record linked to your user account. Please contact your HR administrator.</p>
            </div>
        </div>
    </div>

    <div
      v-if="showBulkSelectionColumn && pendingSelectableIds.length"
      class="flex flex-wrap items-center gap-2 mb-3"
    >
      <label
        class="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700"
        :class="{ 'opacity-50 cursor-not-allowed': !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) }"
      >
        <input
          ref="selectAllCheckboxRef"
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          :checked="allPendingSelected"
          :disabled="!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)"
          @change="toggleSelectAllPending"
        />
        <span>Select all</span>
      </label>
      <span class="text-xs text-gray-500">({{ pendingSelectableIds.length }} pending)</span>
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredRequests"
      :loading="store.loading"
      :emptyMessage="emptyMessage"
      :hasActions="false"
      :hasDelete="false"
      :hasEdit="false"
      @edit="null"
    >
      <template #select="{ item }">
        <div v-if="item.status === 'pending'" class="flex justify-center">
          <input
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            :checked="isBulkSelected(item.id)"
            :disabled="!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)"
            @change="toggleBulkSelect(item.id)"
          />
        </div>
      </template>
      <template #employee="{ item }">
        <span class="text-gray-800 font-medium">{{ employeeDisplayName(item) }}</span>
      </template>
      <template #request_type="{ item }">
        <span class="text-gray-800 ">{{ formatRequestTypeLabel(item.request_type) }}</span>
      </template>
      <template #day="{ item }">
        <span class="text-gray-800">{{ formatDate(item.day) }}</span>
      </template>
      <template #duration="{ item }">
        <span class="text-gray-700">{{ formatDuration(item) }}</span>
      </template>
      <template #overtime_minutes="{ item }">
        <span
          v-if="
            ['overtime', 'overtime_before', 'overtime_after'].includes(item.request_type) &&
            item.overtime_minutes != null &&
            item.overtime_minutes !== ''
          "
          class="text-gray-800 font-medium tabular-nums"
        >
          {{ Number(item.overtime_minutes) }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #is_paid="{ item }">
        <span
          class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
          :class="isPaidYes(item) ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'"
        >
          {{ isPaidYes(item) ? 'Paid' : 'Unpaid' }}
        </span>
      </template>
      <template #created_at="{ item }">
        <span class="text-gray-700">{{ formatDate(item.created_at) }}</span>
      </template>
      <template #action_by="{ item }">
        <span class="text-gray-700">{{ actionByDisplay(item) }}</span>
      </template>
      <template #status="{ item }">
        <span
          class="px-2 py-0.5 rounded-full text-xs font-semibold"
          :class="{
            'bg-yellow-100 text-yellow-800': item.status === 'pending',
            'bg-green-100 text-green-800': item.status === 'approved',
            'bg-red-100 text-red-800': item.status === 'rejected'
          }"
        >
          {{ statusLabel(item.status) }}
        </span>
      </template>
      <template #actions="{ item }">
        <div v-if="item.status === 'pending'" class="flex flex-wrap gap-2 justify-center items-center">
          <button
            v-if="authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST)"
            type="button"
            title="Edit"
            class="text-blue-600 hover:text-blue-800 p-1 cursor-pointer transition-transform hover:scale-125"
            @click="openEditModal(item)"
          >
            <LucidePencil class="w-6 h-6" />
          </button>
          <button
            v-if="authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)"
            type="button"
            title="Approve"
            class="text-green-600 hover:text-green-800 p-1 cursor-pointer transition-transform hover:scale-125"
            @click="confirmApprove(item.id)"
          >
            <LucideCheckCircle class="w-6 h-6" />
          </button>
          <button
            v-if="authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)"
            type="button"
            title="Reject"
            class="text-red-600 hover:text-red-800 p-1 cursor-pointer transition-transform hover:scale-125"
            @click="confirmReject(item.id)"
          >
            <LucideXCircle class="w-6 h-6" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <!-- Create / Edit Request Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Request' : 'Create New Request'"
      :loading="store.loading"
      @close="closeRequestModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <template v-if="!isEditing">
          <div
            v-if="showCreateTargetTabs"
            class="flex p-1 bg-gray-100 rounded-xl gap-1"
          >
            <button
              type="button"
              class="flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer"
              :class="
                createRequestTarget === 'self'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:bg-gray-200/50'
              "
              @click="setCreateTargetSelf"
            >
              For myself
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer"
              :class="
                createRequestTarget === 'other'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:bg-gray-200/50'
              "
              @click="setCreateTargetOther"
            >
              For another employee
            </button>
          </div>
          <p
            v-else-if="canCreateRequestForOthers && !canCreateEmployeeRequest"
            class="text-sm text-gray-600"
          >
            Creating a request on behalf of another employee.
          </p>
        </template>

        <div v-if="!isEditing && createRequestTarget === 'other'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            v-model="forOtherEmployeeId"
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select employee…</option>
            <option
              v-for="emp in employeesListForPicker"
              :key="emp.id"
              :value="String(emp.id)"
            >
              {{ employeePickerLabel(emp) }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select v-model="form.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="lateness">Lateness</option>
            <option value="leave">Leave</option>
            <option value="overtime">Overtime (total)</option>
            <option value="overtime_before">Overtime (before shift)</option>
            <option value="overtime_after">Overtime (after shift)</option>
            <option value="vacation">Vacation</option>
            <option value="day_off_swap">Day Off Swap</option>
            <option value="work_from_home">Work From Home</option>
            <option value="shift_move">Shift Move</option>
            <option value="absence">Absence</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              v-model="form.day"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <p
              v-if="isServerCalculatedOvertime(form.request_type)"
              class="mt-1 text-xs text-gray-500"
            >
              Overtime (total or before/after shift): only the date is sent — minutes are calculated on the server from shift and punches.
            </p>
          </div>

          <!-- Conditional: Duration Hours (Lateness/Leave) -->
          <div v-if="['lateness', 'leave'].includes(form.request_type)" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
            <input v-model="form.duration_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 2" />
          </div>

          <!-- Conditional: Day Replacement (Day Off Swap) -->
          <div v-if="form.request_type === 'day_off_swap'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
            <input v-model="form.day_replacement" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Type (Vacation) -->
          <div v-if="form.request_type === 'vacation'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
            <select v-model="form.duration_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
                <option value="full">Full Day</option>
                <option value="half">Half Day</option>
            </select>
          </div>

          <!-- From/To Time — not used for absence or server-calculated overtime -->
          <template
            v-if="form.request_type !== 'absence' && !isServerCalculatedOvertime(form.request_type)"
          >
            <div class="col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">From Time</label>
              <input
                v-model="form.from_time"
                type="time"
                step="1"
                class="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
              <input
                v-model="form.to_time"
                type="time"
                step="1"
                class="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </template>
        </div>
      </div>
    </HrModal>

    <!-- Confirmation Modals -->
    <SweetAlert2Modal
      v-if="showConfirmApprove"
      title="Approve Request?"
      text="Are you sure you want to approve this request?"
      icon="question"
      confirmButtonText="Yes, Approve"
      confirmButtonClass="bg-emerald-600 hover:bg-emerald-700"
      @confirm="handleApprove"
      @cancel="showConfirmApprove = false"
    />
    <SweetAlert2Modal
      v-if="showConfirmBulkApprove"
      title="Bulk approve requests?"
      :text="bulkApproveConfirmText"
      icon="question"
      confirmButtonText="Yes, approve all"
      confirmButtonClass="bg-emerald-600 hover:bg-emerald-700"
      @confirm="handleBulkApprove"
      @cancel="showConfirmBulkApprove = false"
    />
    <!-- Rejection Modal -->
    <HrModal
      v-if="showConfirmReject"
      :show="showConfirmReject"
      title="Reject Request"
      :loading="store.loading"
      saveLabel="Reject"
      @close="showConfirmReject = false"
      @save="handleReject"
    >
      <div class="space-y-4">
        <div class="mb-4 text-gray-600">
           Are you sure you want to reject this request?
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
          <textarea 
            v-model="rejectionNote" 
            rows="4" 
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Please explain why this request is being rejected..."
          ></textarea>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useHrRequestsStore } from '@/stores/hr/requests';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import {
  LucideCheckCircle,
  LucideXCircle,
  LucideAlertTriangle,
  LucidePencil,
  LucideSearch,
} from 'lucide-vue-next';
import notyf from "@/components/global/notyf";
import formatDate from '@/components/global/FormDate';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import { normalizeApiTime } from '@/utils/normalizeApiTime';
import {
  isDayOnlyOvertimeRequestTypeSlug as isServerCalculatedOvertime,
  normalizeRequestTypeSlug,
} from '@/utils/employeeRequestApi';
import { LATENESS_GRACE_MINUTES } from '@/constants/hrLateness';

const REQUEST_TYPE_LABELS = {
  lateness: 'Lateness',
  leave: 'Leave',
  overtime: 'Overtime (total)',
  overtime_before: 'Overtime (before shift)',
  overtime_after: 'Overtime (after shift)',
  vacation: 'Vacation',
  day_off_swap: 'Day off swap',
  work_from_home: 'Work from home',
  shift_move: 'Shift move',
  absence: 'Absence',
};

const APPROVER_JOB_TITLES_NORMALIZED = new Set(['hr', 'hr manager', 'general manager']);

function pushJobTitle(out, raw) {
  if (raw == null) return;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s) out.push(s);
    return;
  }
  if (typeof raw === 'object') {
    const name = raw.title_name ?? raw.name ?? raw.title;
    if (name) out.push(String(name).trim());
  }
}

function collectJobTitleNamesFromUser(u) {
  const out = [];
  if (!u) return out;
  pushJobTitle(out, u.job_title);
  if (Array.isArray(u.job_titles)) u.job_titles.forEach((t) => pushJobTitle(out, t));
  const emp = u.employee;
  if (emp) {
    pushJobTitle(out, emp.job_title);
    if (Array.isArray(emp.job_titles)) emp.job_titles.forEach((t) => pushJobTitle(out, t));
    if (Array.isArray(emp.job_departments)) {
      emp.job_departments.forEach((jd) => {
        pushJobTitle(out, jd?.job_title);
        if (jd?.job_title && typeof jd.job_title === 'object') {
          pushJobTitle(out, jd.job_title.title_name ?? jd.job_title.name);
        }
      });
    }
  }
  return out;
}

function normalizeJobTitleKey(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

function jobTitleIsApprover(name) {
  return APPROVER_JOB_TITLES_NORMALIZED.has(normalizeJobTitleKey(name));
}

const CELL_TEXT = 'text-base text-gray-800';
const CELL_CENTER = `${CELL_TEXT} text-center whitespace-nowrap`;
const CELL_CENTER_WIDE = `${CELL_CENTER} min-w-[140px]`;

const authStore = useAuthStore();
const store = useHrRequestsStore();
const empStore = useHrEmployeesStore();
const requests = computed(() => store.requests);

const searchQuery = ref('');

const normalizedSearchQuery = computed(() =>
  String(searchQuery.value ?? '')
    .toLowerCase()
    .trim(),
);

const filteredRequests = computed(() => {
  const list = requests.value;
  const q = normalizedSearchQuery.value;
  if (!q) return list;
  return list.filter((item) => {
    const name = String(item.employee?.name ?? '')
      .toLowerCase()
      .trim();
    const fp = String(item.employee?.fingerprint ?? '').trim();
    return name.includes(q) || fp.toLowerCase().includes(q);
  });
});

const canCreateEmployeeRequest = computed(() =>
  authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST),
);
const canCreateRequestForOthers = computed(() =>
  authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS),
);
/** Both permissions: show two tabs in create modal. */
const showCreateTargetTabs = computed(
  () => canCreateEmployeeRequest.value && canCreateRequestForOthers.value,
);

const createRequestTarget = ref('self');
const forOtherEmployeeId = ref('');

const employeesListForPicker = computed(() => empStore.employees || []);

function employeePickerLabel(emp) {
  if (!emp) return '';
  const pi = emp.personal_info || {};
  const name =
    [pi.first_name, pi.last_name].filter(Boolean).join(' ').trim() ||
    (emp.name ? String(emp.name).trim() : '') ||
    `Employee #${emp.id}`;
  return name;
}

async function ensureEmployeesForPicker() {
  if (!canCreateRequestForOthers.value) return;
  if (employeesListForPicker.value.length > 0) return;
  try {
    await empStore.getEmployees();
  } catch {
    /* store already notified */
  }
}

function setCreateTargetSelf() {
  createRequestTarget.value = 'self';
  forOtherEmployeeId.value = '';
}

function setCreateTargetOther() {
  createRequestTarget.value = 'other';
  void ensureEmployeesForPicker();
}

/** Hide Actions column unless user may approve, reject, or update pending requests. */
const canShowRequestActionsColumn = computed(
  () =>
    authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) ||
    authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST),
);

const canUpdateEmployeeRequest = computed(() =>
  authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST),
);

/** Pending queue toggle + `/pending` API — requires `view-pending-requests` (admin bypasses via `can`). */
const canAccessPendingQueue = computed(() =>
  authStore.can(HR_PERMISSION.VIEW_PENDING_REQUESTS),
);

const pendingQueueMode = ref(false);

/** Same visibility as pending toggle: bulk checkboxes + button only in pending list view. */
const showBulkSelectionColumn = computed(
  () => canAccessPendingQueue.value && pendingQueueMode.value,
);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const profileError = ref(false);

const showConfirmApprove = ref(false);
const showConfirmBulkApprove = ref(false);
const showConfirmReject = ref(false);
const targetId = ref(null);
const rejectionNote = ref('');
/** Pending-queue bulk selection (numeric ids). */
const selectedRequestIds = ref([]);
const selectAllCheckboxRef = ref(null);

const emptyMessage = computed(() => {
  const hasRows = requests.value.length > 0;
  if (normalizedSearchQuery.value && hasRows && filteredRequests.value.length === 0) {
    return 'No requests match your search.';
  }
  if (canAccessPendingQueue.value && pendingQueueMode.value) {
    return 'No pending requests.';
  }
  return 'You have no requests yet.';
});

const form = ref({
  request_type: 'leave',
  day: '',
  duration_hours: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full'
});

function formatRequestTypeLabel(type) {
  const t = normalizeRequestTypeSlug(type);
  if (!t) return '—';
  return REQUEST_TYPE_LABELS[t] ?? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(item) {
  const t = item.request_type;
  if (t === 'overtime_before' || t === 'overtime_after') {
    return '—';
  }
  if (t === 'overtime') {
    return '—';
  }
  if ((t === 'vacation' || t === 'work_from_home') && item.duration_type) {
    return item.duration_type === 'full' ? 'Full day' : 'Half day';
  }
  if (['lateness', 'leave'].includes(t) && item.duration_hours != null && item.duration_hours !== '') {
    const h = Number(item.duration_hours);
    if (!Number.isNaN(h)) return `${h}h`;
  }
  if (t === 'day_off_swap' && item.day_replacement) {
    return `Swap → ${formatDate(item.day_replacement)}`;
  }
  if (item.from_time && item.to_time) {
    return `${item.from_time} – ${item.to_time}`;
  }
  if (item.from_time || item.to_time) {
    return String(item.from_time || item.to_time);
  }
  return '—';
}

function isPaidYes(item) {
  const v = item.is_paid;
  return v === 1 || v === true || v === '1';
}

function employeeDisplayName(item) {
  const n = item.employee?.name;
  const name = n == null || String(n).trim() === '' ? '—' : String(n).trim();
  const fp = item.employee?.fingerprint;
  if (fp == null || fp === '') return name;
  const fpStr = String(fp).trim();
  if (!fpStr) return name;
  return `${name} (${fpStr})`;
}

function actionByDisplay(item) {
  const n = item.action_by?.name;
  if (n == null || String(n).trim() === '') return '—';
  return String(n).trim();
}

function statusLabel(status) {
  const map = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return map[status] ?? (status ? String(status).replace(/_/g, ' ') : '—');
}

const headers = computed(() => {
  const baseHeaders = [];

  if (showBulkSelectionColumn.value) {
    baseHeaders.push({
      label: '',
      key: 'select',
      class: `${CELL_CENTER} w-12`,
    });
  }

  baseHeaders.push(
    { label: 'Employee', key: 'employee', class: CELL_CENTER_WIDE },
    { label: 'Type', key: 'request_type', class: CELL_CENTER },
    { label: 'Date', key: 'day', class: CELL_CENTER },
    { label: 'Duration', key: 'duration', class: CELL_CENTER },
    { label: 'OT (min)', key: 'overtime_minutes', class: CELL_CENTER },
    { label: 'Paid', key: 'is_paid', class: CELL_CENTER },
    { label: 'Submitted', key: 'created_at', class: CELL_CENTER },
    { label: 'Reviewed by', key: 'action_by', class: CELL_CENTER_WIDE },
    { label: 'Status', key: 'status', class: CELL_CENTER },
  );

  if (
    (canShowRequestActionsColumn.value || canUpdateEmployeeRequest.value) &&
    (pendingQueueMode.value || requests.value.some((r) => r.status === 'pending'))
  ) {
    baseHeaders.push({ label: 'Actions', key: 'actions', class: `${CELL_CENTER} min-w-[8rem]` });
  }

  return baseHeaders;
});

const bulkApproveConfirmText = computed(() => {
  const n = selectedRequestIds.value.length;
  if (n === 0) return 'No requests selected.';
  return `Approve ${n} selected request${n === 1 ? '' : 's'}?`;
});

function clearBulkSelection() {
  selectedRequestIds.value = [];
}

function normalizeRequestId(raw) {
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function isBulkSelected(rawId) {
  const id = normalizeRequestId(rawId);
  if (id == null) return false;
  return selectedRequestIds.value.includes(id);
}

function toggleBulkSelect(rawId) {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  const id = normalizeRequestId(rawId);
  if (id == null) return;
  const idx = selectedRequestIds.value.indexOf(id);
  if (idx >= 0) selectedRequestIds.value.splice(idx, 1);
  else selectedRequestIds.value.push(id);
}

/** Pending rows in the current list (bulk targets). */
const pendingSelectableIds = computed(() => {
  const out = [];
  for (const r of filteredRequests.value) {
    if (r.status !== 'pending') continue;
    const id = normalizeRequestId(r.id);
    if (id != null) out.push(id);
  }
  return out;
});

const allPendingSelected = computed(() => {
  const ids = pendingSelectableIds.value;
  if (!ids.length) return false;
  return ids.every((id) => selectedRequestIds.value.includes(id));
});

const somePendingSelected = computed(() => {
  const ids = pendingSelectableIds.value;
  if (!ids.length) return false;
  const n = ids.filter((id) => selectedRequestIds.value.includes(id)).length;
  return n > 0 && n < ids.length;
});

function toggleSelectAllPending() {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  const ids = pendingSelectableIds.value;
  if (!ids.length) return;
  if (allPendingSelected.value) {
    const remove = new Set(ids);
    selectedRequestIds.value = selectedRequestIds.value.filter((id) => !remove.has(id));
  } else {
    selectedRequestIds.value = [...new Set([...selectedRequestIds.value, ...ids])];
  }
}

async function syncSelectAllIndeterminate() {
  await nextTick();
  const el = selectAllCheckboxRef.value;
  if (el && 'indeterminate' in el) {
    el.indeterminate = somePendingSelected.value;
  }
}

watch([somePendingSelected, allPendingSelected, pendingSelectableIds], syncSelectAllIndeterminate, {
  flush: 'post',
});

const fetchData = async () => {
  clearBulkSelection();
  profileError.value = false;
  try {
    if (canAccessPendingQueue.value && pendingQueueMode.value) {
      store.setListSource("pending");
      await store.getPendingRequests();
    } else {
      store.setListSource("me");
      await store.getMyRequests();
    }
  } catch (e) {
    if (e.response?.status === 404 && e.response?.data?.message?.includes('profile')) {
      profileError.value = true;
    }
  }
};

onMounted(fetchData);
watch(pendingQueueMode, fetchData);

watch(canAccessPendingQueue, (ok) => {
  if (!ok && pendingQueueMode.value) {
    pendingQueueMode.value = false;
    fetchData();
  }
});

watch(requests, (list) => {
  const valid = new Set(
    list.map((r) => normalizeRequestId(r.id)).filter((id) => id != null),
  );
  selectedRequestIds.value = selectedRequestIds.value.filter((id) => valid.has(id));
});

watch(
  () => form.value.request_type,
  (t) => {
    if (t === 'absence') {
      form.value.from_time = '';
      form.value.to_time = '';
    }
    if (isServerCalculatedOvertime(t)) {
      form.value.from_time = '';
      form.value.to_time = '';
    }
  },
);

function toDateInputValue(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function closeRequestModal() {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
  createRequestTarget.value = 'self';
  forOtherEmployeeId.value = '';
}

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  forOtherEmployeeId.value = '';
  if (canCreateEmployeeRequest.value) {
    createRequestTarget.value = 'self';
  } else if (canCreateRequestForOthers.value) {
    createRequestTarget.value = 'other';
    void ensureEmployeesForPicker();
  } else {
    createRequestTarget.value = 'self';
  }
  form.value = {
    request_type: 'leave',
    day: '',
    duration_hours: null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full',
  };
  showModal.value = true;
};

const openEditModal = (item) => {
  if (!authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST)) return;
  if (item.status !== 'pending') return;
  const id = normalizeRequestId(item.id);
  if (id == null) return;
  isEditing.value = true;
  editingId.value = id;
  form.value = {
    request_type: item.request_type || 'leave',
    day: toDateInputValue(item.day),
    duration_hours:
      item.duration_hours != null && item.duration_hours !== ''
        ? Number(item.duration_hours)
        : null,
    from_time: item.from_time ? normalizeApiTime(item.from_time) || '' : '',
    to_time: item.to_time ? normalizeApiTime(item.to_time) || '' : '',
    day_replacement: toDateInputValue(item.day_replacement),
    duration_type: item.duration_type === 'half' ? 'half' : 'full',
  };
  showModal.value = true;
};

/** When creating for another employee, require `employee_id` on the payload. */
function attachEmployeeIdIfCreatingForOther(payload) {
  if (isEditing.value) return payload;
  if (createRequestTarget.value !== 'other') return payload;
  if (!authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS)) return payload;
  const eid = normalizeRequestId(forOtherEmployeeId.value);
  if (eid == null) {
    notyf.error('Please select an employee.');
    return null;
  }
  return { ...payload, employee_id: eid };
}

/**
 * Same shape as POST create — used for both create and PUT update.
 * @returns {object|null}
 */
function buildRequestPayloadFromForm() {
  if (!form.value.day) {
    notyf.error('Please select a date');
    return null;
  }

  const otRt = normalizeRequestTypeSlug(form.value.request_type);
  if (isServerCalculatedOvertime(otRt)) {
    const base = {
      request_type: otRt,
      day: form.value.day,
    };
    return attachEmployeeIdIfCreatingForOther(base);
  }

  if (form.value.request_type === 'absence') {
    const base = {
      request_type: 'absence',
      day: form.value.day,
    };
    return attachEmployeeIdIfCreatingForOther(base);
  }

  const normalizedFromTime = normalizeApiTime(form.value.from_time);
  const normalizedToTime = normalizeApiTime(form.value.to_time);
  if (form.value.from_time && !normalizedFromTime) {
    notyf.error('From time format is invalid.');
    return null;
  }
  if (form.value.to_time && !normalizedToTime) {
    notyf.error('To time format is invalid.');
    return null;
  }

  const payload = {
    request_type: form.value.request_type,
    day: form.value.day,
    from_time: normalizedFromTime,
    to_time: normalizedToTime,
  };

  if (['lateness', 'leave'].includes(form.value.request_type)) {
    if (!form.value.duration_hours) {
      notyf.error('Duration hours is required for this request type');
      return null;
    }
    if (form.value.request_type === 'lateness') {
      const lateMins = Math.round(Number(form.value.duration_hours) * 60);
      if (
        Number.isFinite(lateMins) &&
        lateMins > 0 &&
        lateMins <= LATENESS_GRACE_MINUTES
      ) {
        notyf.error(
          `Lateness of ${LATENESS_GRACE_MINUTES} minutes or less is covered by the grace period. A request is not allowed.`,
        );
        return null;
      }
    }
    payload.duration_hours = parseInt(form.value.duration_hours, 10);
  }

  if (form.value.request_type === 'day_off_swap') {
    if (!form.value.day_replacement) {
      notyf.error('Replacement date is required for day off swap');
      return null;
    }
    payload.day_replacement = form.value.day_replacement;
  }

  if (form.value.request_type === 'vacation') {
    payload.duration_type = form.value.duration_type;
  }

  return attachEmployeeIdIfCreatingForOther(payload);
}

const handleSubmit = async () => {
  if (isEditing.value) {
    if (!authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST)) return;
    if (editingId.value == null) return;
  } else {
    if (createRequestTarget.value === 'self') {
      if (!canCreateEmployeeRequest.value) return;
    } else {
      if (!canCreateRequestForOthers.value) return;
    }
  }

  const payload = buildRequestPayloadFromForm();
  if (!payload) return;

  try {
    if (isEditing.value) {
      await store.updateRequest(editingId.value, payload);
    } else {
      await store.createRequest(payload);
      await fetchData();
    }
    closeRequestModal();
  } catch (e) {
    console.error('Submission failed:', e);
  }
};

const confirmApprove = (id) => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  targetId.value = id;
  showConfirmApprove.value = true;
};

const handleApprove = async () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) {
    showConfirmApprove.value = false;
    return;
  }
  try {
    await store.approveRequest(targetId.value);
    const tid = normalizeRequestId(targetId.value);
    if (tid != null) {
      const i = selectedRequestIds.value.indexOf(tid);
      if (i >= 0) selectedRequestIds.value.splice(i, 1);
    }
  } catch (e) {
    console.error("Approval failed:", e);
  } finally {
    showConfirmApprove.value = false;
  }
};

const confirmBulkApprove = () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  if (selectedRequestIds.value.length === 0) return;
  showConfirmBulkApprove.value = true;
};

const handleBulkApprove = async () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) {
    showConfirmBulkApprove.value = false;
    return;
  }
  if (selectedRequestIds.value.length === 0) {
    showConfirmBulkApprove.value = false;
    return;
  }
  try {
    await store.bulkApproveRequests([...selectedRequestIds.value]);
    clearBulkSelection();
  } catch (e) {
    console.error("Bulk approval failed:", e);
  } finally {
    showConfirmBulkApprove.value = false;
  }
};

const confirmReject = (id) => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) return;
  targetId.value = id;
  rejectionNote.value = '';
  showConfirmReject.value = true;
};

const handleReject = async () => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) {
    showConfirmReject.value = false;
    return;
  }
  try {
    await store.rejectRequest(targetId.value, rejectionNote.value);
    showConfirmReject.value = false;
  } catch (e) {
    console.error("Rejection failed:", e);
  }
};
</script>
