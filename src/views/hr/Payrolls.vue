<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <p class="text-gray-500 mt-1">Manage employee payrolls, approvals, and payments</p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border border-indigo-200">
          <div class="flex flex-col px-2 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
            <div class="relative">
              <input
                v-model="filterPayrollMonth"
                type="month"
                class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                @change="applyFilterMonth"
              />
              <LucideCalendar class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p v-if="filterPayrollMonth" class="text-xs text-gray-400 mt-1">
              Period: {{ getPayrollDates(filterPayrollMonth).from_date }} → {{ getPayrollDates(filterPayrollMonth).to_date }}
            </p>
          </div>
          <div class="w-px h-8 bg-gray-200"></div>
          <div class="flex flex-col px-2 min-w-[120px]">
            <label class="text-[10px] uppercase font-bold text-gray-400">Status</label>
            <select v-model="filterForm.status" class="bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none p-0 h-5" @change="fetchPayrolls">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="hr-approved">HR Approved</option>
              <option value="hr-manager-approved">HR Manager Approved</option>
              <option value="gm-approved">GM Approved</option>
              <option value="paid">Paid</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="w-px h-8 bg-gray-200"></div>
          <div class="flex items-center gap-2 px-2">
            <input v-model="filterForm.include_missing" type="checkbox" id="include_missing" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" @change="fetchPayrolls" />
            <label for="include_missing" class="text-xs font-medium text-gray-700 cursor-pointer whitespace-nowrap">Include Missing Payrolls</label>
          </div>
          <button
            @click="fetchPayrolls"
            class="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-600 bg-indigo-50 cursor-pointer"
            title="Apply Filters"
          >
            <LucideRefreshCw class="w-4 h-4" :class="{'animate-spin': store.loading}" />
          </button>
        </div>

        <button
          v-if="authStore.can(HR_PERMISSION.CALCULATE_PAYROLL)"
          @click="openCalcModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LucideCalculator class="w-4 h-4" /> Calculate Payroll
        </button>
      </div>
    </div>

    <!-- Payrolls Table -->
    <PayrollsTable 
      :items="store.actionablePayrolls" 
      :loading="store.loading" 
      :fetchingId="fetchingId"
      :manual-adjustment-net-by-employee="manualAdjustmentNetByEmployee"
      :filter-period-from="filterForm.period_from"
      :filter-period-to="filterForm.period_to"
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
          <input v-model="calcForm.payroll_month" type="month" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <p v-if="calcForm.payroll_month" class="text-xs text-gray-400 mt-1">
            Period: {{ getPayrollDates(calcForm.payroll_month).from_date }} → {{ getPayrollDates(calcForm.payroll_month).to_date }}
          </p>
        </div>
      </div>
    </HrModal>

    <!-- Details Modal -->
    <HrModal
      :show="showDetailsModal"
      title="Payroll Details"
      :loading="store.loading"
      maxWidthClass="max-w-4xl"
      @close="showDetailsModal = false"
      cancelLabel="Close"
      :hasSave="false"
    >
      <div v-if="selectedPayroll" class="space-y-5">

        <!-- Employee Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p class="text-xs font-bold text-orange-600 uppercase mb-0.5">Employee Name</p>
            <p class="text-base font-semibold text-gray-800">{{ getEmployeeName(selectedPayroll) }}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p class="text-xs font-bold text-indigo-600 uppercase mb-0.5">E-Mail</p>
            <p class="text-base font-medium text-gray-800">{{ selectedPayroll.employee?.email ?? selectedPayroll.employee?.personal_info?.email ?? '-' }}</p>
          </div>
        </div>

        <!-- Period + Status -->
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-400 uppercase font-bold">Payroll Period</p>
            <p class="text-base font-bold text-gray-800">{{ selectedPayroll.period?.payroll_month || selectedPayroll.period?.from || selectedPayroll.period?.to }}</p>
          </div>
          <PayrollStatusBadge :status="selectedPayroll.current_status || selectedPayroll.status" />
        </div>

        <!-- Salary Summary -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 text-center">
            <p class="text-xs font-bold text-gray-600 uppercase mb-1">Fixed Salary Paid</p>
            <p class="text-xl font-bold text-gray-800">{{ selectedPayroll.financials?.fixed_salary_paid ?? '-' }}</p>
          </div>
          <div class="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 text-center">
            <p class="text-xs font-bold text-amber-600 uppercase mb-1">Net Salary Due</p>
            <p class="text-xl font-bold text-indigo-700">{{ formatMoney(finalNetSalaryDue) }}</p>
            <p class="text-[11px] text-indigo-500 mt-1">
              Base {{ formatMoney(baseNetSalaryDue) }} + Manual {{ formatMoney(adjustmentTotals.net) }}
            </p>
          </div>
        </div>

        <!-- Salary Details (Boxes) -->
        <PayrollSalaryDetails
          :deduction-details="selectedPayroll.deduction_details ?? selectedPayroll.financials?.deductions?.details"
          :additions-details="selectedPayroll.additions_details ?? selectedPayroll.financials?.additions?.details"
          :deductions-total="selectedPayroll.financials?.deductions"
          :additions-total="selectedPayroll.financials?.additions"
        />

        <!-- Employee Adjustments -->
        <div class="space-y-3">
          <div class="bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg text-center">
            Employee Adjustments
          </div>
          <div v-if="adjustmentsLoading" class="text-sm text-gray-500 text-center py-3">
            Loading adjustments...
          </div>
          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
                <p class="text-xs font-bold text-green-600 uppercase mb-1">Total Bonus</p>
                <p class="text-xl font-bold text-green-800">{{ formatMoney(adjustmentTotals.bonus) }}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-4 border-2 border-red-200 text-center">
                <p class="text-xs font-bold text-red-600 uppercase mb-1">Total Deductions</p>
                <p class="text-xl font-bold text-red-800">{{ formatMoney(adjustmentTotals.deductions) }}</p>
              </div>
              <div class="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200 text-center">
                <p class="text-xs font-bold text-indigo-600 uppercase mb-1">Net Manual Adjustment</p>
                <p class="text-xl font-bold text-indigo-800">{{ formatMoney(adjustmentTotals.net) }}</p>
              </div>
            </div>

            <div v-if="selectedAdjustments.length" class="overflow-hidden border border-gray-200 rounded-xl">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="p-3 text-left font-semibold text-gray-600">Month</th>
                    <th class="p-3 text-left font-semibold text-gray-600">Bonus</th>
                    <th class="p-3 text-left font-semibold text-gray-600">Deductions</th>
                    <th class="p-3 text-left font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="adj in selectedAdjustments" :key="adj.id">
                    <td class="p-3 text-gray-700">{{ normalizeMonth(adj.month) || '-' }}</td>
                    <td class="p-3 text-green-700 font-semibold">{{ formatMoney(adj.bonus) }}</td>
                    <td class="p-3 text-red-700 font-semibold">{{ formatMoney(adj.deductions) }}</td>
                    <td class="p-3 text-gray-700">{{ adj.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              No manual adjustments found for this payroll month.
            </div>
          </template>
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
import { computed, ref, onMounted } from 'vue'
import { useHrPayrollStore } from '@/stores/hr/payroll'
import { useHrEmployeesStore } from '@/stores/hr/employees'
import { useHrEmployeeAdjustmentsStore } from '@/stores/hr/employeeAdjustments'
import HrModal from '@/components/hr-dashboard/HrModal.vue'
import PayrollsTable from '@/components/hr-dashboard/PayrollsTable.vue'
import PayrollStatusBadge from '@/components/hr-dashboard/PayrollStatusBadge.vue'
import PayrollSalaryDetails from '@/components/hr-dashboard/PayrollSalaryDetails.vue'
import { LucideCalculator, LucideRefreshCw, LucideCalendar } from 'lucide-vue-next'
import notyf from '@/components/global/notyf'
import { useAuthStore } from '@/stores/auth'
import { HR_PERMISSION } from '@/constants/hrPermissions'

// ─── Stores ──────────────────────────────────────────────
const store = useHrPayrollStore()
const employeeStore = useHrEmployeesStore()
const adjustmentsStore = useHrEmployeeAdjustmentsStore()
const authStore = useAuthStore()

// ─── Helpers ──────────────────────────────────────────────
// Given YYYY-MM, payroll cycle: day 21 of that month → day 20 of next month
const getPayrollDates = (month) => {
  if (!month) return { from_date: "", to_date: "" };

  const [year, mon] = month.split("-").map(Number);

  const fromYear = mon === 1 ? year - 1 : year;
  const fromMon = mon === 1 ? 12 : mon - 1;

  const fromDate = `${fromYear}-${String(fromMon).padStart(2, "0")}-21`;
  const toDate = `${year}-${String(mon).padStart(2, "0")}-20`;

  return { from_date: fromDate, to_date: toDate };
};

// Default: 21st previous calendar month → 20th current month (same as old From/To default)
const now = new Date()
const defaultMonthAnchor = new Date(now.getFullYear(), now.getMonth() - 1, 21)
const defaultPayrollMonth = `${defaultMonthAnchor.getFullYear()}-${String(defaultMonthAnchor.getMonth() + 1).padStart(2, '0')}`
const defaultPeriod = getPayrollDates(defaultPayrollMonth)

const filterPayrollMonth = ref(defaultPayrollMonth)

// ─── Filters ──────────────────────────────────────────────
const filterForm = ref({
  period_from: defaultPeriod.from_date,
  period_to: defaultPeriod.to_date,
  status: '',
  include_missing: false
})

const getEmployeeName = (p) => {
  if (!p) return '-'
  const emp = p.employee
  if (emp?.name) return emp.name
  if (emp?.personal_info) {
    const first = emp.personal_info.first_name || ''
    const last = emp.personal_info.last_name || ''
    return (first + ' ' + last).trim() || '-'
  }
  return '-'
}

// ─── Calculate Payroll Modal ──────────────────────────────
const showCalcModal = ref(false)
const calcForm = ref({ employee_id: '', payroll_month: '' })

const openCalcModal = () => {
  calcForm.value = { employee_id: '', payroll_month: '' }
  showCalcModal.value = true
}

const handleCalculate = async () => {
  if (!calcForm.value.employee_id || !calcForm.value.payroll_month) {
    notyf.error('Please fill in all fields')
    return
  }
  const { from_date, to_date } = getPayrollDates(calcForm.value.payroll_month)
  try {
    console.log(from_date, to_date)
    console.log(calcForm.value.employee_id)
    const response = await store.calculatePayroll({
      employee_id: calcForm.value.employee_id,
      from_date,
      to_date
    })
    selectedPayroll.value = response.data?.data ?? response.data
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
const selectedAdjustments = ref([])
const adjustmentsLoading = ref(false)
const manualAdjustmentNetByEmployee = ref({})

const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normalizeMonth = (raw) => String(raw || '').slice(0, 7)

const formatMoney = (v) => toNumber(v).toFixed(2)

const adjustmentTotals = computed(() => {
  const bonus = selectedAdjustments.value.reduce((sum, row) => sum + toNumber(row?.bonus), 0)
  const deductions = selectedAdjustments.value.reduce((sum, row) => sum + toNumber(row?.deductions), 0)
  return {
    bonus,
    deductions,
    net: bonus - deductions,
  }
})

const buildManualAdjustmentNetMap = (rows) => {
  const map = {}
  for (const row of rows || []) {
    const employeeId = Number(row?.employee_id ?? row?.employee?.id)
    if (!Number.isFinite(employeeId) || employeeId <= 0) continue
    const net = toNumber(row?.bonus) - toNumber(row?.deductions)
    map[employeeId] = toNumber(map[employeeId]) + net
  }
  return map
}

const baseNetSalaryDue = computed(() =>
  toNumber(selectedPayroll.value?.financials?.net_salary_due),
)

const finalNetSalaryDue = computed(() =>
  baseNetSalaryDue.value + adjustmentTotals.value.net,
)

const fetchAdjustmentsForPayroll = async (employeeId, payrollMonth) => {
  const employee_id = Number(employeeId)
  const month = normalizeMonth(payrollMonth)
  if (!Number.isFinite(employee_id) || employee_id <= 0 || !month) {
    selectedAdjustments.value = []
    return
  }
  adjustmentsLoading.value = true
  try {
    const response = await adjustmentsStore.getAdjustments({ employee_id, month })
    selectedAdjustments.value = response?.data ?? adjustmentsStore.adjustments ?? []
  } catch (error) {
    console.error('Failed to fetch adjustments:', error)
    selectedAdjustments.value = []
  } finally {
    adjustmentsLoading.value = false
  }
}

const showDetails = async (item) => {
  if (!authStore.can(HR_PERMISSION.VIEW_PAYROLL)) return
  fetchingId.value = item.payroll_id
  selectedAdjustments.value = []
  adjustmentsLoading.value = true
  try {
    const empId = item.employee?.id || item.employee_id
    const periodMonth = item.period?.payroll_month || item.period_from
    const response = await store.getPayrollDetails(empId, periodMonth)
    selectedPayroll.value = response.data?.data ?? response.data
    const detailsMonth = selectedPayroll.value?.period?.payroll_month || periodMonth
    await fetchAdjustmentsForPayroll(empId, detailsMonth)
    showDetailsModal.value = true
  } catch (error) {
    console.error('Failed to fetch payroll details:', error)
    selectedPayroll.value = item
    await fetchAdjustmentsForPayroll(item.employee?.id || item.employee_id, item.period?.payroll_month || item.period_from)
    showDetailsModal.value = true
  } finally {
    adjustmentsLoading.value = false
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
  action: '',
  notes: ''
})

const handleUpdateStatus = ({ item, status }) => {
  if (!authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)) return
  statusUpdateForm.value = {
    employee_id: item.employee_id || item.employee?.id,
    period_from: filterForm.value.period_from,
    period_to: filterForm.value.period_to,
    action: status, // approve or reject
    notes: ''
  }
  nextStatus.value = status
  showStatusModal.value = true
}

const executeStatusUpdate = async () => {
  if (!authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)) return
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
    const params = {}
    if (filterForm.value.period_from) params.period_from = filterForm.value.period_from
    if (filterForm.value.period_to) params.period_to = filterForm.value.period_to
    if (filterForm.value.status) params.status = filterForm.value.status
    if (filterForm.value.include_missing) params.include_missing = 1

    const month = normalizeMonth(filterPayrollMonth.value)
    if (month) {
      const adjustmentRes = await adjustmentsStore.getAdjustments({ month })
      const rows = adjustmentRes?.data ?? adjustmentsStore.adjustments ?? []
      manualAdjustmentNetByEmployee.value = buildManualAdjustmentNetMap(rows)
    } else {
      manualAdjustmentNetByEmployee.value = {}
    }

    await store.getActionablePayrolls(params)
  } catch (error) {
    console.error('Failed to fetch payrolls:', error)
    manualAdjustmentNetByEmployee.value = {}
  }
}

const applyFilterMonth = () => {
  if (!filterPayrollMonth.value) return
  const { from_date, to_date } = getPayrollDates(filterPayrollMonth.value)
  filterForm.value.period_from = from_date
  filterForm.value.period_to = to_date
  fetchPayrolls()
}

onMounted(async () => {
  await Promise.all([fetchPayrolls(), employeeStore.getEmployees()])
})
</script>
