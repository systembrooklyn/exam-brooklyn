<template>
  <div
    v-show="modelValue"
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

      <h2 class="text-lg font-bold text-gray-800 mb-4">Add {{ type }}</h2>

      <!-- Select -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Field</label
        >
        <select
          v-model="form.field"
          class="w-full border focus:outline-none border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        >
          <option disabled value="">Select</option>
          <option value="Material">Material</option>
          <option value="Payment">Payment</option>
          <option value="Information">Information</option>
          <option value="Accreditation">Accreditation</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <!-- Value -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Massage
        </label>
        <textarea
          v-model="form.value"
          placeholder="Enter message"
          class="w-full border focus:outline-none border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 resize-y min-h-[100px]"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <button
          @click="submit"
          :disabled="loading"
          class="bg-indigo-600 w-30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <div
            v-if="loading"
            class="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"
          ></div>
          <span>{{ loading ? "Saving..." : "Save" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch ,defineEmits , defineProps} from "vue";
import { useRequestStore } from "../../stores/srmStore/requestStore";
import { inject } from 'vue'


const emitter = inject('emitter')

const requestStore = useRequestStore();

const props = defineProps({
  modelValue: Boolean,
  type: String,
});

const emit = defineEmits(["update:modelValue", "saved"]);



const studentId = ref(localStorage.getItem("studentId"));

const loading = ref(false);

const form = ref({
  student_id: Number(studentId.value),
  type: props.type ? props.type.toLowerCase().slice(0, -1) : "",


  field: "",
  value: "",
  comment:"comment"
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value.student_id = Number(studentId.value);
      form.value.type = props.type ? props.type.toLowerCase().slice(0, -1) : "";
      form.value.field = "";
      form.value.value = "";
    }
  }
);


const submit = async () => {

  if (form.value.field && form.value.value && form.value.type) {
    loading.value = true;
    try {
      await requestStore.addRequest(form.value);


      emit("update:modelValue", false);

   
      emitter.emit("refresh");

    
      emit("saved");

    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      loading.value = false;
    }
  }
};

</script>
