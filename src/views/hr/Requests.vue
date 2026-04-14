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
            <input v-model="form.from_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
            <input v-model="form.to_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
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
import { onMounted, ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useHrRequestsStore } from '@/stores/hr/requests';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import { LucideCheckCircle, LucideXCircle, LucideAlertTriangle } from 'lucide-vue-next';
import notyf from "@/components/global/notyf";
import formatDate from '@/components/global/FormDate';
import { HR_PERMISSION } from '@/constants/hrPermissions';

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
const showModal = ref(false);
const profileError = ref(false);

const showConfirmApprove = ref(false);
const showConfirmReject = ref(false);
const targetId = ref(null);
const rejectionNote = ref('');

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
  const baseHeaders = [
    { label: 'Employee', key: 'employee', class: CELL_LEFT },
    { label: 'Type', key: 'request_type', class: CELL_LEFT },
    { label: 'Date', key: 'day', class: CELL_CENTER },
    { label: 'Duration', key: 'duration', class: CELL_CENTER },
    { label: 'Paid', key: 'is_paid', class: CELL_CENTER },
    { label: 'Submitted', key: 'created_at', class: CELL_CENTER },
    { label: 'Reviewed by', key: 'action_by', class: CELL_LEFT },
    { label: 'Status', key: 'status', class: CELL_CENTER },
  ];

  if (
    canShowRequestActionsColumn.value &&
    (pendingQueueMode.value || requests.value.some((r) => r.status === 'pending'))
  ) {
    baseHeaders.push({ label: 'Actions', key: 'actions', class: `${CELL_CENTER} w-28` });
  }

  return baseHeaders;
});

const fetchData = async () => {
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

  // Build clean payload based on API rules
  const payload = {
    request_type: form.value.request_type,
    day: form.value.day,
    from_time: form.value.from_time || null,
    to_time: form.value.to_time || null,
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
  } catch (e) {
    console.error("Approval failed:", e);
  } finally {
    showConfirmApprove.value = false;
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
