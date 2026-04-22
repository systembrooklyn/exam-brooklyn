<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div v-if="!authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
      You do not have permission to view attendance logs.
    </div>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Attendance Logs</h1>
          <p class="text-gray-500 mt-1">Track employee clock-in/out and breaks</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Quick Filters -->
          <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-indigo-200">
            <template v-if="authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)">
              <div ref="employeeDropdownRootRef" class="relative flex flex-col px-2 min-w-[140px]">
                <label class="text-[10px] uppercase font-bold text-gray-400">Employee</label>
                <button
                  type="button"
                  class="flex items-center justify-between gap-1 bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none p-0 min-h-[1.25rem] text-left w-full cursor-pointer"
                  :aria-expanded="employeeDropdownOpen"
                  aria-haspopup="listbox"
                  @click="toggleEmployeeDropdown"
                >
                  <span class="truncate">{{ selectedEmployeeTriggerLabel }}</span>
                  <LucideChevronDown
                    class="w-4 h-4 flex-shrink-0 text-gray-500 transition-transform"
                    :class="{ 'rotate-180': employeeDropdownOpen }"
                  />
                </button>
                <div
                  v-show="employeeDropdownOpen"
                  class="absolute left-0 top-full z-50 mt-1 w-[min(100vw-2rem,280px)] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  role="listbox"
                  @mousedown.prevent
                >
                  <div class="px-2 pb-1.5 pt-1 border-b border-gray-100">
                    <input
                      ref="employeeSelectSearchInputRef"
                      v-model="employeeSelectSearchQuery"
                      type="search"
                      autocomplete="off"
                      placeholder="Search name or fingerprint..."
                      class="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      @keydown.escape.prevent="closeEmployeeDropdown"
                    />
                  </div>
                  <ul class="max-h-56 overflow-y-auto text-sm">
                    <li>
                      <button
                        type="button"
                        role="option"
                        class="w-full px-3 py-2 text-left hover:bg-indigo-50 cursor-pointer"
                        :class="{
                          'bg-indigo-50 font-medium text-indigo-800':
                            filterForm.employee_id === '' || filterForm.employee_id == null,
                        }"
                        @click="selectEmployeeFilter('')"
                      >
                        All Employees
                      </button>
                    </li>
                    <li v-for="emp in filteredEmployeesForSelect" :key="emp.id">
                      <button
                        type="button"
                        role="option"
                        class="w-full px-3 py-2 text-left hover:bg-indigo-50 cursor-pointer"
                        :class="{
                          'bg-indigo-50 font-medium text-indigo-800':
                            String(filterForm.employee_id) === String(emp.id),
                        }"
                        @click="selectEmployeeFilter(emp.id)"
                      >
                        <span>{{ employeeRowLabel(emp) }}</span>
                        <span
                          v-if="pickEmployeeFingerprint(emp)"
                          class="text-xs text-gray-500"
                        >
                          ({{ pickEmployeeFingerprint(emp) }})
                        </span>
                      </button>
                    </li>
                    <li
                      v-if="filteredEmployeesForSelect.length === 0"
                      class="px-3 py-2 text-gray-400 text-xs"
                    >
                      No employees match.
                    </li>
                  </ul>
                </div>
              </div>
              <div class="w-px h-8 bg-gray-200 mx-1"></div>
            </template>
            <div class="flex flex-col px-2 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
              <div class="relative">
                <input v-model="filterPayrollMonth" type="month"
                  class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  @change="applyFilterMonth" />
                <LucideCalendar
                  class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="filterPayrollMonth" class="text-xs text-gray-400 mt-1">
                Period: {{ getPayrollDates(filterPayrollMonth).from_date }} — {{
                  getPayrollDates(filterPayrollMonth).to_date }}
              </p>
            </div>
            <button @click="fetchLogs" class="p-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              :class="store.loading ? 'text-indigo-400' : 'text-indigo-600 bg-indigo-50'" title="Reload Logs">
              <svg class="w-4 h-4" :class="{ 'animate-spin': store.loading }" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <button v-if="authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)" @click="openReportModal"
            class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ml-2">
            <LucideFileText class="w-4 h-4" /> Monthly Report
          </button>
          <button v-if="authStore.can(HR_PERMISSION.BULK_UPLOAD_ATTENDANCE)" @click="openUploadModal"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <LucideUpload class="w-4 h-4" /> Bulk Upload
          </button>
          <button v-if="authStore.can(HR_PERMISSION.CREATE_ATTENDANCE_LOG)" @click="openAddModal"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <span class="text-xl leading-none">+</span> Add Log
          </button>
        </div>
      </div>


      <!-- Table -->
      <HrDataTable :headers="tableHeaders" :items="attendanceLogs" :loading="attendanceTableLoading"
        emptyMessage="No attendance logs found." :hasEdit="authStore.can(HR_PERMISSION.UPDATE_ATTENDANCE_LOG)"
        :hasDelete="authStore.can(HR_PERMISSION.DELETE_ATTENDANCE_LOG)" @edit="openEditModal" @delete="confirmDelete">
        <template #employee="{ item }">
          {{ item.employee?.name || '-' }}
        </template>
        <template #check_in="{ value }">
          {{ value ? value.substring(0, 5) : '-' }}
        </template>
        <template #check_out="{ value }">
          {{ value ? value.substring(0, 5) : '-' }}
        </template>
      </HrDataTable>

      <!-- Custom Components -->
      <AttendanceLogsModal :show="showModal" :isEditing="isEditing" :loading="store.loading" :initialForm="form"
        :employees="employeeStore.employees" @close="closeModal" @save="handleSubmit" />

      <BulkUploadModal :show="showUploadModal" :loading="store.loading" :templateUrl="bulkUploadTemplate"
        @close="closeUploadModal" @upload="handleUpload" />

      <AttendanceReportDrawer ref="reportDrawerRef" :show="showReportModal" @close="showReportModal = false"
        @request-for-day="openRequestForDay" />

      <AttendanceRequestModal :show="showRequestModal" :loading="requestLoading" :initialForm="requestForm"
        @close="showRequestModal = false" @save="handleRequestSubmit" />

      <!-- Delete Confirmation -->
      <SweetAlert2Modal v-if="showDeleteConfirm" title="Are you sure?"
        text="This attendance log will be deleted permanently." icon="warning" @confirm="handleDeleteConfirm"
        @cancel="cancelDelete" />
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useHrAttendanceStore } from '@/stores/hr/attendance';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import AttendanceReportDrawer from '@/components/hr-dashboard/AttendanceReportDrawer.vue';
import AttendanceLogsModal from '@/components/hr-dashboard/attendance/AttendanceLogsModal.vue';
import BulkUploadModal from '@/components/hr-dashboard/attendance/BulkUploadModal.vue';
import AttendanceRequestModal from '@/components/hr-dashboard/attendance/AttendanceRequestModal.vue';
import { LucideUpload, LucideFileText, LucideCalendar, LucideChevronDown } from 'lucide-vue-next';
import bulkUploadTemplate from '@/assets/BulkUploadTest.csv?url';
import notyf from '@/components/global/notyf';
import {
  isDayOnlyOvertimeRequestTypeSlug,
  normalizeRequestTypeSlug,
} from '@/utils/employeeRequestApi';
import { LATENESS_GRACE_MINUTES } from '@/constants/hrLateness';
import { getPayrollDates, defaultPayrollMonthRange } from '@/utils/payrollPeriod';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import {
  apiDurationHoursFromHoursInput,
  apiDurationHoursFromMinutes,
} from '@/utils/hrEmployeeRequestDuration';

