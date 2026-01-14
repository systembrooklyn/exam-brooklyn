<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employees Directory</h1>
        <p class="text-gray-500 mt-1">Manage employee profiles and roles</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
        <input v-model="searchQuery" type="text" placeholder="Search employees..." class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        
         <select v-model="statusFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
        </select>
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredEmployees"
      :loading="store.loading"
      emptyMessage="No employees found."
      @edit="openEditModal"
      @delete="confirmDelete"
    >
      <template #employee="{ item }">
        <div class="flex items-center gap-3 justify-center">

            <div class="text-left">
                <div class="font-medium text-gray-900">{{ item.personal_info?.first_name }} {{ item.personal_info?.last_name }}</div>
                <!-- <div class="text-xs text-gray-500">{{ item.email || item.personal_info?.email || '-' }}</div> -->
            </div>
        </div>
      </template>



      <template #hiring_date="{ item }">
        {{ item.personal_info?.hiring_date || '-' }}
      </template>

      <template #status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
          :class="{
              'bg-green-100 text-green-700': item.personal_info?.status === 'active',
              'bg-gray-100 text-gray-600': item.personal_info?.status === 'inactive',
              'bg-red-100 text-red-700': item.personal_info?.status === 'terminated',
          }"
        >
            {{ item.personal_info?.status || '-' }}
        </span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Employee' : 'New Employee'"
      :loading="store.loading"
      maxWidthClass="max-w-4xl"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <!-- Tabs Header -->
        <div class="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button 
                @click="activeTab = 'basic'"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"
            >
                <svg class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Info
            </button>
            <button 
                @click="activeTab = 'status'"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="activeTab === 'status' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
            </button>
            <button 
                @click="activeTab = 'manager'"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="activeTab === 'manager' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manager
            </button>
            <button 
                @click="activeTab = 'timeline'"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="activeTab === 'timeline' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"
                v-if="isEditing" 
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline
            </button>
        </div>

        <!-- Basic Tab -->
        <div v-if="activeTab === 'basic'" class="space-y-6">
            
            <!-- Personal Information Section -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Personal Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                        <input v-model="form.first_name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="John" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                        <input v-model="form.last_name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Doe" />
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                        <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="john.doe@company.com" />
                    </div>
                </div>
            </div>

            <!-- Employment Details Section -->
             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Employment Details
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Departments</label>
                        <MultiSelect
                            v-model="form.department_ids"
                            :options="departments"
                            labelKey="department_name"
                            valueKey="id"
                            placeholder="Select Departments"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Job Titles</label>
                        <MultiSelect
                            v-model="form.job_title_ids"
                            :options="jobTitles"
                            labelKey="title_name"
                            valueKey="id"
                            placeholder="Select Job Titles"
                        />
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Shift Schedule</label>
                        <select v-model="form.shift_id" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                            <option :value="null">Select Shift</option>
                            <option v-for="shift in shifts" :key="shift.id" :value="shift.id">{{ shift.shift_name }}</option>
                        </select>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Hiring Date <span class="text-red-500">*</span></label>
                        <input v-model="form.hiring_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Fingerprint ID</label>
                         <input v-model="form.fingerPrint" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 1024" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Tab -->
        <div v-if="activeTab === 'status'" class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
                 <div v-if="form.status === 'terminated' || form.left_at">
                     <label class="block text-sm font-medium text-gray-700 mb-1">Left At</label>
                     <input v-model="form.left_at" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
                </div>
             </div>
        </div>

        <!-- Manager Tab -->
        <div v-if="activeTab === 'manager'" class="space-y-4">
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select v-model="form.manager_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option :value="null">None</option>
                    <option v-for="manager in potentialManagers" :key="manager.id" :value="manager.id">
                        {{ manager.personal_info?.first_name || manager.first_name }} {{ manager.personal_info?.last_name || manager.last_name }}
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
            <div v-else class="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                <div v-for="link in employeeLinks" :key="link.id" class="relative">
                    <!-- Dot -->
                    <div class="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm"
                         :class="link.id === employeeLinks[0].id ? 'bg-green-500' : 'bg-gray-400'">
                    </div>
                    
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div class="flex justify-between items-start mb-2">
                             <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">{{ link.start_date }}</span>
                             <span v-if="link.id === employeeLinks[0].id" class="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">Current</span>
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
                                <span class="text-gray-900 font-medium">{{ link.shift?.shift_name || '-' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This employee will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed ,watch} from 'vue';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useHrJobTitlesStore } from '@/stores/hr/jobTitles';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import { useHrLinksStore } from '@/stores/hr/links';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import MultiSelect from '@/components/global/MultiSelect.vue';

