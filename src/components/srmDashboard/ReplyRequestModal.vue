<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md relative p-6">
      <!-- Close Button -->
      <button
        @click="$emit('update:modelValue', false)"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
      >
        &times;
      </button>

      <!-- Modal Title -->
      <h2 class="text-lg font-semibold mb-4 text-gray-800">Reply</h2>

      <!-- Textarea -->
      <textarea
        v-model="form.emp_res"
        placeholder="Enter your message"
        rows="5"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
      ></textarea>

      <!-- Submit Button -->
      <button
        @click="handleSubmit"
        :disabled="loadingReply"
        class="mt-4 w-30 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded flex items-center justify-center"
      >
        <div
          v-if="loadingReply"
          class="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"
        ></div>
        <span>{{ loadingReply ? "Saving..." : "Save" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { inject } from 'vue'


const emitter = inject('emitter')

const props = defineProps({
  modelValue: Boolean,
  fieldKey: String,
  loadingReply:Boolean,
});

const emit = defineEmits(["update:modelValue", "send-reply"]);

const send = () => {
  emitter.emit("refresh")
}

const form = ref({
  emp_res: "",
});

const handleSubmit = async () => {
  const keyToSend = props.fieldKey ?? "emp_res";
  emit("send-reply", {
    key: keyToSend,
    value: form.value.emp_res,
  });
  send()
};
</script>
