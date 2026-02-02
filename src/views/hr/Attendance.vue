<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Attendance Logs</h1>
        <p class="text-gray-500 mt-1">Track employee clock-in/out and breaks</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="openReportModal"
          class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideFileText class="w-4 h-4" /> Monthly Report
        </button>
        <button
          @click="openUploadModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideUpload class="w-4 h-4" /> Bulk Upload
        </button>
        <button
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span class="text-xl">+</span> Add Log
        </button>
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
        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h4 class="text-sm font-bold text-blue-800 mb-2">Instructions:</h4>
          <p class="text-xs text-blue-700 leading-relaxed">
            Please upload a <strong>CSV</strong> file with the following headers and format. Ensure date is <strong>YYYY-MM-DD</strong> and time is <strong>HH:MM:SS</strong>.
          </p>
        </div>

        <!-- Format Guide -->
        <div class="overflow-x-auto border border-gray-100 rounded-lg">
          <table class="w-full text-[10px] text-left">
            <thead class="bg-gray-50 text-gray-600 font-bold">
              <tr>
                <th class="p-2 border-b">fingerprint</th>
                <th class="p-2 border-b">date</th>
                <th class="p-2 border-b">check_in</th>
                <th class="p-2 border-b">check_out</th>
                <th class="p-2 border-b">break_in</th>
                <th class="p-2 border-b">break_out</th>
              </tr>
            </thead>
            <tbody class="text-gray-500">
              <tr>
                <td class="p-2 border-b">703</td>
                <td class="p-2 border-b">2026-01-01</td>
                <td class="p-2 border-b">09:00:00</td>
                <td class="p-2 border-b">17:00:00</td>
                <td class="p-2 border-b">12:00:00</td>
                <td class="p-2 border-b">12:30:00</td>
              </tr>
            </tbody>
          </table>
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

    <HrModal
      :show="showReportModal"
      title="Generate Monthly Report"
      :loading="store.loading"
      saveLabel="Generate"
      maxWidthClass="max-w-4xl"
      @close="closeReportModal"
      @save="handleReport"
    >
      <div class="space-y-6">
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

        <!-- Report Content -->
        <div v-if="reportData" id="printable-report" class="space-y-6 animate-fade-in border-t pt-6">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Attendance Report</h3>
              <p class="text-sm text-gray-500">{{ reportData.period.from }} - {{ reportData.period.to }}</p>
            </div>
            <button 
              @click="downloadPDF" 
              :disabled="isDownloading"
              class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-all shadow-md no-print disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDownloading" class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
              <LucideDownload v-else class="w-4 h-4" /> 
              {{ isDownloading ? 'Downloading...' : 'Download PDF' }}
            </button>
          </div>

          <!-- Employee Info & Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 report-summary-grid">
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
              <p class="text-xs font-bold uppercase mb-1">Vacation Taken</p>
              <p class="text-lg font-bold">{{ reportData.summary.vacation.taken_days }}</p>
            </div>
          </div>

          <!-- Daily Breakdown -->
          <div class="overflow-hidden border border-gray-100 rounded-xl text-xs">
            <table class="w-full text-left">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-3 font-bold border-b">Date</th>
                  <th class="p-3 font-bold border-b text-center">Status</th>
                  <th class="p-3 font-bold border-b text-center">In / Out</th>
                  <th class="p-3 font-bold border-b text-center">Break</th>
                  <th class="p-3 font-bold border-b text-center font-bold text-indigo-600">Minutes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="day in reportData.days" :key="day.date" class="hover:bg-gray-50/50">
                  <td class="p-3 font-medium">{{ day.date }}</td>
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
                </tr>
              </tbody>
            </table>
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

onMounted(async () => {
  await Promise.all([
    store.getAttendanceLogs(),
    employeeStore.getEmployees()
  ]);
  console.log("Attendance View Loaded. Employees:", employeeStore.employees);
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
    await store.bulkUploadAttendance(formData);
    closeUploadModal();
  } catch (e) { console.error(e); }
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.date) {
    notyf.error('Please fill in required fields');
    return;
  }
  try {
    console.log("Submitting form. isEditing:", isEditing.value, "Data:", form.value);
    if (isEditing.value) {
      await store.updateAttendanceLog(editingId.value, form.value);
    } else {
      await store.createAttendanceLog(form.value);
    }
    closeModal();
  } catch (e) { console.error(e); }
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