const store = useHrAttendanceStore();
const employeeStore = useHrEmployeesStore();
const authStore = useAuthStore();

const attendanceLogs = computed(() => store.attendanceLogs);

/** Until first list fetch finishes, keep table in loading state (avoids empty flash while employees load). */
const attendanceListReady = ref(false);
const attendanceTableLoading = computed(
  () => store.loading || !attendanceListReady.value,
);

/** Query params: org-wide when admin or `view-attendance-log`; else scoped to linked payroll employee id. */
const attendanceQueryParams = computed(() => {
  const { from_date, to_date, employee_id } = filterForm.value;
  if (authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)) {
    return { from_date, to_date, employee_id };
  }
  const eid = authStore.payrollEmployeeId || "";
  return {
    from_date,
    to_date,
    employee_id: eid,
  };
});

// Modal States
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showUploadModal = ref(false);
const showReportModal = ref(false);
const showRequestModal = ref(false);
const reportDrawerRef = ref(null);

const { payrollMonth: defaultPayrollMonth, ...defaultPeriod } = defaultPayrollMonthRange();
const filterPayrollMonth = ref(defaultPayrollMonth);

const filterForm = ref({
  from_date: defaultPeriod.from_date,
  to_date: defaultPeriod.to_date,
  employee_id: ''
});

const employeeDropdownOpen = ref(false);
const employeeSelectSearchQuery = ref('');
const employeeSelectSearchInputRef = ref(null);
const employeeDropdownRootRef = ref(null);

