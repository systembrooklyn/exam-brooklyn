<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Contracts</h1>
        <p class="text-gray-500 mt-1">Manage employee contracts and terms</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> New Contract
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
        <input v-model="searchQuery" type="text" placeholder="Search employee..." class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        
         <select v-model="typeFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Types</option>
            <option value="new">New</option>
            <option value="old">Old</option>
            <option value="hourly-online">Hourly Online</option>
        </select>

         <select v-model="statusFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Status</option>
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
        </select>
    </div>

    <!-- Error -->
    <div v-if="contractStore.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ contractStore.error }}</span>
      <button @click="contractStore.error = null" class="text-red-800 font-bold">×</button>
    </div>



    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredContracts"
      :loading="contractStore.loading"
      emptyMessage="No contracts found."
      :hasDelete="false"
      @edit="openEditModal"
    >
      <template #employee="{ item }">
        <span class="font-medium text-gray-900">
          {{ item.employee?.name || '-' }}
        </span>
      </template>

      <template #shift="{ item }">
        <span class="text-gray-600 block text-xs">
          {{ item.shift?.shift_name || '-' }}
        </span>
      </template>

      <template #fixed_monthly_salary="{ value }">
        <span class="font-mono text-gray-700">
          {{ value }}
        </span>
      </template>

      <template #is_active="{ value }">
         <span class="px-2 py-1 rounded-full text-xs font-semibold"
            :class="(value || value === 1) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
          >
           {{ (value || value === 1) ? 'Active' : 'Inactive' }}
          </span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Contract' : 'New Contract'"
      :loading="contractStore.loading"
      maxWidthClass="max-w-4xl"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <!-- Tabs Header -->
        <div class="flex border-b border-gray-200 mb-4 overflow-x-auto">
            <button 
                @click="activeTab = 'general'"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                :class="activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                General
            </button>
            <button 
                @click="activeTab = 'schedule'"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                :class="activeTab === 'schedule' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                Schedule
            </button>
            <button 
                @click="activeTab = 'salary'"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                :class="activeTab === 'salary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                Salary
            </button>
            <button 
                @click="activeTab = 'status'"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                :class="activeTab === 'status' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                Status
            </button>
        </div>

         <!-- General Tab -->
         <div v-if="activeTab === 'general'" class="space-y-6">
             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Basic Information
                </h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Employee <span class="text-red-500">*</span></label>
                         <select v-model="form.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" :disabled="isEditing">
                            <option :value="null">Select Employee</option>
                            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                                {{ emp.personal_info?.first_name }} {{ emp.personal_info?.last_name }}
                            </option>
                        </select>
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                         <select v-model="form.type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                            <option value="new">New</option>
                            <option value="old">Old</option>
                            <option value="hourly-online">Hourly Online</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Duration & Details
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Start Date <span class="text-red-500">*</span></label>
                         <input v-model="form.start_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">End Date <span class="text-red-500">*</span></label>
                         <input v-model="form.end_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                     <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea v-model="form.description" rows="3" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Enter contract details..."></textarea>
                    </div>
                </div>
            </div>
         </div>

         <!-- Schedule Tab -->
         <div v-if="activeTab === 'schedule'" class="space-y-6">
             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Shift Configuration
                </h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div class="md:col-span-2">
                         <label class="block text-sm font-medium text-gray-700 mb-1">Shift Schedule</label>
                         <select v-model="form.shift_id" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                            <option :value="null">Select Shift</option>
                            <option v-for="shift in shifts" :key="shift.id" :value="shift.id">
                                {{ shift.shift_name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Working Conditions
                </h3>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Days</label>
                         <input v-model="form.weekly_working_days" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label>
                         <input v-model="form.weekly_working_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Days Off Count</label>
                         <input v-model="form.days_off_count" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
            </div>

             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     Detailed Days Off
                </h3>
                 <div>
                    <div class="flex flex-wrap gap-2">
                        <button 
                            v-for="(day, index) in daysOfWeek" 
                            :key="index"
                            @click="toggleDayOff(index)"
                            class="px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                            :class="form.day_off.includes(index) ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-2 ring-indigo-600 ring-offset-2' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                        >
                            {{ day }}
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Click to select recurring days off for this contract.</p>
                </div>
            </div>
         </div>

         <!-- Salary Tab -->
         <div v-if="activeTab === 'salary'" class="space-y-6">
             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Compensation
                </h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Fixed Monthly Salary <span class="text-red-500">*</span></label>
                         <div class="relative">
                            <span class="absolute left-2 top-2.5 text-gray-500 text-xs">EGP</span>
                            <input v-model="form.fixed_monthly_salary" type="number" class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                         </div>
                    </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Max Hours Limit</label>
                         <input v-model="form.max_hours_limit" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div class="md:col-span-2">
                         <label class="block text-sm font-medium text-gray-700 mb-1">Other variable amounts</label>
                         <input v-model="form.other_var_amounts" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
            </div>
         </div>


         <!-- Status Tab -->
          <div v-if="activeTab === 'status'" class="space-y-4">
             <div class="flex items-center gap-3 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                        <input type="checkbox" v-model="form.is_active" class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">Contract Is Active</span>
                </label>
                <p class="text-xs text-gray-500">Only one contract should be active per employee.</p>
            </div>
         </div>

      </div>
      
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This Contract will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useHrContractsStore } from '@/stores/hr/contracts';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import { handleError } from '@/stores/handleError';

const contractStore = useHrContractsStore();
const employeeStore = useHrEmployeesStore();
const shiftStore = useHrShiftsStore();

const employees = computed(() => employeeStore.employees);
const shifts = computed(() => shiftStore.shifts);
const contracts = computed(() => contractStore.contracts);


const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');

// Table Headers
const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Type', key: 'type' },
  { label: 'Shift', key: 'shift' },
  { label: 'Start Date', key: 'start_date' },
  { label: 'End Date', key: 'end_date' },
  { label: 'Salary', key: 'fixed_monthly_salary' },
  { label: 'Active', key: 'is_active' },
];

