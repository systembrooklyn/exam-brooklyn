<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex justify-between w-full">
          <div >
          <h1 class="text-2xl font-bold text-gray-800">Attendance Logs</h1>
          <p class="text-gray-500 mt-1">Track employee clock-in/out and breaks</p>
          </div>
          
            <div class="flex gap-2">
        <button
          @click="openReportModal"
          class="bg-sky-600 hover:bg-sky-700 text-white px-3  rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideFileText class="w-4 h-4" /> Monthly Report
        </button>
        <button
          @click="openUploadModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-3  rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideUpload class="w-4 h-4" /> Bulk Upload
        </button>
        <button
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3  rounded-lg flex items-center gap-2 transition-colors"
        >
          <span class="text-xl">+</span> Add Log
        </button>
      </div>
        </div>
        
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
          <button @click="fetchLogs" class="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors" title="Reload Logs">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>
      </div>

    
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="attendanceLogs"
      :loading="store.loading"
      emptyMessage="No attendance logs found."
      :hasDelete="false"
      @edit="openEditModal"
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

    <!-- Report Drawer -->
    <Transition name="drawer">
      <div v-if="showReportModal" class="fixed inset-0 z-50 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="closeReportModal"></div>
        
        <!-- Drawer -->
        <div class="absolute right-0 top-0 h-full w-full md:w-[800px] bg-white shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div class="text-white">
              <h2 class="text-2xl font-bold">Monthly Attendance Report</h2>
              <p class="text-indigo-100 text-sm mt-1">View detailed attendance breakdown</p>
            </div>
            <button @click="closeReportModal" class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Filter Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select v-model="reportForm.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                  <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
                    {{ emp.name || (emp.personal_info ? (emp.personal_info.first_name + ' ' + emp.personal_info.last_name) : ('Emp #' + emp.id)) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input v-model="reportForm.from_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input v-model="reportForm.to_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
              </div>
            </div>

            <!-- Generate Button -->
            <button 
              @click="handleReport"
              :disabled="store.loading"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="store.loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ store.loading ? 'Generating...' : 'Generate Report' }}
            </button>

            <!-- Report Content -->
            <div v-if="reportData" id="printable-report" class="space-y-6 animate-fade-in">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Attendance Report</h3>
                  <p class="text-sm text-gray-500">{{ reportData.period.from }} - {{ reportData.period.to }}</p>
                </div>
              </div>

              <!-- Employee Info & Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 report-summary-grid">
                <div class="p-4 rounded-xl border summary-card indigo-card">
                  <p class="text-xs font-bold uppercase mb-1">Employee</p>
                  <p class="text-sm font-bold">{{ reportData.employee.name }}</p>
                </div>
                <div class="p-4 rounded-xl border summary-card emerald-card">
                  <p class="text-xs font-bold uppercase mb-1">Present Days</p>
                  <p class="text-lg font-bold">{{ reportData.summary.present_days }}</p>
                </div>
                <div class="p-4 rounded-xl border summary-card rose-card">
                  <p class="text-xs font-bold uppercase mb-1">Absent Days</p>
                  <p class="text-lg font-bold">{{ reportData.summary.absent_days }}</p>
                </div>
                <div class="p-4 rounded-xl border summary-card amber-card">
                  <p class="text-xs font-bold uppercase mb-1">Vacation</p>
                  <p class="text-lg font-bold">{{ reportData.summary.vacation.taken_days }}/{{ reportData.summary.vacation.available_days }}</p>
                  <p class="text-xs text-amber-700 mt-1">{{ reportData.summary.vacation.remaining_days }} days remaining</p>
                </div>
              </div>

              <!-- Daily Breakdown -->
              <div class="overflow-hidden border border-gray-100 rounded-xl">
                <table class="w-full text-center">
                  <thead class="bg-gray-50">
                    <tr class="text-md">
                      <th class="p-3 font-bold border-b text-center ">Date</th>
                      <th class="p-3 font-bold border-b text-center">Status</th>
                      <th class="p-3 font-bold border-b text-center">In / Out</th>
                      <th class="p-3 font-bold border-b text-center">Break</th>
                      <th class="p-3 font-bold border-b text-center font-bold text-indigo-600">Minutes</th>
                      <th class="p-3 font-bold border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="day in reportData.days" :key="day.date" class="hover:bg-gray-50/50">
                      <td class="p-3 font-medium text-center">{{ day.date }}</td>
                      <td class="p-3 text-center">
                        <span :class="{
                          'status-present': day.status === 'present',
                          'status-absent': day.status === 'absent',
                          'status-holiday': day.status === 'holiday',
                          'status-vacation': day.status === 'vacation'
                        }" class="px-2 py-0.5 rounded-full uppercase text-[10px] font-bold status-badge-fallback">
                          {{ day.label }}
                        </span>
                      </td>
                      <td class="p-3 text-center text-gray-500">
                        <template v-if="day.attendance?.check_in">
                          {{ day.attendance.check_in.substring(0,5) }} - {{ day.attendance.check_out?.substring(0,5) || '--' }}
                        </template>
                        <span v-else>--</span>
                      </td>
                      <td class="p-3 text-center text-gray-400">
                        <template v-if="day.attendance?.break_in">
                          {{ day.attendance.break_in.substring(0,5) }} - {{ day.attendance.break_out?.substring(0,5) || '--' }}
                        </template>
                        <span v-else>--</span>
                      </td>
                      <td class="p-3 text-center font-bold text-indigo-700">
                        {{ day.attendance?.worked_minutes ? parseFloat(day.attendance.worked_minutes).toFixed(2) : 0 }} min
                      </td>
                      <td class="p-3 text-center">
                        <button 
                          @click="openRequestForDay(day.date)"
                          class="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Request
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrAttendanceStore } from '@/stores/hr/attendance';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import { LucideUpload, LucideFileText, LucideDownload } from 'lucide-vue-next';
import notyf from "@/components/global/notyf";
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
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
const reportData = ref(null);
const isDownloading = ref(false);

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