function employeeRowLabel(emp) {
  if (!emp) return '';
  return (
    emp.name ||
    (emp.personal_info
      ? `${emp.personal_info.first_name || ''} ${emp.personal_info.last_name || ''}`.trim()
      : '') ||
    `Emp #${emp.id}`
  );
}

function pickEmployeeFingerprint(emp) {
  if (!emp) return '';
  const raw = emp.fingerprint ?? emp.personal_info?.fingerprint;
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  return s || '';
}

const filteredEmployeesForSelect = computed(() => {
  const list = employeeStore.employees || [];
  const q = String(employeeSelectSearchQuery.value ?? '')
    .toLowerCase()
    .trim();
  if (!q) return list;
  return list.filter((emp) => {
    const label = String(employeeRowLabel(emp)).toLowerCase();
    const fp = pickEmployeeFingerprint(emp).toLowerCase();
    return label.includes(q) || fp.includes(q);
  });
});

const selectedEmployeeTriggerLabel = computed(() => {
  const id = filterForm.value.employee_id;
  if (id === '' || id == null) return 'All Employees';
  const list = employeeStore.employees || [];
  const emp = list.find((e) => String(e.id) === String(id));
  return emp ? employeeRowLabel(emp) : 'All Employees';
});

function closeEmployeeDropdown() {
  employeeDropdownOpen.value = false;
}

function toggleEmployeeDropdown() {
  employeeDropdownOpen.value = !employeeDropdownOpen.value;
  if (employeeDropdownOpen.value) {
    employeeSelectSearchQuery.value = '';
    nextTick(() => {
      employeeSelectSearchInputRef.value?.focus();
    });
  }
}

function selectEmployeeFilter(rawId) {
  filterForm.value.employee_id = rawId === '' || rawId == null ? '' : rawId;
  employeeSelectSearchQuery.value = '';
  closeEmployeeDropdown();
  fetchLogs();
}

function onDocumentMousedownEmployeeDropdown(e) {
  if (!employeeDropdownOpen.value) return;
  const root = employeeDropdownRootRef.value;
  if (root && !root.contains(e.target)) {
    closeEmployeeDropdown();
  }
}

const applyFilterMonth = () => {
  if (!filterPayrollMonth.value) return;
  const { from_date, to_date } = getPayrollDates(filterPayrollMonth.value);
  filterForm.value.from_date = from_date;
  filterForm.value.to_date = to_date;
  fetchLogs();
};

const form = ref({
  employee_id: null,
  date: '',
  check_in: '',
  check_out: '',
  break_in: '',
  break_out: ''
});

const tableHeaders = computed(() => {
  const row = [
    { label: 'Date', key: 'date' },
    { label: 'Check In', key: 'check_in' },
    { label: 'Check Out', key: 'check_out' },
  ];
  if (authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)) {
    return [{ label: 'Employee', key: 'employee' }, ...row];
  }
  return row;
});

const fetchLogs = async () => {
  try {
    if (!authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)) return;
    await store.getAttendanceLogs(attendanceQueryParams.value);
  } catch (e) {
    console.error("View: Failed to fetch logs:", e);
  }
};

onMounted(async () => {
  document.addEventListener('mousedown', onDocumentMousedownEmployeeDropdown);
  if (!authStore.user && authStore.token) {
    await authStore.getUserByToken();
  }
  if (!authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)) {
    if (authStore.isAdminUser || authStore.can(HR_PERMISSION.CREATE_ATTENDANCE_LOG)) {
      await employeeStore.getEmployees();
    }
    return;
  }
  try {
    await employeeStore.getEmployees();
    await fetchLogs();
  } finally {
    attendanceListReady.value = true;
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMousedownEmployeeDropdown);
});

// Handlers
const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { employee_id: null, date: '', check_in: '', check_out: '', break_in: '', break_out: '' };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    employee_id: item.employee_id || item.employee?.id,
    date: item.date,
    check_in: item.check_in,
    check_out: item.check_out,
    break_in: item.break_in,
    break_out: item.break_out
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
};

const openUploadModal = () => { showUploadModal.value = true; };
const closeUploadModal = () => { showUploadModal.value = false; };

const handleUpload = async (file) => {
  if (!authStore.can(HR_PERMISSION.BULK_UPLOAD_ATTENDANCE)) {
    notyf.error('You do not have permission to bulk upload attendance.');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    await store.bulkUploadAttendance(formData, attendanceQueryParams.value);
    closeUploadModal();
  } catch (e) { console.error("Upload failed", e); }
};

