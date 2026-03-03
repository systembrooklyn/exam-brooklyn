<template>
  <div class="rounded-xl p-4 border" :class="containerClass">
    <p class="text-[10px] uppercase font-bold mb-2" :class="labelClass">{{ title }}</p>
    <p class="text-lg font-bold mb-3" :class="amountClass">{{ formattedTotal }}</p>

    <div v-if="effectiveDetails && Object.keys(effectiveDetails).length" class="space-y-3 mt-3 pt-3 border-t border-current/10">
      <div
        v-for="(detail, key) in effectiveDetails"
        :key="key"
        class="text-sm"
      >
        <p class="font-semibold mb-1" :class="labelClass">{{ formatLabel(key) }}</p>
        <ul class="space-y-1 text-xs pl-2">
          <li v-for="(val, k) in detail" :key="k" class="flex justify-between gap-2">
            <span class="text-gray-600">{{ formatFieldLabel(k) }}</span>
            <span class="font-medium">{{ formatValue(val, k) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: [Number, String, Object], default: null },
  details: { type: [Object, String], default: null },
  title: { type: String, default: '' },
  variant: { type: String, default: 'deductions' } // 'deductions' | 'additions'
})

function parsePayload(val) {
  if (val == null) return null
  if (typeof val === 'object' && !Array.isArray(val)) return val
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(val)
        return typeof parsed === 'object' ? parsed : null
      } catch {
        return null
      }
    }
  }
  return null
}

const LABELS = {
  absence: 'Absence',
  lateness: 'Lateness',
  early_leave: 'Early Leave',
  overtime: 'Overtime',
  holiday_double_pay: 'Holiday Double Pay',
  days: 'Days',
  amount: 'Amount',
  penalty_multiplier: 'Penalty Multiplier',
  total_minutes: 'Total Minutes',
  after_15_minutes: 'After 15 Minutes',
  approved_after_15_minutes: 'Approved After 15',
  after_grace_minutes: 'After Grace Minutes',
  approved_after_grace_minutes: 'Approved After Grace',
  unapproved_count: 'Unapproved Count',
  approved_minutes: 'Approved Minutes',
  approved_overtime_minutes: 'Approved Overtime (min)',
  overtime_amount: 'Overtime Amount'
}

const effectiveDetails = computed(() => {
  const d = props.details
  if (d != null && typeof d === 'object' && !Array.isArray(d)) return d
  const parsedD = parsePayload(d)
  if (parsedD && typeof parsedD === 'object') return parsedD
  const parsedT = parsePayload(props.total)
  if (parsedT?.details && typeof parsedT.details === 'object') return parsedT.details
  return null
})

const formattedTotal = computed(() => {
  const t = props.total
  if (t == null || t === '') return '-'
  if (typeof t === 'number') return t.toFixed(2)
  const parsed = parsePayload(t)
  if (parsed != null && typeof parsed.total === 'number') return parsed.total.toFixed(2)
  if (typeof t === 'object' && typeof t.total === 'number') return t.total.toFixed(2)
  const num = parseFloat(String(t))
  return !isNaN(num) ? num.toFixed(2) : '-'
})

const containerClass = computed(() =>
  props.variant === 'deductions'
    ? 'bg-red-50 border-red-100'
    : 'bg-green-50 border-green-100'
)

const labelClass = computed(() =>
  props.variant === 'deductions'
    ? 'text-red-400'
    : 'text-green-400'
)

const amountClass = computed(() =>
  props.variant === 'deductions'
    ? 'text-red-700'
    : 'text-green-700'
)

const formatLabel = (key) => LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatFieldLabel = (key) => LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatValue = (val, key) => {
  if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val.toFixed(2))
  return val
}
</script>
