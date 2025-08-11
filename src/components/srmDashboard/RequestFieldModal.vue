<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
  >
    <div class="relative w-full max-w-lg px-4 sm:px-0">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-700 overflow-hidden"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white"
        >
          <h2 class="text-base sm:text-lg font-semibold tracking-wide">Add {{ type }}</h2>
          <button
            @click="$emit('update:modelValue', false)"
            aria-label="Close"
            class="h-8 w-8 grid place-items-center rounded-full/50 hover:bg-white/15 transition"
          >
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 pt-5 pb-2 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field</label>
            <select
              v-model="form.field"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option disabled value="">Select</option>
              <option value="Material">Material</option>
              <option value="Payment">Payment</option>
              <option value="Information">Information</option>
              <option value="Accreditation">Accreditation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              v-model="form.value"
              placeholder="Enter message"
              rows="6"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[140px]"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 pt-2 flex justify-end gap-2">
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="loading || !form.field || !form.value?.trim()"
            class="px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ring-1 ring-indigo-500/10 flex items-center gap-2 transition"
          >
            <div
              v-if="loading"
              class="border-2 border-white/70 border-t-transparent rounded-full w-4 h-4 animate-spin"
            ></div>
            <span>{{ loading ? "Saving..." : "Save" }}</span>
          </button>
        </div>
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
