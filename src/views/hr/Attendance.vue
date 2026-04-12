<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Attendance Logs</h1>
        <p class="text-gray-500 mt-1">Track employee clock-in/out and breaks</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Quick Filters -->
        <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-indigo-200">
          <template v-if="authStore.isAdminUser">
            <div class="flex flex-col px-2 min-w-[120px]">
              <label class="text-[10px] uppercase font-bold text-gray-400">Employee</label>
              <select v-model="filterForm.employee_id" class="bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none p-0 h-5" @change="fetchLogs">
                <option value="">All Employees</option>
                <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
                  {{ emp.name || (emp.personal_info ? (emp.personal_info.first_name + ' ' + emp.personal_info.last_name) : ('Emp #' + emp.id)) }}
                </option>
              </select>
            </div>
            <div class="w-px h-8 bg-gray-200 mx-1"></div>
          </template>
          <div class="flex flex-col px-2 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
            <div class="relative">
              <input
                v-model="filterPayrollMonth"
                type="month"
                class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                @change="applyFilterMonth"
              />
              <LucideCalendar class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p v-if="filterPayrollMonth" class="text-xs text-gray-400 mt-1">
              Period: {{ getPayrollDates(filterPayrollMonth).from_date }} — {{ getPayrollDates(filterPayrollMonth).to_date }}
            </p>
          </div>
          <button 
            @click="fetchLogs" 
            class="p-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            :class="store.loading ? 'text-indigo-400' : 'text-indigo-600 bg-indigo-50'"
            title="Reload Logs"
          >
             <svg class="w-4 h-4" :class="{'animate-spin': store.loading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>

        <button
          v-if="authStore.isAdminUser"
          @click="openReportModal"
          class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ml-2"
        >
          <LucideFileText class="w-4 h-4" /> Monthly Report
        </button>
        <button
          v-if="authStore.isAdminUser"
          @click="openUploadModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LucideUpload class="w-4 h-4" /> Bulk Upload
        </button>
        <button
          v-if="authStore.isAdminUser"
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="text-xl leading-none">+</span> Add Log
        </button>
      </div>
    </div>

    
    <!-- Table -->
    <HrDataTable
      :headers="tableHeaders"
      :items="attendanceLogs"
      :loading="store.loading"
      emptyMessage="No attendance logs found."
      :hasEdit="authStore.isAdminUser"
      :hasDelete="authStore.isAdminUser"
      @edit="openEditModal"
      @delete="confirmDelete"
    >
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
    <AttendanceLogsModal
      :show="showModal"
      :isEditing="isEditing"
      :loading="store.loading"
      :initialForm="form"
      :employees="employeeStore.employees"
      @close="closeModal"
      @save="handleSubmit"
    />

    <BulkUploadModal
      :show="showUploadModal"
      :loading="store.loading"
      :templateUrl="bulkUploadTemplate"
      @close="closeUploadModal"
      @upload="handleUpload"
    />

    <AttendanceReportDrawer 
      ref="reportDrawerRef"
      :show="showReportModal" 
      @close="showReportModal = false"
      @request-for-day="openRequestForDay"
    />

    <AttendanceRequestModal
      :show="showRequestModal"
      :loading="requestLoading"
      :initialForm="requestForm"
      @close="showRequestModal = false"
      @save="handleRequestSubmit"
    />

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This attendance log will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrAttendanceStore } from '@/stores/hr/attendance';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import AttendanceReportDrawer from '@/components/hr-dashboard/AttendanceReportDrawer.vue';
import AttendanceLogsModal from '@/components/hr-dashboard/attendance/AttendanceLogsModal.vue';
import BulkUploadModal from '@/components/hr-dashboard/attendance/BulkUploadModal.vue';
import AttendanceRequestModal from '@/components/hr-dashboard/attendance/AttendanceRequestModal.vue';
import { LucideUpload, LucideFileText, LucideCalendar } from 'lucide-vue-next';
import bulkUploadTemplate from '@/assets/BulkUploadTest.csv?url';
import notyf from '@/components/global/notyf';
import { getPayrollDates, defaultPayrollMonthRange } from '@/utils/payrollPeriod';

