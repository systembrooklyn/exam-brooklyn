<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
  >
    <div class="bg-white max-w-md w-full p-6 rounded-lg shadow-lg relative">
      <!-- Close -->
      <button
        @click="$emit('update:modelValue', false)"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
      >
        &times;
      </button>

      <h2 class="text-lg font-bold text-gray-800 mb-4">Add Request Field</h2>

      <!-- Select -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          v-model="form.type"
          class="w-full border focus:outline-none border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        >
          <option disabled value="">Select type</option>
          <option value="request">request</option>
          <option value="complain">complain</option>
          <option value="edit">edit</option>
        </select>
      </div>

      <!-- Field -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Field</label
        >
        <input
          v-model="form.field"
          type="text"
          placeholder="Enter field"
          class="w-full border focus:outline-none border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <!-- Value -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Value</label
        >
        <input
          v-model="form.value"
          type="text"
          placeholder="Enter value"
          class="w-full border focus:outline-none border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <button
          @click="$emit('update:modelValue', false)"
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          @click="submit"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref ,watch } from "vue";
import { useRequestStore } from "../../stores/srmStore/requestStore";



const requestStore = useRequestStore();

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "saved"]);
const studentId = ref(localStorage.getItem("studentId"));

const form = ref({
  student_id: studentId.value,
  type: "request",
  field: "",
  value: "",
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value.student_id = props.studentId;
      form.value.type = "request";
      form.value.field = "";
      form.value.value = "";
    }
  }
);

const submit = async () => {
  console.log(form.value);

  if (form.value.field && form.value.value && form.value.type) {
    try {
      const res = await requestStore.addRequest(form.value);
      emit("saved", res.data);
      emit("update:modelValue", false);
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  }
};
</script>
