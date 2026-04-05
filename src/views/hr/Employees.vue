<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employees Directory</h1>
        <p class="text-gray-500 mt-1">Manage employee profiles and roles</p>
      </div>
      <button @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
        <span class="text-xl">+</span> Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search employees..."
        class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />

      <select v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="terminated">Terminated</option>
      </select>
    </div>

    <!-- Table -->
    <HrDataTable :headers="headers" :items="filteredEmployees" :loading="store.loading"
      emptyMessage="No employees found.">
      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-3">
          <button type="button" :disabled="editLoadingId != null"
            class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Edit" @click="openEditModal(item)">
            <Loader2 v-if="editLoadingId != null && Number(editLoadingId) === Number(item.id)"
              class="w-5 h-5 animate-spin text-blue-600" />
            <Edit v-else class="w-5 h-5" />
          </button>
          <button type="button" :disabled="editLoadingId != null"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete" @click="confirmDelete(item.id)">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </template>

      <template #fingerprint="{ item }">
        <span class="text-gray-700 font-mono text-sm tabular-nums">{{ fingerprintDisplay(item) }}</span>
      </template>

      <template #employee="{ item }">
        <div class="flex items-center gap-3 justify-center">

          <div class="text-left">
            <div class="font-medium text-gray-900">{{ item.personal_info?.first_name }} {{ item.personal_info?.last_name
              }}</div>
            <!-- <div class="text-xs text-gray-500">{{ item.email || item.personal_info?.email || '-' }}</div> -->
          </div>
        </div>
      </template>

      <template #department="{ item }">
        <span class="text-gray-700">{{ departmentDisplay(item) }}</span>
      </template>

      <template #job_title="{ item }">
        <span class="text-gray-700">{{ jobTitlesDisplay(item) }}</span>
      </template>

      <template #hiring_date="{ item }">
        {{ item.personal_info?.hiring_date || '-' }}
      </template>

      <template #status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold uppercase" :class="{
          'bg-green-100 text-green-700': item.personal_info?.status === 'active',
          'bg-gray-100 text-gray-600': item.personal_info?.status === 'inactive',
          'bg-red-100 text-red-700': item.personal_info?.status === 'terminated',
        }">
          {{ item.personal_info?.status || '-' }}
        </span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal :show="showModal" :title="isEditing ? 'Edit Employee' : 'New Employee'" :loading="modalSaving"
      maxWidthClass="max-w-4xl" @close="closeModal" @save="handleSubmit">
      <div class="space-y-4">
        <!-- Tabs Header -->
        <div class="flex p-1 bg-gray-100 rounded-xl mb-6">
          <button @click="activeTab = 'basic'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            :class="activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'">
            <svg class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Basic Info
          </button>
          <button @click="activeTab = 'status'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            :class="activeTab === 'status' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status
          </button>
          <button @click="activeTab = 'manager'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            :class="activeTab === 'manager' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Manager
          </button>
          <button @click="activeTab = 'timeline'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            :class="activeTab === 'timeline' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"
            v-if="isEditing">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </button>
        </div>

        <!-- Basic Tab -->
        <div v-if="activeTab === 'basic'" class="space-y-6">

          <!-- Personal Information Section -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span
                    class="text-red-500">*</span></label>
                <input v-model="form.first_name" type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="John" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name <span
                    class="text-red-500">*</span></label>
                <input v-model="form.last_name" type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Doe" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address <span
                    class="text-red-500">*</span></label>
                <input v-model="form.email" type="email"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="john.doe@company.com" />
              </div>
            </div>
          </div>

          <!-- Employment Details Section -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Employment Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Departments</label>
                <MultiSelect v-model="form.department_ids" :options="departments" labelKey="department_name"
                  valueKey="id" placeholder="Select Departments" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Job Titles</label>
                <MultiSelect v-model="form.job_title_ids" :options="jobTitles" labelKey="title_name" valueKey="id"
                  placeholder="Select Job Titles" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hiring Date <span
                    class="text-red-500">*</span></label>
                <input v-model="form.hiring_date" type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fingerprint ID</label>
                <input v-model="form.fingerPrint" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. 1024" />
              </div>
            </div>
          </div>
        </div>

        <!-- Status Tab -->
        <div v-if="activeTab === 'status'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div v-if="form.status === 'terminated' || form.left_at">
              <label class="block text-sm font-medium text-gray-700 mb-1">Left At</label>
              <input v-model="form.left_at" type="date"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        <!-- Manager Tab -->
        <div v-if="activeTab === 'manager'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select v-model="form.manager_id"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
              <option :value="null">None</option>
              <option v-for="manager in potentialManagers" :key="manager.id" :value="manager.id">
                {{ manager.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-2">Select the direct supervisor for this employee.</p>
          </div>
        </div>

        <!-- Timeline Tab -->
        <div v-if="activeTab === 'timeline'" class="space-y-6">
          <div v-if="loadingLinks" class="flex justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <div v-else-if="employeeLinks.length === 0" class="text-center py-8 text-gray-500">
            No assignment history found for this employee.
          </div>
          <div v-else
            class="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            <div v-for="link in employeeLinks" :key="link.id" class="relative">
              <!-- Dot -->
              <div class="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm"
                :class="link.id === employeeLinks[0].id ? 'bg-green-500' : 'bg-gray-400'">
              </div>

              <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">{{ link.start_date }}</span>
                  <span v-if="link.id === employeeLinks[0].id"
                    class="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">Current</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500 block text-[10px] uppercase font-semibold">Department</span>
                    <span class="text-gray-900 font-medium">{{ link.department?.department_name || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-[10px] uppercase font-semibold">Job Title</span>
                    <span class="text-gray-900 font-medium">{{ link.job_title?.title_name || '-' }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-gray-500 block text-[10px] uppercase font-semibold">Shift</span>
                    <span class="text-gray-900 font-medium">
                      {{ link.shift?.shift_name || '-' }}
                      <span v-if="link.shift" class="text-xs text-gray-500">
                        ({{ formatTime(link.shift.start_time) }} - {{ formatTime(link.shift.end_time) }})
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal v-if="showDeleteConfirm" title="Are you sure?" text="This employee will be deleted permanently."
      icon="warning" @confirm="handleDeleteConfirm" @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useHrJobTitlesStore } from '@/stores/hr/jobTitles';
import { useHrLinksStore } from '@/stores/hr/links';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import MultiSelect from '@/components/global/MultiSelect.vue';
import { Edit, Trash2, Loader2 } from 'lucide-vue-next';

const store = useHrEmployeesStore();
const deptStore = useHrDepartmentsStore();
const jobStore = useHrJobTitlesStore();
const linksStore = useHrLinksStore(); // Add Links Store

const employees = computed(() => store.employees);
const departments = computed(() => deptStore.departments);
const jobTitles = computed(() => jobStore.jobTitles);

// Timeline Data
const employeeLinks = ref([]);
const loadingLinks = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('basic');
/** Row id while opening edit (fetch employee + links). */
const editLoadingId = ref(null);
/** True while save/create API calls run (covers employee + links stores). */
const modalSaving = ref(false);

// Delete Confirmation
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  fingerPrint: '',
  manager_id: null,
  department_ids: [],
  job_title_ids: [],
  hiring_date: '',
  left_at: null,
  status: 'active'
});

const originalForm = ref({}); // Store original data for comparison

onMounted(async () => {
  try {
    await Promise.all([
      store.getEmployees(),
      store.getManagers(),
      deptStore.getDepartments(),
      jobStore.getJobTitles(),
    ]);
    try {
      await linksStore.getEmployeeJobDeps();
    } catch (e) {
      console.error('Error fetching job assignment links:', e);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Table Headers
const headers = [
  { label: 'Fingerprint', key: 'fingerprint' },
  { label: 'Employee', key: 'employee' },
  { label: 'Department', key: 'department' },
  { label: 'Job Title', key: 'job_title' },
  { label: 'Hired At', key: 'hiring_date' },
  { label: 'Status', key: 'status' },
];

const jobTitleNameById = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  const j = jobTitles.value.find((x) => Number(x.id) === n);
  return j?.title_name ?? null;
};

const departmentNameById = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  const d = departments.value.find((x) => Number(x.id) === n);
  return d?.department_name ?? null;
};

/** API may send flat *_id fields or only nested department / job_title objects. */
const parsePositiveInt = (raw) => {
  const n = parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const departmentIdFromAssignmentRow = (jd) =>
  parsePositiveInt(jd?.department_id ?? jd?.department?.id);

const jobTitleIdFromAssignmentRow = (jd) =>
  parsePositiveInt(jd?.job_title_id ?? jd?.job_title?.id);

const linkSortKey = (link) => link.start_date || link.hired_at || '';

/** When employee detail/list omit job_departments, use payroll links (already fetched for timeline). */
const assignmentRowsFromLinks = (employeeId) => {
  const eid = Number(employeeId);
  if (!Number.isInteger(eid) || eid <= 0) return [];
  const group = (linksStore.links || []).filter(
    (l) => Number(l.employee_id ?? l.employee?.id) === eid,
  );
  return [...group].sort((a, b) => {
    const da = linkSortKey(a);
    const db = linkSortKey(b);
    if (da !== db) return String(da).localeCompare(String(db));
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
};

const pickFingerprintFromEmployee = (emp) => {
  const v =
    emp?.user?.fingerPrint ??
    emp?.user?.finger_print ??
    emp?.personal_info?.fingerPrint ??
    emp?.personal_info?.finger_print;
  if (v === null || v === undefined || v === '') return null;
  return String(v).trim();
};

/** List API returns job_departments with nested department / job_title (same order → comma-separated). */
const pairedFromJobDepartments = (rows) => {
  const titles = [];
  const depts = [];
  for (const jd of rows) {
    const t = (
      jd.job_title?.title_name ||
      jobTitleNameById(jd.job_title_id ?? jd.job_title?.id) ||
      ''
    ).trim();
    const d = (
      jd.department?.department_name ||
      departmentNameById(jd.department_id ?? jd.department?.id) ||
      ''
    ).trim();
    titles.push(t || '-');
    depts.push(d || '-');
  }
  return {
    jobTitles: titles.join(', '),
    departments: depts.join(', '),
  };
};

const jobTitlesDisplay = (emp) => {
  const rows = emp?.job_departments;
  if (Array.isArray(rows) && rows.length > 0) {
    return pairedFromJobDepartments(rows).jobTitles;
  }
  return '-';
};

const departmentDisplay = (emp) => {
  const rows = emp?.job_departments;
  if (Array.isArray(rows) && rows.length > 0) {
    return pairedFromJobDepartments(rows).departments;
  }
  return '-';
};

const fingerprintDisplay = (emp) => pickFingerprintFromEmployee(emp) ?? '-';

const filteredEmployees = computed(() => {
  let result = employees.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(emp =>
      emp.personal_info?.first_name?.toLowerCase().includes(query) ||
      emp.personal_info?.last_name?.toLowerCase().includes(query) ||
      (emp.user?.email || emp.personal_info?.email)?.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value) {
    result = result.filter(emp => emp.personal_info?.status === statusFilter.value);
  }

  return result;
});

// Pagination handled by HrDataTable



const potentialManagers = computed(() => {
  // Use store.managers fetch from the new API
  let list = store.managers || [];
  if (editingId.value) {
    return list.filter(e => e.id !== editingId.value);
  }
  return list;
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    first_name: '',
    last_name: '',
    email: '',
    fingerPrint: '',
    manager_id: null,
    department_ids: [],
    job_title_ids: [],
    hiring_date: new Date().toISOString().slice(0, 10),
    left_at: null,
    status: 'active'
  };
  activeTab.value = 'basic';
  showModal.value = true;
};

const ensureLinksForEdit = async () => {
  if (linksStore.linksHydrated) return;
  try {
    await linksStore.getEmployeeJobDeps();
  } catch (e) {
    console.error('Error fetching assignment links for edit:', e);
  }
};

/** Edit form uses the same list row as the table (`store.employees`); payroll links only if assignments/timeline need them. */
const openEditModal = async (emp) => {
  isEditing.value = true;
  editingId.value = emp.id;
  editLoadingId.value = emp.id;

  try {
    const personal = emp.personal_info || {};
    const user = emp.user || {};

    let assignmentRows =
      Array.isArray(emp.job_departments) && emp.job_departments.length > 0
        ? [...emp.job_departments]
        : [];

    if (assignmentRows.length === 0 && linksStore.linksHydrated) {
      assignmentRows = assignmentRowsFromLinks(emp.id);
    }

    if (assignmentRows.length === 0) {
      await ensureLinksForEdit();
      assignmentRows = assignmentRowsFromLinks(emp.id);
    }

    const cleanData = {
      first_name: personal.first_name,
      last_name: personal.last_name,
      email: user.email || personal.email,
      fingerPrint: user.fingerPrint ?? personal.fingerPrint,
      manager_id:
        typeof emp.manager === 'object' && emp.manager !== null
          ? emp.manager.id
          : (emp.manager_id ?? emp.manager),

      department_ids: assignmentRows
        .map((jd) => departmentIdFromAssignmentRow(jd))
        .filter((id) => id != null),
      job_title_ids: assignmentRows
        .map((jd) => jobTitleIdFromAssignmentRow(jd))
        .filter((id) => id != null),

      hiring_date: personal.hiring_date,
      left_at: personal.left_at,
      status: personal.status,
    };

    if (cleanData.manager_id != null && cleanData.manager_id !== '') {
      cleanData.manager_id = parseInt(cleanData.manager_id, 10);
    }

    form.value = { ...cleanData };
    originalForm.value = JSON.parse(JSON.stringify(cleanData));

    activeTab.value = 'basic';
    showModal.value = true;

    void fetchEmployeeTimeline(emp.id, { skipFetch: linksStore.linksHydrated });
  } catch (error) {
    console.error('Failed to open edit employee', error);
    notyf.error('Failed to load employee');
  } finally {
    editLoadingId.value = null;
  }
};

const fetchEmployeeTimeline = async (employeeId, { skipFetch = false } = {}) => {
  loadingLinks.value = true;
  try {
    if (!skipFetch) {
      await linksStore.getEmployeeJobDeps();
    }
    const eid = Number(employeeId);
    employeeLinks.value = linksStore.links.filter(
      (l) => Number(l.employee_id ?? l.employee?.id) === eid,
    );
  } catch (e) {
    console.error(e);
  } finally {
    loadingLinks.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  // store.error = null;
};

const formatTime = (time) => {
  if (!time) return '';

  // Extract hours and minutes from "HH:MM:SS" format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const min = minutes;

  // Convert to 12-hour format
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${min} ${period}`;
};

const normalizeIdArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);
};

const validateAssignmentPairs = () => {
  const departmentIds = normalizeIdArray(form.value.department_ids);
  const jobTitleIds = normalizeIdArray(form.value.job_title_ids);

  if (departmentIds.length !== jobTitleIds.length) {
    notyf.error('Departments and job titles must have the same count.');
    return null;
  }

  return { departmentIds, jobTitleIds };
};

const handleSubmit = async () => {
  if (!form.value.first_name || !form.value.last_name || !form.value.email || !form.value.hiring_date) {
    notyf.error('Please fill in all required fields.');
    return;
  }

  let pendingCreatePairs = null;
  if (!isEditing.value) {
    pendingCreatePairs = validateAssignmentPairs();
    if (!pendingCreatePairs) return;
  }

  let editCurrentDepartmentIds = [];
  let editCurrentJobTitleIds = [];
  let editAssignmentChanged = false;
  if (isEditing.value) {
    editCurrentDepartmentIds = normalizeIdArray(form.value.department_ids);
    editCurrentJobTitleIds = normalizeIdArray(form.value.job_title_ids);
    const originalDepartmentIds = normalizeIdArray(originalForm.value.department_ids);
    const originalJobTitleIds = normalizeIdArray(originalForm.value.job_title_ids);
    editAssignmentChanged =
      JSON.stringify(editCurrentDepartmentIds) !== JSON.stringify(originalDepartmentIds) ||
      JSON.stringify(editCurrentJobTitleIds) !== JSON.stringify(originalJobTitleIds);
    if (editAssignmentChanged && editCurrentDepartmentIds.length !== editCurrentJobTitleIds.length) {
      notyf.error('Departments and job titles must have the same count.');
      return;
    }
  }

  modalSaving.value = true;
  try {
    if (isEditing.value) {
      const changes = {};
      const employeeFields = ['first_name', 'last_name', 'email', 'fingerPrint', 'manager_id', 'hiring_date', 'left_at', 'status'];

      for (const key of employeeFields) {
        if (JSON.stringify(form.value[key]) !== JSON.stringify(originalForm.value[key])) {
          if (key === 'fingerPrint' && form.value[key] === '') continue;
          changes[key] = form.value[key];
        }
      }

      let employeesListRefreshed = false;
      if (Object.keys(changes).length > 0) {
        await store.updateEmployee(editingId.value, changes);
        employeesListRefreshed = true;
      }

      if (editAssignmentChanged) {
        await linksStore.updateEmployeeJobDep(editingId.value, {
          employee_id: editingId.value,
          department_id: editCurrentDepartmentIds,
          job_title_id: editCurrentJobTitleIds,
          hired_at: form.value.hiring_date
        });
        if (!employeesListRefreshed) {
          await store.getEmployees();
        }
      }

      if (Object.keys(changes).length === 0 && !editAssignmentChanged) {
        notyf.success('No changes made.');
      }

      closeModal();
    } else {
      const assignmentPairs = pendingCreatePairs;

      const employeePayload = {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        email: form.value.email,
        fingerPrint: form.value.fingerPrint,
        manager_id: form.value.manager_id,
        hiring_date: form.value.hiring_date,
        left_at: form.value.left_at,
        status: form.value.status
      };

      const newEmployee = await store.createEmployee(employeePayload);

      if (assignmentPairs.departmentIds.length > 0) {
        const empId = newEmployee.data.id || newEmployee.id;
        await linksStore.linkEmployeeJobDep({
          employee_id: empId,
          department_id: assignmentPairs.departmentIds,
          job_title_id: assignmentPairs.jobTitleIds,
          hired_at: form.value.hiring_date
        }, { showNotification: false, refresh: true });
        notyf.success('Employee created and assigned successfully');
      }

      closeModal();
    }
  } catch (error) {
    console.error(error);
    // Stores already call handleError() before rethrowing; keep modal open to fix and retry.
  } finally {
    modalSaving.value = false;
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await store.deleteEmployee(deleteId.value);
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
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