const filteredContracts = computed(() => {
    const result = contracts.value.filter(c => {
        const empName = getEmployeeName(c.employee_id)?.toLowerCase() || '';
        const matchesSearch = empName.includes(searchQuery.value.toLowerCase());
        const matchesType = !typeFilter.value || c.type === typeFilter.value;
        
        // Handle boolean vs number 0/1 for isActive
        const isActive = c.is_active || c.is_active === 1;
        const matchesStatus = statusFilter.value === '' || isActive === statusFilter.value;

        return matchesSearch && matchesType && matchesStatus;
    });
    return result;
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 7;

const totalPages = computed(() => Math.ceil(filteredContracts.value.length / itemsPerPage));

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredContracts.value.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// Reset pagination
watch([searchQuery, typeFilter, statusFilter], () => {
    currentPage.value = 1;
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('general');

// Delete Confirmation (Assuming Contract Deletion exists, if not, this is dormant but ready)
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
    employee_id: null,
    shift_id: null,
    type: 'new',
    start_date: '',
    end_date: '',
    weekly_working_hours: 40,
    weekly_working_days: 5,
    days_off_count: 2,
    day_off: [], 
    fixed_monthly_salary: '',
    other_var_amounts: 0,
    description: '',
    is_active: true
});

onMounted(async () => {
  contractStore.getContracts();
  await employeeStore.getEmployees();
  shiftStore.getShifts();
});

const getEmployeeName = (id) => {
    const emp = employees.value.find(e => e.id === id);
    return emp?.personal_info ? `${emp.personal_info.first_name} ${emp.personal_info.last_name}` : `Emp #${id}`;
};

const toggleDayOff = (dayIndex) => {
    if (form.value.day_off.includes(dayIndex)) {
        form.value.day_off = form.value.day_off.filter(d => d !== dayIndex);
    } else {
        form.value.day_off.push(dayIndex);
    }
};

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    employee_id: null,
    shift_id: null,
    type: 'new',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    weekly_working_hours: 40,
    weekly_working_days: 5,
    days_off_count: 2,
    day_off: [5, 6], // Default Fri/Sat
    fixed_monthly_salary: '',
    other_var_amounts: 0,
    description: '',
    is_active: true
  };
  activeTab.value = 'general';
  showModal.value = true;
};

const openEditModal = async (contract) => {
  isEditing.value = true;
  editingId.value = contract.id;

  try {
    const fullContract = await contractStore.getContract(contract.id);

    // Parse day_off because it might be returned differently or valid
    form.value = { 
        ...fullContract, 
        day_off: Array.isArray(fullContract.day_off) ? fullContract.day_off : [],
        employee_id: fullContract.employee ? fullContract.employee.id : fullContract.employee_id,
        shift_id: fullContract.shift ? fullContract.shift.id : fullContract.shift_id,
        is_active: fullContract.is_active === 1 || fullContract.is_active === true
  };
  } catch (error) {
    // Fallback to table data if fetch fails
    form.value = { 
      ...contract, 
      day_off: Array.isArray(contract.day_off) ? contract.day_off : [],
      employee_id: contract.employee ? contract.employee.id : contract.employee_id,
      shift_id: contract.shift ? contract.shift.id : contract.shift_id
  };
  }

  activeTab.value = 'general';
  showModal.value = true;
};



const closeModal = () => {
  showModal.value = false;
  // contractStore.error = null;
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.type || !form.value.start_date || !form.value.shift_id || !form.value.fixed_monthly_salary) {
    notyf.error('Please fill in core fields (Employee, Shift, Salary)');
    return;
  }

  // Ensure types
  const payload = {
      ...form.value,
      is_active: form.value.is_active ? 1 : 0, 
      employee_id: parseInt(form.value.employee_id),
      shift_id: parseInt(form.value.shift_id),
  };

  try {
    if (isEditing.value) {
      await contractStore.updateContract(editingId.value, payload);
    } else {
      await contractStore.createContract(payload);
    }
    closeModal();
    closeModal();
  } catch (error) {
     console.error("Submission failed:", error);
     handleError(error);
  }
};

const confirmDelete = (id) => {
    // Note: Contracts API doc didn't explicitly mention delete, 
    // but implement logic just in case user wants enabled later or provided
    deleteId.value = id;
    showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await contractStore.deleteContract(deleteId.value);
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
