<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Vacation Balances</h1>
        <p class="text-gray-500 mt-1">Manage employee leave entitlements</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Balance
      </button>
    </div>

     <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
        <input v-model="searchQuery" type="text" placeholder="Search employee..." class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        
         <select v-model="yearFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option :value="null">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
            </option>
        </select>
    </div>



    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredBalances"
      :loading="store.loading"
      emptyMessage="No vacation balances found."
      @edit="openEditModal"
      @delete="confirmDelete"
    >
      <template #employee="{ item }">
        <span class="font-medium text-gray-900">
           {{ getBalanceEmployeeName(item) }}
        </span>
      </template>

      <template #available_days="{ value }">
         <span class="font-bold text-gray-700">{{ value }}</span>
      </template>

      <template #total_vacations_taken="{ value }">
         <span class="text-blue-600 font-medium">{{ value }}</span>
      </template>

      <template #remaining_days="{ value }">
         <span class="text-green-600 font-bold">{{ value }}</span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Balance' : 'New Balance'"
      :loading="store.loading"
      maxWidthClass="max-w-2xl"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-6">
        <!-- Employee Section -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Employee Information
            </h3>
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Employee <span class="text-red-500">*</span></label>
                 <select v-model="form.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" :disabled="isEditing">
                    <option :value="null">Select Employee</option>
                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                        {{ emp.personal_info?.first_name }} {{ emp.personal_info?.last_name }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Balance Details -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Balance Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input v-model="form.year" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="2026" />
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input v-model="form.start_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
            </div>
        </div>

         <!-- Limits -->
         <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                Quota & Entitlements
            </h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Available Days (Quota)</label>
                    <input v-model="form.available_days" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Used Days</label>
                    <input v-model="form.total_vacations_taken" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
            </div>
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This balance record will be deleted."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrVacationBalancesStore } from '@/stores/hr/vacationBalances';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrContractsStore } from '@/stores/hr/contracts';

import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import { watch } from 'vue';

const store = useHrVacationBalancesStore();
const empStore = useHrEmployeesStore();
const contractStore = useHrContractsStore();

const vacationBalances = computed(() => store.vacationBalances);
const employees = computed(() => empStore.employees);
const contracts = computed(() => contractStore.contracts);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  employee_id: null,
  year: new Date().getFullYear(),
  start_date: '',
  available_days: 21,

  total_vacations_taken: 0
});

onMounted(async () => {
  store.getVacationBalances();
  empStore.getEmployees();
  contractStore.getContracts();
});

const getBalanceEmployeeName = (balance) => {
    // 1. Try contracts array (from API index)
    if (balance.contracts?.[0]?.employee?.name) return balance.contracts[0].employee.name;
    // 2. Try employee object (if exists)
    if (balance.employee?.name) return balance.employee.name;
    // 3. Fallback to store if we have IDs
    const empId = balance.employee_id || balance.contracts?.[0]?.employee?.id;
    const emp = employees.value.find(e => e.id === empId);
    if (emp) {
        const info = emp.personal_info || emp;
        return `${info.first_name} ${info.last_name}`;
    }
    return `-`;
};

const searchQuery = ref('');
const yearFilter = ref(null);

const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Year', key: 'year' },
  { label: 'Start Date', key: 'start_date' },
  { label: 'Entitlement', key: 'available_days' },
  { label: 'Used', key: 'total_vacations_taken' },
  { label: 'Remaining', key: 'remaining_days' },
];

const availableYears = computed(() => {
    const years = new Set(vacationBalances.value.map(b => b.year));
    return Array.from(years).sort((a, b) => b - a);
});

const filteredBalances = computed(() => {
    return vacationBalances.value.filter(b => {
        const empName = getBalanceEmployeeName(b).toLowerCase();
        const matchesSearch = empName.includes(searchQuery.value.toLowerCase());
        const matchesYear = !yearFilter.value || b.year === yearFilter.value;

        return matchesSearch && matchesYear;
    });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 7;

const totalPages = computed(() => Math.ceil(filteredBalances.value.length / itemsPerPage));

const paginatedBalances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredBalances.value.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// Reset pagination
watch([searchQuery, yearFilter], () => {
    currentPage.value = 1;
});


const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    employee_id: null,
    year: new Date().getFullYear(),
    start_date: new Date().toISOString().slice(0, 10),
    available_days: 21,
    total_vacations_taken: 0
  };
  showModal.value = true;
};

const openEditModal = async (balance) => {
  isEditing.value = true;
  editingId.value = balance.id;
  
  try {
    const fullBalance = await store.getVacationBalance(balance.id);
    console.log('Fetched Vacation Balance By ID:', fullBalance);
    
    // Map data correctly from the nested structure
    form.value = { 
      ...fullBalance,
      employee_id: fullBalance.contracts?.[0]?.employee?.id || fullBalance.employee_id
    };
  } catch (error) {
    console.error('Failed to fetch details:', error);
    form.value = { ...balance };
  }
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.value.employee_id) {
    notyf.error('Employee is required');
    return;
  }

  // Find active contract for employee
  let targetContract = contracts.value.find(c => c.employee_id === form.value.employee_id && (c.is_active || c.is_active === 1));

  // Fallback: If no active contract, take the first available contract for this employee
  if (!targetContract) {
    targetContract = contracts.value.find(c => c.employee_id === form.value.employee_id);
  }

  if (!targetContract && !isEditing.value) {
      notyf.error('Selected employee does not have any contract. Please create a contract for this employee first.');
      return; 
  }

  const payload = {
      ...form.value,
      employee_id: parseInt(form.value.employee_id),
      year: parseInt(form.value.year),
      available_days: parseInt(form.value.available_days),
      total_vacations_taken: parseInt(form.value.total_vacations_taken || 0),
      contract_ids: targetContract ? [targetContract.id] : []
  }

  try {
    if (isEditing.value) {
      // For update, the API might not need contract_ids if strictly updating balance fields, 
      // but if it does, we send it. Usually update is just balance data.
      await store.updateVacationBalance(editingId.value, payload);
    } else {
      await store.createVacationBalance(payload);
    }
    closeModal();
    // Refresh to show new data
    store.getVacationBalances(); 
  } catch (error) {
     console.error(error);
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await store.deleteVacationBalance(deleteId.value);
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
