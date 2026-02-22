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
          <div class="flex flex-col px-2 min-w-[120px]">
            <label class="text-[10px] uppercase font-bold text-gray-400">Employee</label>
            <select v-model="filterForm.employee_id" class="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 h-5" @change="fetchLogs">
              <option value="">All Employees</option>
              <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
                {{ emp.name || (emp.personal_info ? (emp.personal_info.first_name + ' ' + emp.personal_info.last_name) : ('Emp #' + emp.id)) }}
              </option>
            </select>
          </div>
          <div class="w-px h-8 bg-gray-200 mx-1"></div>
          <div class="flex flex-col px-2">
            <label class="text-[10px] uppercase font-bold text-gray-400">From</label>
            <input v-model="filterForm.from_date" type="date" class="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 h-5" @change="fetchLogs" />
          </div>
          <div class="w-px h-8 bg-gray-200 mx-1"></div>
          <div class="flex flex-col px-2">
            <label class="text-[10px] uppercase font-bold text-gray-400">To</label>
            <input v-model="filterForm.to_date" type="date" class="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 h-5" @change="fetchLogs" />
          </div>
          <button 
            @click="fetchLogs" 
            class="p-2 rounded-lg hover:bg-indigo-100 transition-colors"
            :class="store.loading ? 'text-indigo-400' : 'text-indigo-600 bg-indigo-50'"
            title="Reload Logs"
          >
             <svg class="w-4 h-4" :class="{'animate-spin': store.loading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>

        <!-- Actions -->
        <button
          @click="openReportModal"
          class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2"
        >
          <LucideFileText class="w-4 h-4" /> Monthly Report
        </button>
        <button
          @click="openUploadModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideUpload class="w-4 h-4" /> Bulk Upload
        </button>
        <button
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span class="text-xl leading-none">+</span> Add Log
        </button>
      </div>
    </div>

    
    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="attendanceLogs"
      :loading="store.loading"
      emptyMessage="No attendance logs found."
      :hasDelete="true"
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

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Attendance Log' : 'New Attendance Log'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select v-model="form.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
              {{ emp.name || (emp.personal_info ? (emp.personal_info.first_name + ' ' + emp.personal_info.last_name) : ('Emp #' + emp.id)) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input v-model="form.date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Check In</label>
          <input v-model="form.check_in" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
          <input v-model="form.check_out" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Break In</label>
          <input v-model="form.break_in" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Break Out</label>
          <input v-model="form.break_out" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
      </div>
    </HrModal>

    <!-- Import Modal -->
    <HrModal
      :show="showUploadModal"
      title="Bulk Upload Attendance"
      :loading="store.loading"
      @close="closeUploadModal"
      @save="handleUpload"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-start gap-4">
          <div>
            <h4 class="text-sm font-bold text-blue-800 mb-2">Instructions:</h4>
            <p class="text-xs text-blue-700 leading-relaxed">
              Please upload a <strong>CSV</strong> file with the following headers and format. Ensure date is <strong>YYYY-MM-DD</strong> and time is <strong>HH:MM:SS</strong>.
            </p>
          </div>
          <a 
            :href="bulkUploadTemplate" 
            download="BulkUploadTemplate.csv"
            class="flex-shrink-0 bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <LucideDownload class="w-3 h-3" /> Download Template
          </a>
        </div>

      

        <div class="relative group">
          <input 
            type="file" 
            @change="onFileChange" 
            accept=".csv" 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          />
          <div class="border-2 border-dashed border-gray-300 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 p-8 rounded-xl transition-all text-center">
            <LucideUpload class="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2" />
            <p class="text-sm font-medium text-gray-600 group-hover:text-indigo-600">
              {{ selectedFile ? selectedFile.name : 'Click or drag CSV file to upload' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">Maximum file size: 5MB</p>
          </div>
        </div>
      </div>
    </HrModal>

    <!-- Report Drawer Component -->
    <AttendanceReportDrawer 
      ref="reportDrawerRef"
      :show="showReportModal" 
      @close="showReportModal = false"
      @request-for-day="openRequestForDay"
    />

    <!-- Request Modal -->
    <HrModal
      :show="showRequestModal"
      title="Create Request"
      :loading="requestLoading"
      @close="showRequestModal = false"
      @save="handleRequestSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select v-model="requestForm.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
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
            <input v-model="requestForm.day" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Hours (Lateness/Leave) -->
          <div v-if="['lateness', 'leave'].includes(requestForm.request_type)" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
            <input v-model="requestForm.duration_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 2" />
          </div>

          <!-- Conditional: Day Replacement (Day Off Swap) -->
          <div v-if="requestForm.request_type === 'day_off_swap'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
            <input v-model="requestForm.day_replacement" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Type (Vacation) -->
          <div v-if="requestForm.request_type === 'vacation'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
            <select v-model="requestForm.duration_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
                <option value="full">Full Day</option>
                <option value="half">Half Day</option>
            </select>
          </div>

          <!-- From/To Time (Optional for most, usually for Overtime/Leave) -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">From Time</label>
            <input v-model="requestForm.from_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
            <input v-model="requestForm.to_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
        </div>
      </div>
    </HrModal>

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
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import AttendanceReportDrawer from '@/components/hr/attendance/AttendanceReportDrawer.vue';
import { LucideUpload, LucideFileText, LucideDownload } from 'lucide-vue-next';
import bulkUploadTemplate from '@/assets/BulkUploadTest.csv?url';

const store = useHrAttendanceStore();
const employeeStore = useHrEmployeesStore();

const attendanceLogs = computed(() => store.attendanceLogs);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showUploadModal = ref(false);
const showReportModal = ref(false);
const selectedFile = ref(null);
const reportDrawerRef = ref(null);


// Initialize filters with current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

const filterForm = ref({
  from_date: firstDay,
  to_date: lastDay,
  employee_id: ''
});

const form = ref({
  employee_id: null,
  date: '',
  check_in: '',
  check_out: '',
  break_in: '',
  break_out: ''
});


const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Date', key: 'date' },
  { label: 'Check In', key: 'check_in' },
  { label: 'Check Out', key: 'check_out' },
];

const fetchLogs = async () => {
  console.log("View: Fetching logs with filters:", filterForm.value);
  try {
    await store.getAttendanceLogs(filterForm.value);
  } catch (e) {
    console.error("View: Failed to fetch logs:", e);
  }
};

onMounted(async () => {
  console.log("View: Attendance Page Mounted. Loading data...");
  await Promise.all([
    fetchLogs(),
    employeeStore.getEmployees()
  ]);
  console.log("View: Initial load complete. Employees:", employeeStore.employees);
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { employee_id: null, date: '', check_in: '', check_out: '', break_in: '', break_out: '' };
  showModal.value = true;
};

const openEditModal = (item) => {
  console.log("Item being edited:", item);
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

const openUploadModal = () => {
  showUploadModal.value = true;
};

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    notyf.error('Please select a CSV file');
    return;
  }
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  try {
    await store.bulkUploadAttendance(formData, filterForm.value);
    closeUploadModal();
  } catch (e) { console.error("View: Upload failed", e); }
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.date) {
    notyf.error('Please fill in required fields');
    return;
  }
  try {
    console.log("View: Submitting form. isEditing:", isEditing.value);
    console.log("View: Payload Data:", JSON.parse(JSON.stringify(form.value)));
    
    if (isEditing.value) {
      await store.updateAttendanceLog(editingId.value, form.value, filterForm.value);
    } else {
      await store.createAttendanceLog(form.value, filterForm.value);
    }
    closeModal();
  } catch (e) { console.error("View: Submit failed", e); }
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
};

const openReportModal = () => {
  reportDrawerRef.value?.reset();
  showReportModal.value = true;
};

// Request Modal State
const showRequestModal = ref(false);
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

// Delete Actions
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await store.deleteAttendanceLog(deleteId.value, filterForm.value);
    } catch (error) {
      console.error(error);
    } finally {
      showDeleteConfirm.value = false;
      deleteId.value = null;
    }
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteId.value = null;
};

