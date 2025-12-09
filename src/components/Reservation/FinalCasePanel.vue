<script setup>
const props = defineProps({
  modelValue: Object
});
const emit = defineEmits(['update:modelValue']);

const updateField = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>

<template>
  <div class="card p-6 space-y-4">
    <h2 class="text-xl font-bold text-indigo-600 border-b pb-2">Final Case Details</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Final Case -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Final Case</label>
        <div class="relative">
          <select
            class="select-field"
            :value="modelValue.finalCase"
            @change="updateField('finalCase', $event.target.value)"
          >
            <option value="" disabled selected>Select Final Case</option>
            <option>RESERVATION</option>
            <option>MANUAL</option>
            <option>MANUAL EXAM</option>
            <option>Extend</option>
            <option>CANCELLATION</option>
          </select>
        </div>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
        <input 
          class="input-field"
          type="number"
          :value="modelValue.finalAmount"
          @input="updateField('finalAmount', $event.target.value)" 
          placeholder="Enter Amount"
        />
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
      <textarea 
        class="input-field min-h-[120px] resize-none"
        :value="modelValue.notes"
        @input="updateField('notes', $event.target.value)"
        placeholder="Add any additional notes..."
      ></textarea>
    </div>

  </div>
</template>
