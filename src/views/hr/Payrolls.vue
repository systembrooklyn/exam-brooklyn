<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <p class="text-gray-500 mt-1">Manage employee payrolls, approvals, and payments</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
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
      :fetchingId="fetchingId"
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
              {{
                emp.name ||
                (emp.personal_info
                  ? emp.personal_info.first_name +
                    " " +
                    emp.personal_info.last_name
                  : "Emp #" + emp.id)
              }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input v-model="calcForm.from_date" type="date" :max="today" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input v-model="calcForm.to_date" type="date" :max="today" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </div>
    </HrModal>

    <!-- Details Modal -->
    <HrModal
      :show="showDetailsModal"
      title="Payroll Details"
      :loading="store.loading"
      maxWidthClass="max-w-2xl"
      @close="showDetailsModal = false"
      cancelLabel="Close"
      :hasSave="false"
    >
      <div v-if="selectedPayroll" class="space-y-5 ">

        <!-- Header: Period + Status -->
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-400 uppercase font-bold">Payroll Period</p>
            <p class="text-base font-bold text-gray-800">{{ selectedPayroll.period?.payroll_month || selectedPayroll.period?.from }}</p>
          </div>
          <PayrollStatusBadge :status="selectedPayroll.current_status || selectedPayroll.status" />
        </div>

        <!-- Financials -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
            <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Fixed Salary Paid</p>
            <p class="text-xl font-bold text-gray-800">{{ selectedPayroll.financials?.fixed_salary_paid ?? '-' }}</p>
          </div>
          <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-center">
            <p class="text-[10px] uppercase font-bold text-indigo-400 mb-1">Net Salary Due</p>
            <p class="text-xl font-bold text-indigo-700">{{ selectedPayroll.financials?.net_salary_due ?? '-' }}</p>
          </div>
          <div class="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
            <p class="text-[10px] uppercase font-bold text-red-400 mb-1">Deductions</p>
            <p class="text-lg font-bold text-red-700">{{ selectedPayroll.financials?.deductions ?? '-' }}</p>
          </div>
          <div class="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
            <p class="text-[10px] uppercase font-bold text-green-400 mb-1">Additions</p>
            <p class="text-lg font-bold text-green-700">{{ selectedPayroll.financials?.additions ?? '-' }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedPayroll.notes" class="bg-blue-50 p-3 rounded-xl border border-blue-100">
          <p class="text-[10px] uppercase font-bold text-blue-400 mb-1">Notes</p>
          <p class="text-sm text-blue-800">{{ selectedPayroll.notes }}</p>
          <p class="text-[10px] text-blue-400 mt-1">Last updated by: {{ selectedPayroll.last_updated_by }}</p>
        </div>

        <!-- Status History Timeline -->
        <div v-if="selectedPayroll.statuses_history?.length">
          <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Status History</h4>
          <ul class="space-y-3">
            <li
              v-for="(entry, i) in selectedPayroll.statuses_history"
              :key="i"
              class="flex gap-3 items-start"
            >
              <div class="flex flex-col items-center">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></div>
                <div v-if="i < selectedPayroll.statuses_history.length - 1" class="w-px flex-1 bg-indigo-100 mt-1"></div>
              </div>
              <div class="flex-1 pb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <PayrollStatusBadge :status="entry.status" />
                  <span class="text-xs text-gray-400">{{ entry.action_at }}</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">
                  By <strong>{{ entry.action_by?.name }}</strong>
                  <span v-if="entry.action_by?.job_titles?.length" class="text-gray-400"> ({{ entry.action_by.job_titles.join(', ') }})</span>
                </p>
                <p v-if="entry.notes" class="text-[11px] text-gray-500 italic mt-0.5">{{ entry.notes }}</p>
              </div>
            </li>
          </ul>
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
import { ref, onMounted, computed } from 'vue'
import { useHrPayrollStore } from '@/stores/hr/payroll'
import { useHrEmployeesStore } from '@/stores/hr/employees'
import { useAuthStore } from '@/stores/auth'
import HrModal from '@/components/hr-dashboard/HrModal.vue'
import PayrollsTable from '@/components/hr-dashboard/PayrollsTable.vue'
import PayrollStatusBadge from '@/components/hr-dashboard/PayrollStatusBadge.vue'
import { LucideCalculator, LucideRefreshCw } from 'lucide-vue-next'
import notyf from '@/components/global/notyf'

// ─── Stores ──────────────────────────────────────────────
const store = useHrPayrollStore()
const employeeStore = useHrEmployeesStore()
const authStore = useAuthStore()

// ─── Auth / Role ──────────────────────────────────────────
const userJobTitle = computed(() => authStore.user?.job_title || 'employee')

// ─── Helpers ──────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]

// ─── Calculate Payroll Modal ──────────────────────────────
const showCalcModal = ref(false)
const calcForm = ref({ employee_id: '', from_date: '', to_date: '' })

const openCalcModal = () => {
  calcForm.value = { employee_id: '', from_date: '', to_date: '' }
  showCalcModal.value = true
}

const handleCalculate = async () => {
  if (!calcForm.value.employee_id || !calcForm.value.from_date || !calcForm.value.to_date) {
    notyf.error('Please fill in all fields')
    return
  }
  try {
    const response = await store.calculatePayroll(calcForm.value)
    selectedPayroll.value = response.data
    showCalcModal.value = false
    showDetailsModal.value = true
    fetchPayrolls()
  } catch (error) {
    console.error('Calculation failed:', error)
  }
}

// ─── Payroll Details Modal ────────────────────────────────
const showDetailsModal = ref(false)
const selectedPayroll = ref(null)
const fetchingId = ref(null)

const showDetails = async (item) => {
  fetchingId.value = item.payroll_id
  try {
    const empId = item.employee?.id || item.employee_id
    const periodMonth = item.period?.payroll_month || item.period_from
    const response = await store.getPayrollDetails(empId, periodMonth)
    selectedPayroll.value = response.data
    showDetailsModal.value = true
  } catch (error) {
    console.error('Failed to fetch payroll details:', error)
    selectedPayroll.value = item
    showDetailsModal.value = true
  } finally {
    fetchingId.value = null
  }
}

// ─── Update Status Modal ──────────────────────────────────
const showStatusModal = ref(false)
const nextStatus = ref('')
const statusUpdateForm = ref({
  employee_id: null,
  period_from: '',
  period_to: '',
  status: '',
  notes: ''
})

const handleUpdateStatus = ({ item, status }) => {
  statusUpdateForm.value = {
    employee_id: item.employee_id || item.employee?.id,
    period_from: item.period_from || item.period?.payroll_month,
    period_to: item.period_to || item.period?.payroll_month,
    status,
    notes: ''
  }
  nextStatus.value = status
  showStatusModal.value = true
}

const executeStatusUpdate = async () => {
  try {
    await store.updatePayrollStatus(statusUpdateForm.value)
    showStatusModal.value = false
    fetchPayrolls()
  } catch (error) {
    console.error('Status update failed:', error)
  }
}

// ─── Fetch Payrolls ───────────────────────────────────────
const fetchPayrolls = async () => {
  try {
    await store.getActionablePayrolls()
  } catch (error) {
    console.error('Failed to fetch payrolls:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchPayrolls(), employeeStore.getEmployees()])
})
</script>