const handleSubmit = async (formData) => {
  if (!formData.employee_id || !formData.date) {
    notyf.error('Please fill in required fields');
    return;
  }
  if (isEditing.value && !authStore.can(HR_PERMISSION.UPDATE_ATTENDANCE_LOG)) {
    notyf.error('You do not have permission to update attendance logs.');
    return;
  }
  if (!isEditing.value && !authStore.can(HR_PERMISSION.CREATE_ATTENDANCE_LOG)) {
    notyf.error('You do not have permission to create attendance logs.');
    return;
  }
  try {
    if (isEditing.value) {
      await store.updateAttendanceLog(editingId.value, formData, attendanceQueryParams.value);
    } else {
      await store.createAttendanceLog(formData, attendanceQueryParams.value);
    }
    closeModal();
  } catch (e) { console.error("Submit failed", e); }
};

const openReportModal = () => {
  if (!authStore.can(HR_PERMISSION.VIEW_ATTENDANCE_LOG)) return;
  reportDrawerRef.value?.reset();
  showReportModal.value = true;
};

// Requests
const requestLoading = ref(false);
const requestForm = ref({
  request_type: 'leave',
  day: '',
  duration_hours: null,
  duration_minutes: null,
  use_minutes_for_duration: false,
  prefill_early_leave_minutes: null,
  prefill_lateness_minutes: null,
  overtime_minutes: null,
  prefill_overtime_minutes: null,
  prefill_overtime_before_minutes: null,
  prefill_overtime_after_minutes: null,
  is_warning_hour: false,
  subject_employee_id: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full'
});

