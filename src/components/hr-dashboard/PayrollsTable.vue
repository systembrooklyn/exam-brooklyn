<template>
  <div>
    <HrDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      emptyMessage="No payrolls found."
    >

      <!-- Employee -->
      <template #employee="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-gray-800">
            {{ item.employee?.name || 'N/A' }}
          </span>
          <span class="text-xs text-gray-500">
            {{ item.employee?.fingerprint }}
          </span>
        </div>
      </template>

      <!-- Period -->
      <template #period="{ item }">
       <div class="flex flex-col gap-0.5 items-center text-center">          <span class="text-sm font-medium text-gray-800">{{ payrollMonthLabel(item) }}</span>
          <span v-if="periodRangeLine(item)" class="text-[11px] text-gray-400">
            Period: {{ periodRangeLine(item) }}
          </span>
        </div>
      </template>

      <!-- Fixed Salary -->
      <template #fixed_salary="{ item }">
        <span class="font-medium text-gray-700">
          {{ item.financials?.fixed_salary_paid ?? '-' }}
        </span>
      </template>

      <!-- Net Salary -->
      <template #net_salary="{ item }">
        <span class="font-semibold text-gray-900">
          {{ item.financials?.net_salary_due ?? '-' }}
        </span>
      </template>

      <!-- Status -->
      <template #status="{ item }">
        <PayrollStatusBadge :status="item.current_status" />
      </template>

      <!-- Actions -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <!-- Eye / Loading Spinner -->
          <button
            @click="$emit('view', item)"
            class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
            :disabled="fetchingId === (item.payroll_id || item.id)"
          >
            <span
              v-if="fetchingId === (item.payroll_id || item.id)"
              class="block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            />
            <LucideEye v-else class="w-4 h-4" />
          </button>

          <!-- Approval Actions -->
          <div class="flex items-center gap-1 border-l pl-2 ml-1">
            <!-- Approve -->
            <button
              @click="$emit('update-status', { item, status: 'approve' })"
              class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Approve"
            >
              <LucideCheckCircle class="w-4 h-4" />
            </button>

            <!-- Suspend (restored later if needed — was: status 'suspended')
            <button
              @click="$emit('update-status', { item, status: 'suspended' })"
              class="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
              title="Suspend"
            >
              <LucidePauseCircle class="w-4 h-4" />
            </button>
            -->

            <!-- Reject -->
            <button
              @click="$emit('update-status', { item, status: 'reject' })"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Reject"
            >
              <LucideXCircle class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>

    </HrDataTable>
  </div>
</template>

<script setup>
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue'
import PayrollStatusBadge from './PayrollStatusBadge.vue'
import { LucideEye, LucideCheckCircle, LucideXCircle } from 'lucide-vue-next'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  fetchingId: { type: [Number, String, null], default: null },
  /** When a row has no period fields (e.g. pending), match the filter strip */
  filterPeriodFrom: { type: String, default: '' },
  filterPeriodTo: { type: String, default: '' }
})

defineEmits(['view', 'update-status'])

const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Month', key: 'period' },
  { label: 'Fixed Salary', key: 'fixed_salary' },
  { label: 'Net Salary', key: 'net_salary' },
  { label: 'Status', key: 'status' },
]

/** Same rule as Payrolls.vue getPayrollDates: YYYY-MM payroll month → prev month 21 → selected month 20 */
function boundsFromPayrollMonthYm(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(String(ym))) return { from: '', to: '' }
  const [year, mon] = String(ym).split('-').map(Number)
  const fromYear = mon === 1 ? year - 1 : year
  const fromMon = mon === 1 ? 12 : mon - 1
  const from = `${fromYear}-${String(fromMon).padStart(2, '0')}-21`
  const to = `${year}-${String(mon).padStart(2, '0')}-20`
  return { from, to }
}

function effectivePeriodBounds(item) {
  let from = item.period_from || item.period?.from || item.period?.period_from
  let to = item.period_to || item.period?.to || item.period?.period_to
  const ym = item.period?.payroll_month
  if ((!from || !to) && ym && /^\d{4}-\d{2}$/.test(String(ym))) {
    const b = boundsFromPayrollMonthYm(ym)
    from = from || b.from
    to = to || b.to
  }
  if ((!from || !to) && props.filterPeriodFrom && props.filterPeriodTo) {
    from = from || props.filterPeriodFrom
    to = to || props.filterPeriodTo
  }
  return { from, to }
}

/** Label from period end (e.g. April 2026 for …→ 2026-04-20) */
function payrollMonthLabel(item) {
  const { from, to } = effectivePeriodBounds(item)
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
    const [y, m, d] = String(to).split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(String(from))) {
    const [y, m] = String(from).split('-').map(Number)
    return new Date(y, m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  return '-'
}

function periodRangeLine(item) {
  const { from, to } = effectivePeriodBounds(item)
  if (from && to) return `${from} → ${to}`
  return ''
}
</script>