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

    <!-- Error -->
    <div v-if="contractStore.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ contractStore.error }}</span>
      <button @click="contractStore.error = null" class="text-red-800 font-bold">×</button>
    </div>

    <!-- Loading -->
    <div v-if="contractStore.loading && !contracts.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
      <table class="w-full text-left min-w-[900px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-4 font-semibold text-gray-600">Contract ID</th>
            <th class="p-4 font-semibold text-gray-600">Employee</th>
            <th class="p-4 font-semibold text-gray-600">Type</th>
            <th class="p-4 font-semibold text-gray-600">Start Date</th>
             <th class="p-4 font-semibold text-gray-600">Salary</th>
            <th class="p-4 font-semibold text-gray-600">Status</th>
            <th class="p-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="contracts.length === 0">
            <td colspan="7" class="p-8 text-center text-gray-500">No contracts found.</td>
          </tr>
          <tr v-for="contract in contracts" :key="contract.id" class="hover:bg-gray-50 transition-colors">
            <td class="p-4 text-gray-500">#{{ contract.id }}</td>
             <td class="p-4 font-medium text-gray-900">
                <!-- Fetch employee name from ID if possible, or display ID if not populated -->
                {{ getEmployeeName(contract.employee_id) }}
            </td>
            <td class="p-4 text-gray-600 capitalize">{{ contract.type }}</td>
            <td class="p-4 text-gray-500">{{ contract.start_date }}</td>
            <td class="p-4 text-gray-600 font-medium">{{ contract.fixed_monthly_salary }}</td>
             <td class="p-4">
              <span class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="contract.is_active || contract.is_active === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
              >
               {{ (contract.is_active || contract.is_active === 1) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="p-4 flex gap-3">
              <button @click="openEditModal(contract)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
             <!-- No delete in API doc for contract? Assuming simple disable via update or keeping edit only if delete not supported -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Contract' : 'New Contract'"
      :loading="contractStore.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
         <!-- Employee & Shift -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                 <select v-model="form.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" :disabled="isEditing">
                    <option :value="null">Select Employee</option>
                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                        {{ emp.first_name }} {{ emp.last_name }}
                    </option>
                </select>
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                 <select v-model="form.shift_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option :value="null">Select Shift</option>
                    <option v-for="shift in shifts" :key="shift.id" :value="shift.id">
                        {{ shift.shift_name }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Type & Status -->
        <div class="grid grid-cols-2 gap-4">
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                 <select v-model="form.type" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option value="new">New</option>
                    <option value="old">Old</option>
                    <option value="hourly-online">Hourly Online</option>
                </select>
            </div>
            <div class="flex items-end mb-2">
                 <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="form.is_active" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                    <span class="text-sm font-medium text-gray-700">Contract Active</span>
                 </label>
            </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                 <input v-model="form.start_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                 <input v-model="form.end_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>

        <!-- Salary -->
         <div class="grid grid-cols-2 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Salary</label>
                 <input v-model="form.fixed_monthly_salary" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="5000" />
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Other Var Amount</label>
                 <input v-model="form.other_var_amounts" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="0" />
            </div>
        </div>

        <!-- Hours -->
         <div class="grid grid-cols-3 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Days</label>
                 <input v-model="form.weekly_working_days" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label>
                 <input v-model="form.weekly_working_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Days Off Count</label>
                 <input v-model="form.days_off_count" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>

        <!-- Days Off Selection -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Days Off</label>
            <div class="flex flex-wrap gap-2">
                <button 
                    v-for="(day, index) in daysOfWeek" 
                    :key="index"
                    @click="toggleDayOff(index)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                    :class="form.day_off.includes(index) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                    {{ day }}
                </button>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none"></textarea>
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
import { onMounted, ref, computed } from 'vue';
import { useHrContractsStore } from '@/stores/hr/contracts';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';

const contractStore = useHrContractsStore();
const employeeStore = useHrEmployeesStore();
const shiftStore = useHrShiftsStore();

const contracts = computed(() => contractStore.contracts);
const employees = computed(() => employeeStore.employees);
const shifts = computed(() => shiftStore.shifts);

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

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

onMounted(() => {
  contractStore.getContracts();
  employeeStore.getEmployees();
  shiftStore.getShifts();
});

const getEmployeeName = (id) => {
    const emp = employees.value.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : `Emp #${id}`;
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
  showModal.value = true;
};

const openEditModal = (contract) => {
  isEditing.value = true;
  editingId.value = contract.id;
  // Parse day_off because it might be returned differently or valid
  form.value = { 
      ...contract, 
      day_off: Array.isArray(contract.day_off) ? contract.day_off : [],
      is_active: Boolean(contract.is_active)
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // contractStore.error = null;
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.shift_id || !form.value.fixed_monthly_salary) {
    alert('Please fill in core fields (Employee, Shift, Salary)');
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
  } catch (error) {
     console.error(error);
  }
};

const confirmDelete = (id) => {
    // Note: Contracts API doc didn't explicitly mention delete, 
    // but implement logic just in case user wants enabled later or provided
    deleteId.value = id;
    showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
   // Add store action call here if/when contract deletion is supported/enabled
    showDeleteConfirm.value = false;
    deleteId.value = null;
    console.log('Contract delete requested for', deleteId.value);
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