const store = useHrEmployeesStore();
const deptStore = useHrDepartmentsStore();
const jobStore = useHrJobTitlesStore();
const shiftStore = useHrShiftsStore();
const linksStore = useHrLinksStore(); // Add Links Store

const employees = computed(() => store.employees);
const departments = computed(() => deptStore.departments);
const jobTitles = computed(() => jobStore.jobTitles);
const shifts = computed(() => shiftStore.shifts);

// Timeline Data
const employeeLinks = ref([]);
const loadingLinks = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('basic');

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
  shift_id: null,
  hiring_date: '',
  left_at: null,
  status: 'active'
});

const originalForm = ref({}); // Store original data for comparison

onMounted(async () => {
  console.log('Employees Component Mounted - Starting Data Fetch');
  
  try {
      await Promise.all([
          store.getEmployees(),
          deptStore.getDepartments(),
          jobStore.getJobTitles(),
          shiftStore.getShifts()
      ]);
      
      console.log('Data Fetch Complete');
      console.log('Departments:', departments.value);
      console.log('Job Titles:', jobTitles.value);
      console.log('Shifts:', shifts.value);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
});

// Table Headers
const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Hired At', key: 'hiring_date' },
  { label: 'Status', key: 'status' },
];

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
    // Exclude self from manager list if editing
    if (editingId.value) {
        return employees.value.filter(e => e.id !== editingId.value);
    }
    return employees.value;
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
    shift_id: null,
    hiring_date: new Date().toISOString().slice(0, 10),
    left_at: null,
    status: 'active'
  };
  activeTab.value = 'basic';
  showModal.value = true;
};

const openEditModal = async (emp) => {
  isEditing.value = true;
  editingId.value = emp.id;
  
  // Fetch fresh data to ensure we have latest assignments (Dept, Job, Shift)
  // and log it as requested
  try {
      const fullEmployee = await store.getEmployee(emp.id);
      console.log('Fetched Employee Data for Edit:', fullEmployee);

      // Flatten nested personal_info for the form
      const personal = fullEmployee.personal_info || {};
      const user = fullEmployee.user || {};
      
      // Extract latest assignment (Dept, Job)
      let latestJobDep = {};
      if (fullEmployee.job_departments && fullEmployee.job_departments.length > 0) {
          latestJobDep = fullEmployee.job_departments[fullEmployee.job_departments.length - 1]; 
          console.log('Debug Shift - JobDep Keys:', Object.keys(latestJobDep));
          console.log('Debug Shift - JobDep Values:', latestJobDep);
      }

      // Extract latest shift from contracts
      let latestContract = {};
      if (fullEmployee.contracts && fullEmployee.contracts.length > 0) {
          // Find the active contract if possible, otherwise take the last one
          latestContract = fullEmployee.contracts.find(c => c.is_active === 1) || fullEmployee.contracts[fullEmployee.contracts.length - 1];
      }
      
      const cleanData = {
          first_name: personal.first_name,
          last_name: personal.last_name,
          email: user.email || personal.email, 
          fingerPrint: user.fingerPrint || personal.fingerPrint,
          manager_id: (typeof fullEmployee.manager === 'object' && fullEmployee.manager !== null) ? fullEmployee.manager.id : (fullEmployee.manager_id || fullEmployee.manager),
          

          // Map Assignments - Convert current single values to arrays for MultiSelect
          department_ids: fullEmployee.job_departments ? [...new Set(fullEmployee.job_departments.map(jd => parseInt(jd.department_id)))] : [],
          job_title_ids: fullEmployee.job_departments ? [...new Set(fullEmployee.job_departments.map(jd => parseInt(jd.job_title_id)))] : [],
          shift_id: latestContract.shift_id || latestJobDep.shift_id || fullEmployee.shift_id,
          
          hiring_date: personal.hiring_date,
          left_at: personal.left_at,
          status: personal.status,
      };

      // Force type conversion for IDs
      if (cleanData.shift_id) cleanData.shift_id = parseInt(cleanData.shift_id);
      if (cleanData.manager_id) cleanData.manager_id = parseInt(cleanData.manager_id);
      
      form.value = { ...cleanData };
      originalForm.value = JSON.parse(JSON.stringify(cleanData)); // Deep copy using JSON to avoid ref issues
      
      activeTab.value = 'basic';
      // Fetch links if needed
      fetchEmployeeTimeline(emp.id);

      showModal.value = true;

  } catch (error) {
      console.error("Failed to fetch employee details", error);
      notyf.error('Failed to load employee details');
  }
};

