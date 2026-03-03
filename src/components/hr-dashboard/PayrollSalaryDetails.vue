<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <div class="bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg text-center">
      Salary Details
    </div>

    <!-- Summary: Total Deductions & Additions -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-red-50 rounded-lg p-4 border-2 border-red-200 text-center">
        <p class="text-xs font-bold text-red-600 uppercase mb-1">Total Deductions</p>
        <p class="text-xl font-bold text-red-800">{{ formattedDeductions }}</p>
      </div>
      <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
        <p class="text-xs font-bold text-green-600 uppercase mb-1">Total Additions</p>
        <p class="text-xl font-bold text-green-800">{{ formattedAdditions }}</p>
      </div>
    </div>

    <!-- Boxes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PayrollDetailsBox
        title="Lateness"
        :data="latenessData"
        variant="pink"
        :labels="LATENESS_LABELS"
      />
      <PayrollDetailsBox
        title="Absence"
        :data="absenceData"
        variant="blue"
        :labels="ABSENCE_LABELS"
      />
      <PayrollDetailsBox
        title="Early Leave"
        :data="earlyLeaveData"
        variant="pink"
        :labels="EARLY_LEAVE_LABELS"
      />
      <PayrollDetailsBox
        title="Extra Fees (Overtime)"
        :data="overtimeData"
        variant="green"
        :labels="OVERTIME_LABELS"
      />
      <PayrollDetailsBox
        v-if="Object.keys(holidayDoublePayData).length"
        title="Holiday Double Pay"
        :data="holidayDoublePayData"
        variant="green"
        :labels="HOLIDAY_DOUBLE_PAY_LABELS"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PayrollDetailsBox from './PayrollDetailsBox.vue'

const props = defineProps({
  deductionDetails: { type: [Object, String], default: null },
  additionsDetails: { type: [Object, String], default: null },
  deductionsTotal: { type: [Number, String], default: null },
  additionsTotal: { type: [Number, String], default: null }
})

const LATENESS_LABELS = {
  total_minutes: 'Total Lateness (Minutes)',
  after_15_minutes: 'Minutes After 15-Min Grace',
  after_grace_minutes: 'Minutes After Grace',
  approved_after_15_minutes: 'Approved Minutes After Grace',
  unapproved_count: 'Unapproved Lateness Count',
  amount: 'Deduction Amount (EGP)'
}

const ABSENCE_LABELS = {
  days: 'Absent Days',
  amount: 'Deduction Amount (EGP)',
  penalty_multiplier: 'Penalty Multiplier'
}

const EARLY_LEAVE_LABELS = {
  total_minutes: 'Total Early Leave (Minutes)',
  approved_minutes: 'Approved Early Leave (Minutes)',
  unapproved_count: 'Unapproved Early Leave Count',
  amount: 'Deduction Amount (EGP)'
}

const OVERTIME_LABELS = {
  approved_overtime_minutes: 'Approved Overtime (Minutes)',
  approved_minutes: 'Approved Overtime (Minutes)',
  overtime_amount: 'Overtime Pay (EGP)',
  amount: 'Overtime Pay (EGP)',
  holiday_double_pay: 'Holiday Double Pay (EGP)'
}

const HOLIDAY_DOUBLE_PAY_LABELS = {
  days: 'Days',
  amount: 'Amount (EGP)'
}

function parsePayload(val) {
  if (val == null) return null
  if (typeof val === 'object' && !Array.isArray(val)) return val
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(val)
      return typeof parsed === 'object' ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

const deductionDetailsParsed = computed(() => {
  const d = parsePayload(props.deductionDetails)
  if (d && Object.keys(d).length) return d
  const t = parsePayload(props.deductionsTotal)
  return t?.details ?? {}
})

const additionsDetailsParsed = computed(() => {
  const a = parsePayload(props.additionsDetails)
  if (a && Object.keys(a).length) return a
  const t = parsePayload(props.additionsTotal)
  return t?.details ?? {}
})

const latenessData = computed(() => deductionDetailsParsed.value?.lateness ?? {})

const absenceData = computed(() => deductionDetailsParsed.value?.absence ?? {})

const earlyLeaveData = computed(() => deductionDetailsParsed.value?.early_leave ?? {})

const overtimeData = computed(() => additionsDetailsParsed.value?.overtime ?? {})

const holidayDoublePayData = computed(() => additionsDetailsParsed.value?.holiday_double_pay ?? {})

const formattedDeductions = computed(() => {
  const t = props.deductionsTotal
  if (t == null || t === '') return '-'
  if (typeof t === 'number') return t.toFixed(2)
  const parsed = parsePayload(t)
  if (parsed?.total != null) return Number(parsed.total).toFixed(2)
  const num = parseFloat(String(t))
  return !isNaN(num) ? num.toFixed(2) : '-'
})

const formattedAdditions = computed(() => {
  const t = props.additionsTotal
  if (t == null || t === '') return '-'
  if (typeof t === 'number') return t.toFixed(2)
  const parsed = parsePayload(t)
  if (parsed?.total != null) return Number(parsed.total).toFixed(2)
  const num = parseFloat(String(t))
  return !isNaN(num) ? num.toFixed(2) : '-'
})
</script>
