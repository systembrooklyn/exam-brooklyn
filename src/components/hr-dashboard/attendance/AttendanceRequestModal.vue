<template>
  <HrModal
    :show="show"
    title="Create Request"
    :loading="loading"
    @close="$emit('close')"
    @save="onSave"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
        <select v-model="localForm.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
          <option value="lateness">Lateness</option>
          <option value="leave">Leave</option>
          <option value="overtime">Overtime</option>
          <option value="vacation">Vacation</option>
          <option value="day_off_swap">Day Off Swap</option>
          <option value="work_from_home">Work From Home</option>
          <option value="shift_move">Shift Move</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input v-model="localForm.day" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>

        <!-- Conditional: Duration Hours (Lateness/Leave) -->
        <div v-if="['lateness', 'leave'].includes(localForm.request_type)" class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
          <input v-model="localForm.duration_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 2" />
        </div>

        <!-- Conditional: Day Replacement (Day Off Swap) -->
        <div v-if="localForm.request_type === 'day_off_swap'" class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
          <input v-model="localForm.day_replacement" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>

        <!-- Conditional: Duration Type (Vacation) -->
        <div v-if="localForm.request_type === 'vacation'" class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
          <select v-model="localForm.duration_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
          </select>
        </div>

        <!-- From/To Time (Optional for most, usually for Overtime/Leave) -->
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">From Time</label>
          <input
            v-model="localForm.from_time"
            type="time"
            step="1"
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
          <input
            v-model="localForm.to_time"
            type="time"
            step="1"
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
      </div>
    </div>
  </HrModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import HrModal from '@/components/hr-dashboard/HrModal.vue';

const props = defineProps({
  show: Boolean,
  loading: Boolean,
  initialForm: Object
});

const emit = defineEmits(['close', 'save']);

const localForm = ref({ ...props.initialForm });

watch(() => props.initialForm, (newVal) => {
  localForm.value = { ...newVal };
}, { deep: true });

const onSave = () => {
  emit('save', { ...localForm.value });
};
</script>
