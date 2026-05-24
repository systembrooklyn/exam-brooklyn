<template>
  <div>
    <!-- Bulk Selection Toolbar -->
    <transition name="slide-down">
      <div
        v-if="selectedIds.size > 0 && authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)"
        class="flex items-center justify-between gap-4 mb-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl"
      >
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span class="text-sm font-semibold text-indigo-700">
            {{ selectedIds.size }} payroll{{ selectedIds.size > 1 ? 's' : '' }} selected
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="clearSelection"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Clear
          </button>
          <button
            @click="emitBulkApprove"
            class="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer font-semibold flex items-center gap-2 shadow-sm"
          >
            <LucideCheckCircle class="w-4 h-4" />
            Bulk Approve ({{ selectedIds.size }})
          </button>
        </div>
      </div>
    </transition>

    <HrDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      :has-actions="hasRowActions"
      emptyMessage="No payrolls found."
    >

      <!-- Row Checkbox -->
      <template #select="{ item }">
        <input
          type="checkbox"
          :checked="selectedIds.has(itemKey(item))"
          @change="toggleItem(item)"
          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </template>

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
          {{ formatMoney(finalNetSalary(item)) }}
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
            v-if="authStore.can(HR_PERMISSION.VIEW_PAYROLL)"
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
          <div
            v-if="authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)"
            class="flex items-center gap-1 border-l pl-2 ml-1"
          >
            <!-- Approve -->
            <button
              @click="$emit('update-status', { item, status: 'approve' })"
              class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Approve"
            >
              <LucideCheckCircle class="w-4 h-4" />
            </button>

            <button
              @click="$emit('update-status', { item, status: 'suspend' })"
              class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              title="Stop salary (suspend)"
            >
              <LucidePauseCircle class="w-4 h-4" />
            </button>

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
import { LucideEye, LucideCheckCircle, LucidePauseCircle, LucideXCircle } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { HR_PERMISSION } from '@/constants/hrPermissions'

const authStore = useAuthStore()

const hasRowActions = computed(
  () =>
    authStore.can(HR_PERMISSION.VIEW_PAYROLL) ||
    authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS),
)

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  fetchingId: { type: [Number, String, null], default: null },
  manualAdjustmentNetByEmployee: { type: Object, default: () => ({}) },
  /** When a row has no period fields (e.g. pending), match the filter strip */
  filterPeriodFrom: { type: String, default: '' },
  filterPeriodTo: { type: String, default: '' }
})

const emit = defineEmits(['view', 'update-status', 'bulk-approve'])

const headers = [
  { label: '', key: 'select', class: 'w-10' },
  { label: 'Employee', key: 'employee' },
  { label: 'Month', key: 'period' },
  { label: 'Fixed Salary', key: 'fixed_salary' },
  { label: 'Net Salary', key: 'net_salary' },
  { label: 'Status', key: 'status' },
]

// ─── Bulk Selection ───────────────────────────────────────
const selectedIds = ref(new Set())

const itemKey = (item) => item.payroll_id || item.id || (item.employee_id + '-' + (item.period?.payroll_month || ''))

const allVisibleSelected = computed(() => {
  if (!props.items.length) return false
  return props.items.every((i) => selectedIds.value.has(itemKey(i)))
})

const someSelected = computed(() => {
  return props.items.some((i) => selectedIds.value.has(itemKey(i))) && !allVisibleSelected.value
})

const toggleSelectAll = () => {
  const next = new Set(selectedIds.value)
  if (allVisibleSelected.value) {
    props.items.forEach((i) => next.delete(itemKey(i)))
  } else {
    props.items.forEach((i) => next.add(itemKey(i)))
  }
  selectedIds.value = next
}

const toggleItem = (item) => {
  const next = new Set(selectedIds.value)
  const key = itemKey(item)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selectedIds.value = next
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

const emitBulkApprove = () => {
  const selected = props.items.filter((i) => selectedIds.value.has(itemKey(i)))
  emit('bulk-approve', selected)
  clearSelection()
}

// Clear selection when the items list changes (e.g. after a fetch refresh)
watch(() => props.items, () => { selectedIds.value = new Set() })

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

function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatMoney(v) {
  return toNumber(v).toFixed(2)
}

function rowEmployeeId(item) {
  const id = Number(item?.employee_id ?? item?.employee?.id)
  return Number.isFinite(id) && id > 0 ? id : null
}

function finalNetSalary(item) {
  const base = toNumber(item?.financials?.net_salary_due)
  const employeeId = rowEmployeeId(item)
  if (!employeeId) return base
  const manual = toNumber(props.manualAdjustmentNetByEmployee?.[employeeId])
  return base + manual
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>