const store = useHrAttendanceStore();
const employeeStore = useHrEmployeesStore();
const authStore = useAuthStore();

const attendanceLogs = computed(() => store.attendanceLogs);

/** When the auth user JSON has no employee id, we match this user to a payroll employee row (same list as HR Employees). */
const resolvedPayrollEmployeeId = ref("");

/** Query params sent to attendance-logs API (non-admins are always scoped to their employee id). */
const attendanceQueryParams = computed(() => {
  const { from_date, to_date, employee_id } = filterForm.value;
  if (authStore.isAdminUser) {
    return { from_date, to_date, employee_id };
  }
  const eid =
    authStore.payrollEmployeeId || resolvedPayrollEmployeeId.value || "";
  return {
    from_date,
    to_date,
    employee_id: eid,
  };
});

const effectiveNonAdminEmployeeId = computed(
  () => authStore.payrollEmployeeId || resolvedPayrollEmployeeId.value || "",
);

async function resolvePayrollEmployeeFromDirectory() {
  resolvedPayrollEmployeeId.value = "";
  if (authStore.isAdminUser || authStore.payrollEmployeeId) return;

  try {
    await employeeStore.getEmployees();
    const u = authStore.user;
    if (!u) return;

    const uid = u.id;
    const email = String(u.email || "").trim().toLowerCase();
    const list = employeeStore.employees || [];

    const match = list.find((emp) => {
      const linkedUserId = emp.user?.id ?? emp.user_id;
      if (uid != null && linkedUserId != null && String(linkedUserId) === String(uid)) {
        return true;
      }
      const empEmail = String(
        emp.user?.email || emp.email || emp.personal_info?.email || "",
      )
        .trim()
        .toLowerCase();
      return email.length > 0 && empEmail === email;
    });

    if (match?.id != null) {
      resolvedPayrollEmployeeId.value = String(match.id).trim();
    }
  } catch (e) {
    console.warn("Attendance: could not resolve employee from directory", e);
  }
}

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
  if (authStore.isAdminUser) {
    return [{ label: 'Employee', key: 'employee' }, ...row];
  }
  return row;
});

const fetchLogs = async () => {
  try {
    if (!authStore.isAdminUser && !effectiveNonAdminEmployeeId.value) {
      notyf.error('Your account is not linked to an employee record.');
      return;
    }
    await store.getAttendanceLogs(attendanceQueryParams.value);
  } catch (e) {
    console.error("View: Failed to fetch logs:", e);
  }
};

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.getUserByToken();
  }
  if (authStore.isAdminUser) {
    await Promise.all([employeeStore.getEmployees(), fetchLogs()]);
  } else {
    await resolvePayrollEmployeeFromDirectory();
    await fetchLogs();
  }
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
  reportDrawerRef.value?.reset();
  showReportModal.value = true;
};

// Requests
const requestLoading = ref(false);
const requestForm = ref({
  request_type: 'leave',
  day: '',
  duration_hours: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full'
});

const openRequestForDay = (date) => {
  requestForm.value = {
    request_type: 'leave',
    day: date,
    duration_hours: null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full'
  };
  showRequestModal.value = true;
};

const handleRequestSubmit = async (payload) => {
  if (!payload.day) {
    notyf.error('Please select a date');
    return;
  }

  // Final validation before sending
  if (['lateness', 'leave'].includes(payload.request_type) && !payload.duration_hours) {
    notyf.error('Duration hours is required for this request type');
    return;
  }
  if (payload.request_type === 'day_off_swap' && !payload.day_replacement) {
    notyf.error('Replacement date is required for day off swap');
    return;
  }

  requestLoading.value = true;
  try {
    const { useHrRequestsStore } = await import('@/stores/hr/requests');
    const requestsStore = useHrRequestsStore();
    await requestsStore.createRequest(payload);
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
  #printable-report, #printable-report * {
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
