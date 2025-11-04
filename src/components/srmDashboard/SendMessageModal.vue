<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white p-6 rounded-lg shadow-xl border text-center max-w-md w-full"
      :class="isEmail ? 'border-indigo-500' : 'border-green-500'"
    >
      <h3 class="text-lg font-semibold text-gray-800 mb-3">
        {{ isEmail ? "Send Custom Email" : "Send SMS Message" }}
      </h3>
      <p class="text-gray-600 mb-4">
        To:
        <span class="font-semibold">
          {{ recipient }}
        </span>
      </p>

      <textarea
        v-model="messageBody"
        rows="4"
        :placeholder="isEmail ? 'Write your email message...' : 'Write your SMS message...'"
        class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
        :class="isEmail ? 'focus:ring-indigo-500' : 'focus:ring-green-500'"
      ></textarea>

      <div class="flex justify-center gap-3 mt-4">
        <button
          @click="handleSend"
          :disabled="loading"
          class="text-white px-4 py-2 rounded-lg flex cursor-pointer items-center justify-center min-w-[90px] disabled:opacity-70 bg-indigo-600 hover:bg-indigo-700'"

        >
          <span v-if="!loading">Send</span>
          <span
            v-else
            class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
        </button>

        <button
          @click="$emit('close')"
          class="bg-gray-300 hover:bg-gray-400 cursor-pointer  text-gray-800 px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
<script setup >
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  type: String, 
  recipient: String,
  loading: Boolean,
});

const emits = defineEmits(["send", "close"]);

const messageBody = ref("");

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) messageBody.value = "";
  }
);


const isEmail = computed(() => props.type === "email");

const handleSend = () => {
  if (!messageBody.value.trim()) return;
  emits("send", messageBody.value);
 
};
</script>
