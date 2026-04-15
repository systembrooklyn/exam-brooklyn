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
          {{ pendingQueueMode ? 'Show all my requests' : 'Pending approvals' }}
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
          v-if="authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)"
          type="button"
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="text-xl">+</span> New Request
        </button>
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
      :items="requests"
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
        <div v-if="item.status === 'pending'" class="flex gap-2 justify-center">
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

    <!-- New Request Modal -->
    <HrModal
      :show="showModal"
      title="Create New Request"
      :loading="store.loading"
      @close="showModal = false"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select v-model="form.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="lateness">Lateness</option>
            <option value="leave">Leave</option>
            <option value="overtime">Overtime</option>
            <option value="vacation">Vacation</option>
            <option value="day_off_swap">Day Off Swap</option>
            <option value="work_from_home">Work From Home</option>
            <option value="shift_move">Shift Move</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input v-model="form.day" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
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

          <!-- From/To Time (Optional for most, usually for Overtime/Leave) -->
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
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import { LucideCheckCircle, LucideXCircle, LucideAlertTriangle } from 'lucide-vue-next';
import notyf from "@/components/global/notyf";
import formatDate from '@/components/global/FormDate';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import { normalizeApiTime } from '@/utils/normalizeApiTime';

const REQUEST_TYPE_LABELS = {
  lateness: 'Lateness',
  leave: 'Leave',
  overtime: 'Overtime',
  vacation: 'Vacation',
  day_off_swap: 'Day off swap',
  work_from_home: 'Work from home',
  shift_move: 'Shift move',
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
const CELL_LEFT = `${CELL_TEXT} text-left min-w-[140px]`;
const CELL_CENTER = `${CELL_TEXT} text-center whitespace-nowrap`;

const authStore = useAuthStore();
const store = useHrRequestsStore();
const requests = computed(() => store.requests);

/** Hide Actions column entirely unless user may approve or reject (admin passes via `can`). */
const canShowRequestActionsColumn = computed(
  () =>
    authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) ||
    authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST),
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
  if (!type) return '—';
  return REQUEST_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(item) {
  const t = item.request_type;
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
  if (n == null || String(n).trim() === '') return '—';
  return String(n).trim();
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
    { label: 'Employee', key: 'employee', class: CELL_LEFT },
    { label: 'Type', key: 'request_type', class: CELL_LEFT },
    { label: 'Date', key: 'day', class: CELL_CENTER },
    { label: 'Duration', key: 'duration', class: CELL_CENTER },
    { label: 'Paid', key: 'is_paid', class: CELL_CENTER },
    { label: 'Submitted', key: 'created_at', class: CELL_CENTER },
    { label: 'Reviewed by', key: 'action_by', class: CELL_LEFT },
    { label: 'Status', key: 'status', class: CELL_CENTER },
  );

  if (
    canShowRequestActionsColumn.value &&
    (pendingQueueMode.value || requests.value.some((r) => r.status === 'pending'))
  ) {
    baseHeaders.push({ label: 'Actions', key: 'actions', class: `${CELL_CENTER} w-28` });
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
  for (const r of requests.value) {
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

const openAddModal = () => {
  form.value = { 
    request_type: 'leave', 
    day: '', 
    duration_hours: null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full'
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!form.value.day) {
    notyf.error('Please select a date');
    return;
  }

  const normalizedFromTime = normalizeApiTime(form.value.from_time);
  const normalizedToTime = normalizeApiTime(form.value.to_time);
  if (form.value.from_time && !normalizedFromTime) {
    notyf.error('From time format is invalid.');
    return;
  }
  if (form.value.to_time && !normalizedToTime) {
    notyf.error('To time format is invalid.');
    return;
  }

  // Build clean payload based on API rules
  const payload = {
    request_type: form.value.request_type,
    day: form.value.day,
    from_time: normalizedFromTime,
    to_time: normalizedToTime,
  };

  // 1. duration_hours: required for "lateness and Leave" requests only
  if (['lateness', 'leave'].includes(form.value.request_type)) {
    if (!form.value.duration_hours) {
        notyf.error('Duration hours is required for this request type');
        return;
    }
    payload.duration_hours = parseInt(form.value.duration_hours);
  }

  // 2. day_replacement: required for "day off swap" requests only
  if (form.value.request_type === 'day_off_swap') {
    if (!form.value.day_replacement) {
        notyf.error('Replacement date is required for day off swap');
        return;
    }
    payload.day_replacement = form.value.day_replacement;
  }

  // 3. duration_type: required for "vacation" requests only
  if (form.value.request_type === 'vacation') {
    payload.duration_type = form.value.duration_type; // 'full' or 'half'
  }

  try {
    await store.createRequest(payload);
    showModal.value = false;
    await fetchData();
  } catch (e) {
    console.error("Submission failed:", e);
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
