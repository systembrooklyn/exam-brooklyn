<template>
  <span :class="statusClasses" class="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const statusMap = {
  'pending': { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
  'hr-approved': { label: 'HR Approved', class: 'bg-blue-100 text-blue-700' },
  'gm-approved': { label: 'GM Approved', class: 'bg-purple-100 text-purple-700' },
  'gm-approved-suspended': { label: 'GM Approved (Suspended)', class: 'bg-orange-100 text-orange-700' },
  'suspended': { label: 'Suspended', class: 'bg-orange-100 text-orange-700' },
  'rejected': { label: 'Rejected', class: 'bg-red-100 text-red-700' },
  'paid': { label: 'Paid', class: 'bg-emerald-100 text-emerald-700' },
  'received': { label: 'Received', class: 'bg-indigo-100 text-indigo-700' }
};

const statusLabel = computed(() => statusMap[props.status]?.label || props.status);
const statusClasses = computed(() => statusMap[props.status]?.class || 'bg-gray-100 text-gray-700');
</script>