const reportForm = ref({
  employee_id: null,
  from_date: '',
  to_date: ''
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
    console.log("View: Submitting form. isEditing:", isEditing.value, "Data:", form.value);
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

const closeReportModal = () => {
  showReportModal.value = false;
};

const openReportModal = () => {
  reportForm.value = { employee_id: null, from_date: '', to_date: '' };
  reportData.value = null;
  showReportModal.value = true;
};

console.log(reportData.value);



const handleReport = async () => {
  console.log("Generating Report for:", reportForm.value);
  if (!reportForm.value.employee_id || !reportForm.value.from_date || !reportForm.value.to_date) {
    notyf.error('Please fill in all criteria');
    return;
  }
  try {
    const payload = {
      employee_id: parseInt(reportForm.value.employee_id),
      from_date: reportForm.value.from_date,
      to_date: reportForm.value.to_date
    };
    console.log("Payload being sent to API:", payload);
    const data = await store.generateMonthlyReport(payload);
    reportData.value = data.data; // Note: accessing the data nested object from response
    notyf.success('Report generated');
  } catch (e) { 
    console.error("Report Generation Failed:", e); 
  }
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

const downloadPDF = async () => {
  console.log("Download PDF button clicked");
  isDownloading.value = true;
  
  try {
    const element = document.getElementById('printable-report');
    if (!element) throw new Error("Printable element not found");

    const opt = {
      margin:       [10, 10, 10, 10], // top, left, bottom, right
      filename:     `Attendance_Report_${reportData.value.employee.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: true,
        letterRendering: true,
        windowWidth: element.clientWidth
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    console.log("Invoking html2pdf...");
    // Use worker to have more control
    await html2pdf().set(opt).from(element).save();
    console.log("PDF download complete");
    notyf.success('PDF Downloaded');
  } catch (err) {
    console.error("PDF Download Failed:", err);
    notyf.error("Download failed. Check console.");
  } finally {
    isDownloading.value = false;
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

.summary-card { padding: 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb !important; }
.indigo-card { background-color: #eef2ff !important; color: #4338ca !important; border-color: #e0e7ff !important; }
.emerald-card { background-color: #ecfdf5 !important; color: #047857 !important; border-color: #d1fae5 !important; }
.rose-card { background-color: #fff1f2 !important; color: #be123c !important; border-color: #ffe4e6 !important; }
.amber-card { background-color: #fffbeb !important; color: #b45309 !important; border-color: #fef3c7 !important; }

/* Status Badges Fallbacks */
.status-badge-fallback { 
    display: inline-block;
    padding: 2px 8px; 
    border-radius: 999px; 
    font-size: 10px; 
    font-weight: bold; 
    text-transform: uppercase;
}
.status-present { background-color: #d1fae5 !important; color: #065f46 !important; }
.status-absent { background-color: #fee2e2 !important; color: #991b1b !important; }
.status-holiday { background-color: #dbeafe !important; color: #1e40af !important; }
.status-vacation { background-color: #fef3c7 !important; color: #92400e !important; }

/* Table overrides */
#printable-report table { width: 100%; border-collapse: collapse; }
#printable-report thead { background-color: #f9fafb !important; }
#printable-report th { 
    padding: 12px; 
    text-align: left; 
    color: #374151 !important; 
    border-bottom: 2px solid #e5e7eb !important; 
    font-size: 11px;
}
#printable-report td { 
    padding: 12px; 
    border-bottom: 1px solid #f3f4f6 !important; 
    color: #4b5563 !important; 
    font-size: 11px;
}

/* Drawer Animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}

.drawer-enter-to > div:last-child,
.drawer-leave-from > div:last-child {
  transform: translateX(0);
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
