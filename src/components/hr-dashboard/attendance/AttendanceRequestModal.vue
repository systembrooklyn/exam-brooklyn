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

        <!-- Conditional: Duration — minutes from attendance table, or hours (HR Attendance page) -->
        <div v-if="['lateness', 'leave'].includes(localForm.request_type)" class="col-span-2 md:col-span-1">
          <template v-if="localForm.use_minutes_for_duration">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              v-model.number="localForm.duration_minutes"
              type="number"
              min="1"
              step="1"
              class="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. 24"
            />
          </template>
          <template v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
            <input
              v-model="localForm.duration_hours"
              type="number"
              class="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. 2"
            />
          </template>
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

        <!-- Overtime: minutes only (matches attendance report column). -->
        <div v-if="localForm.request_type === 'overtime'" class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Overtime (minutes)</label>
          <input
            v-model.number="localForm.overtime_minutes"
            type="number"
            min="1"
            step="1"
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Minutes you are requesting (not report total)"
          />
        </div>

        <!-- From/To Time — not used for leave/lateness/vacation/day off swap/work from home/overtime. -->
        <template
          v-if="
            ![
              'lateness',
              'leave',
              'vacation',
              'day_off_swap',
              'work_from_home',
              'overtime',
            ].includes(localForm.request_type)
          "
        >
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
        </template>
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
  initialForm: Object,
});

const emit = defineEmits(['close', 'save']);

const defaultForm = () => ({
  request_type: 'leave',
  day: '',
  duration_hours: null,
  duration_minutes: null,
  overtime_minutes: null,
  use_minutes_for_duration: false,
  prefill_early_leave_minutes: null,
  prefill_lateness_minutes: null,
  prefill_overtime_minutes: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full',
});

const localForm = ref(defaultForm());

/** Sync only when the modal opens — avoids deep `initialForm` resets wiping user input (e.g. OT minutes). */
watch(
  () => props.show,
  (open) => {
    if (!open) return;
    const newVal = props.initialForm;
    localForm.value = {
      ...defaultForm(),
      ...(newVal && typeof newVal === 'object' ? { ...newVal } : {}),
    };
  },
  { immediate: true },
);

/** When using table minutes: switching Leave ↔ Lateness refills from that day’s early leave / lateness. */
watch(
  () => [localForm.value.request_type, props.show],
  () => {
    if (!props.show || !localForm.value.use_minutes_for_duration) return;
    const t = localForm.value.request_type;
    if (t === 'leave') {
      const v = Number(props.initialForm?.prefill_early_leave_minutes);
      localForm.value.duration_minutes =
        Number.isFinite(v) && v > 0 ? v : null;
    } else if (t === 'lateness') {
      const v = Number(props.initialForm?.prefill_lateness_minutes);
      localForm.value.duration_minutes =
        Number.isFinite(v) && v > 0 ? v : null;
    }
  },
);

watch(
  () => localForm.value.request_type,
  (t) => {
    if (
      t === 'lateness' ||
      t === 'leave' ||
      t === 'vacation' ||
      t === 'day_off_swap' ||
      t === 'work_from_home' ||
      t === 'overtime'
    ) {
      localForm.value.from_time = '';
      localForm.value.to_time = '';
    }
    /* Overtime minutes: only what the user types — do not inject report total (prefill). */
  },
);

const onSave = () => {
  emit('save', { ...localForm.value });
};
</script>
