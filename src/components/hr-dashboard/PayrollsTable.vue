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
        <div class="text-xs text-gray-600">
          {{ item.period?.payroll_month || item.period_from || '-' }}
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
          <div v-if="canAction(item)" class="flex items-center gap-1 border-l pl-2 ml-1">
            <!-- Approve -->
            <button
              @click="$emit('update-status', { item, status: successStatus })"
              class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              :title="successLabel"
            >
              <LucideCheckCircle class="w-4 h-4" />
            </button>

            <!-- Suspend -->
            <button
              @click="$emit('update-status', { item, status: 'suspended' })"
              class="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
              title="Suspend"
            >
              <LucidePauseCircle class="w-4 h-4" />
            </button>

            <!-- Reject -->
            <button
              @click="$emit('update-status', { item, status: 'rejected' })"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Reject"
            >
              <LucideXCircle class="w-4 h-4" />
            </button>

            <!--
            <button
              v-if="['pending','hr-approved'].includes(item.current_status)"
              @click="$emit('update-status', { item, status: 'suspended' })"
              class="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Suspend"
            >
              <LucidePauseCircle class="w-4 h-4" />
            </button>
            -->
          </div>
        </div>
      </template>

    </HrDataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue'
import PayrollStatusBadge from './PayrollStatusBadge.vue'
import { LucideEye, LucideCheckCircle, LucideXCircle, LucidePauseCircle } from 'lucide-vue-next'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  userRole: { type: String, default: '' },
  fetchingId: { type: [Number, String, null], default: null }
})

defineEmits(['view', 'update-status'])

const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Month', key: 'period' },
  { label: 'Fixed Salary', key: 'fixed_salary' },
  { label: 'Net Salary', key: 'net_salary' },
  { label: 'Status', key: 'status' },
]

const canAction = () => {
  return true
}

const successStatus = computed(() => {
  const role = props.userRole?.toLowerCase()

  if (role.includes('hr manager') || role.includes('hr-manager')) return 'hr-manager-approved'
  if (role.includes('hr')) return 'hr-approved'
  if (role.includes('gm')) return 'gm-approved'
  if (role.includes('accountant')) return 'paid'
  if (role.includes('employee')) return 'received'

  return ''
})

const successLabel = computed(() => {
  const role = props.userRole?.toLowerCase()

  if (role.includes('hr manager') || role.includes('hr-manager')) return 'HR Manager Approve'
  if (role.includes('hr')) return 'HR Approve'
  if (role.includes('gm')) return 'GM Approve'
  if (role.includes('accountant')) return 'Mark as Paid'
  if (role.includes('employee')) return 'Mark as Received'

  return 'Approve'
})
</script>