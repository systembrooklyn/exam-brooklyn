<template>
  <HrModal
    :show="show"
    :title="isEditing ? 'Edit Attendance Log' : 'New Attendance Log'"
    :loading="loading"
    @close="$emit('close')"
    @save="onSave"
  >
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
        <select v-model="localForm.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2">
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.name || (emp.personal_info ? (emp.personal_info.first_name + ' ' + emp.personal_info.last_name) : ('Emp #' + emp.id)) }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input v-model="localForm.date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Check In</label>
        <input v-model="localForm.check_in" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
        <input v-model="localForm.check_out" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Break In</label>
        <input v-model="localForm.break_in" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Break Out</label>
        <input v-model="localForm.break_out" type="time" step="1" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
      </div>
    </div>
  </HrModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import HrModal from '@/components/hr-dashboard/HrModal.vue';

const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  loading: Boolean,
  initialForm: Object,
  employees: Array
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