function toDateInputValue(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function resolveSubjectEmployeeIdForPayrollRequest(payload) {
  const fromPayload = payload?.subject_employee_id ?? payload?.employee_id;
  if (fromPayload != null && String(fromPayload).trim() !== '') {
    const n = Number(fromPayload);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const p = authStore.payrollEmployeeId;
  if (p != null && String(p).trim() !== '') {
    const n = Number(String(p).trim());
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function withEmployeeIdForHrPayrollApi(body, subjectEmployeeId) {
  if (!authStore.hasHrRoleOrHrPermission) return body;
  const n = Number(subjectEmployeeId);
  if (!Number.isFinite(n) || n <= 0) return body;
  return { ...body, employee_id: n };
}

const openRequestForDay = (payload) => {
  if (!authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)) {
    notyf.error('You do not have permission to create employee requests.');
    return;
  }
  const isDayPayload =
    payload && typeof payload === 'object' && payload.date != null;
  const date = isDayPayload
    ? toDateInputValue(payload.date)
    : toDateInputValue(payload);
  const early = isDayPayload ? Number(payload.early_leave_minutes) || 0 : 0;
  const late = isDayPayload ? Number(payload.lateness_minutes) || 0 : 0;
  const ot = isDayPayload ? Number(payload.overtime_minutes) || 0 : 0;
  const ob = isDayPayload ? Number(payload.overtime_before_minutes) || 0 : 0;
  const oa = isDayPayload ? Number(payload.overtime_after_minutes) || 0 : 0;
  const warnHour =
    isDayPayload &&
    (payload.is_warning_hour === true ||
      payload.is_warning_hour === 1 ||
      String(payload.is_warning_hour) === '1');
  const rowEmp =
    isDayPayload && payload.employee_id != null && String(payload.employee_id).trim() !== ''
      ? Number(payload.employee_id)
      : null;
  requestForm.value = {
    request_type: 'leave',
    day: date,
    duration_hours: null,
    duration_minutes: isDayPayload && early > 0 ? early : null,
    use_minutes_for_duration: isDayPayload,
    prefill_early_leave_minutes: isDayPayload ? early : null,
    prefill_lateness_minutes: isDayPayload ? late : null,
    overtime_minutes: null,
    prefill_overtime_minutes: isDayPayload ? ot : null,
    prefill_overtime_before_minutes: isDayPayload ? ob : null,
    prefill_overtime_after_minutes: isDayPayload ? oa : null,
    is_warning_hour: !!warnHour,
    subject_employee_id:
      rowEmp != null && Number.isFinite(rowEmp) && rowEmp > 0 ? rowEmp : null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full'
  };
  showRequestModal.value = true;
};

const handleRequestSubmit = async (payload) => {
  if (!authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)) {
    notyf.error('You do not have permission to create employee requests.');
    return;
  }
  if (!payload.day) {
    notyf.error('Please select a date');
    return;
  }

  const rt = normalizeRequestTypeSlug(payload.request_type);
  if (isDayOnlyOvertimeRequestTypeSlug(rt)) {
    requestLoading.value = true;
    try {
      const { useHrRequestsStore } = await import('@/stores/hr/requests');
      const requestsStore = useHrRequestsStore();
      await requestsStore.createRequest(
        withEmployeeIdForHrPayrollApi(
          {
            request_type: rt,
            day: payload.day,
          },
          resolveSubjectEmployeeIdForPayrollRequest(payload),
        ),
      );
      showRequestModal.value = false;
      notyf.success('Request created successfully');
    } catch (e) {
      console.error('Request submission failed:', e);
    } finally {
      requestLoading.value = false;
    }
    return;
  }

  if (['lateness', 'leave'].includes(payload.request_type)) {
    if (payload.use_minutes_for_duration) {
      const mins = Number(payload.duration_minutes);
      if (!Number.isFinite(mins) || mins <= 0) {
        notyf.error('Duration (minutes) is required for this request type');
        return;
      }
    } else if (!payload.duration_hours) {
      notyf.error('Duration hours is required for this request type');
      return;
    }
  }

  if (payload.request_type === 'lateness') {
    const wh = payload.is_warning_hour;
    if (
      wh === true ||
      wh === 1 ||
      String(wh) === '1' ||
      String(wh).toLowerCase() === 'true'
    ) {
      notyf.error(
        'Lateness does not apply on this date (adjusted hours). Choose another request type.',
      );
      return;
    }
    const lateMins = payload.use_minutes_for_duration
      ? Number(payload.duration_minutes)
      : Math.round(Number(payload.duration_hours) * 60);
    if (
      Number.isFinite(lateMins) &&
      lateMins > 0 &&
      lateMins <= LATENESS_GRACE_MINUTES
    ) {
      notyf.error(
        `Lateness of ${LATENESS_GRACE_MINUTES} minutes or less is covered by the grace period. A request is not allowed.`,
      );
      return;
    }
  }

  if (payload.request_type === 'day_off_swap' && !payload.day_replacement) {
    notyf.error('Replacement date is required for day off swap');
    return;
  }

  const body = {
    request_type: payload.request_type,
    day: payload.day,
    from_time: payload.from_time,
    to_time: payload.to_time,
    day_replacement: payload.day_replacement,
    duration_type: payload.duration_type,
  };
  if (['lateness', 'leave'].includes(payload.request_type)) {
    if (payload.use_minutes_for_duration) {
      const h = apiDurationHoursFromMinutes(payload.duration_minutes);
      if (h == null) {
        notyf.error('Duration (minutes) is required for this request type');
        return;
      }
      body.duration_hours = h;
    } else {
      const h = apiDurationHoursFromHoursInput(payload.duration_hours);
      if (h == null) {
        notyf.error('Duration hours is required for this request type');
        return;
      }
      body.duration_hours = h;
    }
  }
  requestLoading.value = true;
  try {
    const { useHrRequestsStore } = await import('@/stores/hr/requests');
    const requestsStore = useHrRequestsStore();
    await requestsStore.createRequest(
      withEmployeeIdForHrPayrollApi(body, resolveSubjectEmployeeIdForPayrollRequest(payload)),
    );
    showRequestModal.value = false;
    notyf.success('Request created successfully');
  } catch (e) {
    console.error("Request submission failed:", e);
  } finally {
    requestLoading.value = false;
  }
};

// Delete
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (!deleteId.value) return;
  if (!authStore.can(HR_PERMISSION.DELETE_ATTENDANCE_LOG)) {
    notyf.error('You do not have permission to delete attendance logs.');
    return;
  }
  try {
    await store.deleteAttendanceLog(deleteId.value, attendanceQueryParams.value);
  } catch (e) { console.error(e); }
  finally {
    showDeleteConfirm.value = false;
    deleteId.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteId.value = null;
};
</script>




<style scoped>
/* Aggressive HEX Overrides for PDF generation (Avoid oklch) */
#printable-report,
#printable-report * {
  color-scheme: light !important;
  --tw-text-opacity: 1 !important;
  --tw-bg-opacity: 1 !important;
  /* Reset common tailwind color variables to safe defaults */
  --color-gray-900: #111827 !important;
  --color-gray-500: #6b7280 !important;
  --color-indigo-600: #4f46e5 !important;
  --color-indigo-900: #1e1b4b !important;
}

#printable-report {
  background-color: #ffffff !important;
  color: #111827 !important;
  font-family: sans-serif !important;
}


@media print {
  body * {
    visibility: hidden;
  }

  #printable-report,
  #printable-report * {
    visibility: visible;
  }

  #printable-report {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
    background: white !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