const fetchEmployeeTimeline = async (employeeId) => {
  loadingLinks.value = true;
  try {
      await linksStore.getEmployeeJobDeps(); // This fetches ALL. Ideally we filter. 
      // Since API doesn't seem to have getByEmployee based on sheet, we filter client side for now.
      employeeLinks.value = linksStore.links.filter(l => l.employee_id === employeeId);
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

const handleSubmit = async () => {
  if (!form.value.first_name || !form.value.last_name || !form.value.email || !form.value.hiring_date) {
    notyf.error('Please fill in all required fields.');
    return;
  }

  try {
    if (isEditing.value) {
      // 1. Update Employee Basic Info
      const changes = {};
      // List of fields that belong to the Employee Record directly
      const employeeFields = ['first_name', 'last_name', 'email', 'fingerPrint', 'manager_id', 'hiring_date', 'left_at', 'status'];
      
      for (const key of employeeFields) {
          // Compare with original form to send only changes
          if (JSON.stringify(form.value[key]) !== JSON.stringify(originalForm.value[key])) {
               // Map frontend key to API key if different (e.g. fingerPrint -> fingerPrint? payload says fingerPrint)
               // The payload provided by user shows 'fingerPrint', but earlier we saw 'finger_print_id' in headers
               // Let's assume form.fingerPrint is correct for payload based on user input.
               if(key === 'fingerPrint' && form.value[key] === '') continue; // Skip empty fingerprint
               changes[key] = form.value[key];
          }
      }

      if (Object.keys(changes).length > 0) {
          await store.updateEmployee(editingId.value, changes);
      }

       // 2. Check for Assignment Changes (Dept, Job, Shift)
      const assignmentChanged = 
          JSON.stringify(form.value.department_ids.sort()) !== JSON.stringify(originalForm.value.department_ids.sort()) ||
          JSON.stringify(form.value.job_title_ids.sort()) !== JSON.stringify(originalForm.value.job_title_ids.sort()) ||
          form.value.shift_id !== originalForm.value.shift_id;

      if (assignmentChanged) {
          // Iterate over selected departments and jobs to create links
          // Strategy: If M Depts and N Jobs, create M * N links? Or mapping?
          // Defaulting to Cartesian for now as it covers "User has these Roles in these Depts"
          
          const deptIds = form.value.department_ids.length ? form.value.department_ids : [null];
          const jobIds = form.value.job_title_ids.length ? form.value.job_title_ids : [null];

           // If user cleared all selections, we might not send anything or just not link.
           // However, if they selected some, we link.

           for (const dId of deptIds) {
               for (const jId of jobIds) {
                   if (dId && jId) {
                        await linksStore.linkEmployeeJobDep({
                            employee_id: editingId.value,
                            department_id: dId,
                            job_title_id: jId,
                            shift_id: form.value.shift_id,
                            hired_at: new Date().toISOString().slice(0, 10)
                        }, { showNotification: false, refresh: false });
                   }
               }
           }
           await linksStore.getEmployeeJobDeps();
           notyf.success('Assignments updated successfully');
      }
      
      if (Object.keys(changes).length === 0 && !assignmentChanged) {
          notyf.success('No changes made.');
      }

    } else {
      // 1. Create Employee
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
      
      // 2. Create Initial Assignment (Link)
      if (form.value.department_ids.length > 0 || form.value.job_title_ids.length > 0) {
           const empId = newEmployee.data.id || newEmployee.id;
           const deptIds = form.value.department_ids.length ? form.value.department_ids : [null];
           const jobIds = form.value.job_title_ids.length ? form.value.job_title_ids : [null];

           for (const dId of deptIds) {
               for (const jId of jobIds) {
                   if (dId && jId) {
                        await linksStore.linkEmployeeJobDep({
                            employee_id: empId,
                            department_id: dId,
                            job_title_id: jId,
                            shift_id: form.value.shift_id,
                            hired_at: form.value.hiring_date
                        }, { showNotification: false, refresh: false });
                   }
               }
           }
           await linksStore.getEmployeeJobDeps();
           notyf.success('Employee created and assigned successfully');
      }
    }
  } catch (error) {
     console.error(error);
  } finally {
     closeModal();
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
