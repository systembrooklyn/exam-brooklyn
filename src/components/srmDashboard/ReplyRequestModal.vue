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
          <h2 class="text-base sm:text-lg font-semibold tracking-wide">
            Reply
          </h2>
          <button
            @click="$emit('update:modelValue', false)"
            aria-label="Close"
            class="h-8 w-8 grid place-items-center rounded-full/50 hover:bg-white/15 transition"
          >
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 pt-5 pb-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Your Message</label
          >
          <textarea
            v-model="form.emp_res"
            placeholder="Write a clear and concise reply..."
            rows="6"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[140px]"
          ></textarea>
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
            @click="handleSubmit"
            :disabled="loadingReply || !form.emp_res?.trim()"
            class="px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ring-1 ring-indigo-500/10 flex items-center gap-2 transition"
          >
            <div
              v-if="loadingReply"
              class="border-2 border-white/70 border-t-transparent rounded-full w-4 h-4 animate-spin"
            ></div>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: Boolean,
  fieldKey: String,
  loadingReply: Boolean,
});

const emit = defineEmits(["update:modelValue", "send-reply"]);

const form = ref({
  emp_res: "",
});

const handleSubmit = async () => {
  const keyToSend = props.fieldKey ?? "emp_res";
  emit("send-reply", {
    key: keyToSend,
    value: form.value.emp_res,
  });
};
</script>
