<template>
  <HrModal
    :show="show"
    title="Create Request"
    :loading="loading"
    :save-disabled="latenessSaveBlocked || latenessBlockedByWarningHour"
    @close="$emit('close')"
    @save="onSave"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
        <select v-model="localForm.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
          <option value="lateness">Lateness</option>
          <option value="leave">Leave</option>
          <option value="overtime">Overtime (total)</option>
          <option value="overtime_before">Overtime (before shift)</option>
          <option value="overtime_after">Overtime (after shift)</option>
          <option value="vacation">Vacation</option>
          <option value="day_off_swap">Day Off Swap</option>
          <option value="work_from_home">Work From Home</option>
          <option value="shift_move">Shift Move</option>
        </select>
        <p
          v-if="shiftOvertimeHintLines.length"
          class="mt-2 text-xs text-gray-600 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2"
        >
          <span class="font-semibold text-indigo-900 block mb-1">Report overtime this day</span>
          <span v-for="(line, i) in shiftOvertimeHintLines" :key="i" class="block">{{ line }}</span>
          <span class="block mt-1 text-gray-500">
            Choose <strong>Overtime (total)</strong> for the full day, or <strong>before / after shift</strong> for one segment — date only; the server calculates minutes.
          </span>
        </p>
        <p
          v-if="latenessSaveBlocked"
          class="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
          role="status"
        >
          Lateness of {{ latenessGraceMinutes }} minutes or less is covered by the grace period. You cannot submit a
          lateness request for this amount.
        </p>
        <p
          v-if="latenessBlockedByWarningHour"
          class="mt-2 text-sm text-amber-950 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2"
          role="status"
        >
          This day was calculated with <strong>adjusted hour</strong> rules. A <strong>lateness</strong> request does
          not apply — choose another request type if needed.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input v-model="localForm.day" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <p
            v-if="isDayOnlyOvertimeRequestTypeSlug(localForm.request_type)"
            class="mt-1 text-xs text-gray-500"
          >
            Only this date is sent — minutes are calculated on the server from shift and punches.
          </p>
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

        <!-- From/To Time — not used for leave/lateness/vacation/day off swap/work from home/overtime (server-calculated). -->
        <template
          v-if="
            ![
              'lateness',
              'leave',
              'vacation',
              'day_off_swap',
              'work_from_home',
              'overtime',
              'overtime_before',
              'overtime_after',
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
import { ref, watch, computed, nextTick } from 'vue';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import {
  isDayOnlyOvertimeRequestTypeSlug,
  normalizeRequestTypeSlug,
} from '@/utils/employeeRequestApi';
import { LATENESS_GRACE_MINUTES as latenessGraceMinutes } from '@/constants/hrLateness';

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
  prefill_overtime_before_minutes: null,
  prefill_overtime_after_minutes: null,
  /** Set from monthly report when API marks the day (is_warning_hour). */
  is_warning_hour: false,
  /** Employee the monthly report row belongs to (HR drawer); passed through on save. */
  subject_employee_id: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full',
});

const localForm = ref(defaultForm());

const shiftOvertimeHintLines = computed(() => {
  const b = Number(localForm.value.prefill_overtime_before_minutes);
  const a = Number(localForm.value.prefill_overtime_after_minutes);
  const lines = [];
  if (Number.isFinite(b) && b > 0) lines.push(`Before shift: ${b}m`);
  if (Number.isFinite(a) && a > 0) lines.push(`After shift: ${a}m`);
  return lines;
});

/** Effective lateness duration in minutes for grace check (table flow uses minutes; HR page may use hours). */
const effectiveLatenessMinutes = computed(() => {
  if (localForm.value.request_type !== 'lateness') return null;
  if (localForm.value.use_minutes_for_duration) {
    const m = Number(localForm.value.duration_minutes);
    if (Number.isFinite(m) && m > 0) return m;
    const p = Number(localForm.value.prefill_lateness_minutes);
    if (Number.isFinite(p) && p > 0) return p;
    return null;
  }
  const h = Number(localForm.value.duration_hours);
  if (!Number.isFinite(h) || h <= 0) return null;
  return Math.round(h * 60);
});

const latenessSaveBlocked = computed(() => {
  const m = effectiveLatenessMinutes.value;
  if (m == null) return false;
  return m > 0 && m <= latenessGraceMinutes;
});

const latenessBlockedByWarningHour = computed(() => {
  if (localForm.value.request_type !== 'lateness') return false;
  const w = localForm.value.is_warning_hour;
  return (
    w === true ||
    w === 1 ||
    String(w) === '1' ||
    String(w).toLowerCase() === 'true'
  );
});

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
    if (isDayOnlyOvertimeRequestTypeSlug(t)) return;
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
      isDayOnlyOvertimeRequestTypeSlug(t)
    ) {
      localForm.value.from_time = '';
      localForm.value.to_time = '';
    }
  },
);

const onSave = async () => {
  if (latenessSaveBlocked.value || latenessBlockedByWarningHour.value) return;
  await nextTick();
  const f = { ...localForm.value };
  f.request_type = normalizeRequestTypeSlug(f.request_type);
  emit('save', f);
};
</script>
