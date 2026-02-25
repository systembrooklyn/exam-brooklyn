<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <p class="text-gray-500 mt-1">Manage employee payrolls, approvals, and payments</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-if="isAdminOrHR"
          @click="openCalcModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideCalculator class="w-4 h-4" /> Calculate Payroll
        </button>
        <button 
          @click="fetchPayrolls" 
          class="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-600 bg-indigo-50"
          title="Reload Payrolls"
        >
           <LucideRefreshCw class="w-4 h-4" :class="{'animate-spin': store.loading}" />
        </button>
      </div>
    </div>

    <!-- Payrolls Table -->
    <PayrollsTable 
      :items="store.actionablePayrolls" 
      :loading="store.loading" 
      :userRole="userJobTitle"
      @view="showDetails"
      @update-status="handleUpdateStatus"
    />

    <!-- Calculate Payroll Modal -->
    <HrModal
      :show="showCalcModal"
      title="Calculate Payroll"
      :loading="store.loading"
      @close="showCalcModal = false"
      @save="handleCalculate"
    >
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select v-model="calcForm.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Select Employee</option>
            <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
              {{ emp.name || 'N/A' }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input v-model="calcForm.from_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input v-model="calcForm.to_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </div>
    </HrModal>

    <!-- Details Modal -->
    <HrModal
      :show="showDetailsModal"
      title="Payroll Details"
      :loading="store.loading"
      @close="showDetailsModal = false"
      cancelLabel="Close"
      :hasSave="false"
    >
      <div v-if="selectedPayroll" class="space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-gray-900">{{ selectedPayroll.employee?.name }}</h3>
            <p class="text-sm text-gray-500">{{ selectedPayroll.employee?.job_title }}</p>
          </div>
          <PayrollStatusBadge :status="selectedPayroll.status" />
        </div>

        <div class="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400">Fixed Salary</label>
            <p class="text-lg font-bold text-gray-800">{{ selectedPayroll.fixed_salary }}</p>
          </div>
          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400">Net Salary</label>
            <p class="text-lg font-bold text-indigo-600">{{ selectedPayroll.net_salary }}</p>
          </div>
          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400">Period From</label>
            <p class="text-sm font-medium">{{ selectedPayroll.period_from }}</p>
          </div>
          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400">Period To</label>
            <p class="text-sm font-medium">{{ selectedPayroll.period_to }}</p>
          </div>
        </div>

        <div v-if="selectedPayroll.notes" class="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <label class="text-[10px] uppercase font-bold text-blue-400">Notes</label>
          <p class="text-sm text-blue-800">{{ selectedPayroll.notes }}</p>
        </div>
      </div>
    </HrModal>

    <!-- Update Status Modal (Notes) -->
    <HrModal
      :show="showStatusModal"
      :title="'Update Status: ' + nextStatus"
      :loading="store.loading"
      @close="showStatusModal = false"
      @save="executeStatusUpdate"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Are you sure you want to update the status of this payroll to <strong>{{ nextStatus }}</strong>?</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            v-model="statusUpdateForm.notes" 
            rows="3" 
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Add any comments here..."
          ></textarea>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useHrPayrollStore } from '@/stores/hr/payroll';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import PayrollsTable from '@/components/hr-dashboard/PayrollsTable.vue';
import PayrollStatusBadge from '@/components/hr-dashboard/PayrollStatusBadge.vue';
import { LucideCalculator, LucideRefreshCw } from 'lucide-vue-next';
import notyf from '@/components/global/notyf';

const store = useHrPayrollStore();
const employeeStore = useHrEmployeesStore();
const authStore = useAuthStore();

const userJobTitle = computed(() => authStore.user?.job_title || 'employee');
const isAdminOrHR = computed(() => {
  const role = userJobTitle.value.toLowerCase();
  return role.includes('hr') || role.includes('admin');
});

const showCalcModal = ref(false);
const calcForm = ref({
  employee_id: '',
  from_date: '',
  to_date: ''
});

const showDetailsModal = ref(false);
const selectedPayroll = ref(null);

const showStatusModal = ref(false);
const nextStatus = ref('');
const statusUpdateForm = ref({
  employee_id: null,
  period_from: '',
  period_to: '',
  status: '',
  notes: ''
});

const fetchPayrolls = async () => {
  try {
    await store.getActionablePayrolls();
  } catch (error) {
    console.error("Failed to fetch payrolls:", error);
  }
};

onMounted(async () => {
  await Promise.all([
    fetchPayrolls(),
    employeeStore.getEmployees()
  ]);
});

const openCalcModal = () => {
  calcForm.value = { employee_id: '', from_date: '', to_date: '' };
  showCalcModal.value = true;
};

const handleCalculate = async () => {
  if (!calcForm.value.employee_id || !calcForm.value.from_date || !calcForm.value.to_date) {
    notyf.error('Please fill in all fields');
    return;
  }
  try {
    await store.calculatePayroll(calcForm.value);
    showCalcModal.value = false;
    fetchPayrolls();
  } catch (error) {
    console.error("Calculation failed:", error);
  }
};

const showDetails = (item) => {
  selectedPayroll.value = item;
  showDetailsModal.value = true;
};

const handleUpdateStatus = ({ item, status }) => {
  statusUpdateForm.value = {
    employee_id: item.employee_id,
    period_from: item.period_from,
    period_to: item.period_to,
    status: status,
    notes: ''
  };
  nextStatus.value = status;
  showStatusModal.value = true;
};

const executeStatusUpdate = async () => {
  try {
    await store.updatePayrollStatus(statusUpdateForm.value);
    showStatusModal.value = false;
    fetchPayrolls();
  } catch (error) {
    console.error("Status update failed:", error);
  }
};
</script>