const handleRequestSubmit = async () => {
  if (!requestForm.value.day) {
    notyf.error('Please select a date');
    return;
  }

  // Build clean payload based on API rules
  const payload = {
    request_type: requestForm.value.request_type,
    day: requestForm.value.day,
    from_time: requestForm.value.from_time || null,
    to_time: requestForm.value.to_time || null,
  };

  // 1. duration_hours: required for "lateness and Leave" requests only
  if (['lateness', 'leave'].includes(requestForm.value.request_type)) {
    if (!requestForm.value.duration_hours) {
        notyf.error('Duration hours is required for this request type');
        return;
    }
    payload.duration_hours = parseInt(requestForm.value.duration_hours);
  }

  // 2. day_replacement: required for "day off swap" requests only
  if (requestForm.value.request_type === 'day_off_swap') {
    if (!requestForm.value.day_replacement) {
        notyf.error('Replacement date is required for day off swap');
        return;
    }
    payload.day_replacement = requestForm.value.day_replacement;
  }

  // 3. duration_type: required for "vacation" requests only
  if (requestForm.value.request_type === 'vacation') {
    payload.duration_type = requestForm.value.duration_type; // 'full' or 'half'
  }

  console.log("Submitting Request payload:", payload);

  requestLoading.value = true;
  try {
    // Import the requests store
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
