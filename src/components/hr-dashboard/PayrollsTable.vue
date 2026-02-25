<template>
  <div>
    <HrDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      emptyMessage="No payrolls found."
    >
      <template #employee="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-gray-800">{{ item.employee?.name || 'N/A' }}</span>
          <span class="text-xs text-gray-500">{{ item.employee?.job_title || '' }}</span>
        </div>
      </template>

      <template #status="{ value }">
        <PayrollStatusBadge :status="value" />
      </template>

      <template #period="{ item }">
        <div class="text-xs text-gray-600">
          {{ item.period_from }} - {{ item.period_to }}
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('view', item)"
            class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <LucideEye class="w-4 h-4" />
          </button>
          
          <!-- Approval Actions based on job title and status -->
          <div v-if="canAction(item)" class="flex items-center gap-1 border-l pl-2 ml-1">
            <button 
              @click="$emit('update-status', { item, status: successStatus })"
              class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              :title="successLabel"
            >
              <LucideCheckCircle class="w-4 h-4" />
            </button>
            <button 
              @click="$emit('update-status', { item, status: 'rejected' })"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Reject"
            >
              <LucideXCircle class="w-4 h-4" />
            </button>
            <button 
              v-if="['pending', 'hr-approved'].includes(item.status)"
              @click="$emit('update-status', { item, status: 'suspended' })"
              class="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Suspend"
            >
              <LucidePauseCircle class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>
    </HrDataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import PayrollStatusBadge from './PayrollStatusBadge.vue';
import { LucideEye, LucideCheckCircle, LucideXCircle, LucidePauseCircle } from 'lucide-vue-next';

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  userRole: { type: String, default: '' } // hr, gm, accountant, employee
});

defineEmits(['view', 'update-status']);

const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Period', key: 'period' },
  { label: 'Fixed Salary', key: 'fixed_salary' },
  { label: 'Net Salary', key: 'net_salary' },
  { label: 'Status', key: 'status' },
  { label: 'Actions', key: 'actions' },
];

const canAction = (item) => {
  const role = props.userRole?.toLowerCase();
  const status = item.status;

  if (role.includes('hr') && status === 'pending') return true;
  if (role.includes('gm') && status === 'hr-approved') return true;
  if (role.includes('accountant') && status === 'gm-approved') return true;
  if (role.includes('employee') && status === 'paid') return true;
  
  return false;
};

const successStatus = computed(() => {
  const role = props.userRole?.toLowerCase();
  if (role.includes('hr')) return 'hr-approved';
  if (role.includes('gm')) return 'gm-approved';
  if (role.includes('accountant')) return 'paid';
  if (role.includes('employee')) return 'received';
  return '';
});

const successLabel = computed(() => {
  const role = props.userRole?.toLowerCase();
  if (role.includes('hr')) return 'HR Approve';
  if (role.includes('gm')) return 'GM Approve';
  if (role.includes('accountant')) return 'Mark as Paid';
  if (role.includes('employee')) return 'Mark as Received';
  return 'Approve';
});
</script>
