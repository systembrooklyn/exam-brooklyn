<template>
  <div class="rounded-lg border-2 overflow-hidden" :class="boxClass">
    <div class="px-3 py-2 font-bold text-sm" :class="headingClass">{{ title }}</div>
    <div class="p-3 bg-white">
      <div
        v-for="(val, key) in data"
        :key="key"
        class="flex justify-between items-center gap-4 py-1.5 text-sm border-b border-gray-100 last:border-0"
      >
        <span class="text-gray-700 flex-1">{{ getLabel(key) }}</span>
        <span class="font-medium text-gray-900 tabular-nums">{{ formatValue(val, key) }}</span>
      </div>
      <div v-if="!data || !Object.keys(data).length" class="text-sm text-gray-400 py-2 italic">No data for this period</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  variant: { type: String, default: 'blue' }, // pink | blue | green
  labels: { type: Object, default: () => ({}) }
})

const headingClasses = {
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200'
}

const boxClasses = {
  pink: 'border-pink-200',
  blue: 'border-blue-200',
  green: 'border-green-200'
}

const headingClass = headingClasses[props.variant] || headingClasses.blue
const boxClass = boxClasses[props.variant] || boxClasses.blue

const getLabel = (key) => props.labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatValue = (val, key) => {
  if (val == null) return '-'
  if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val.toFixed(2))
  return val
}
</script>
