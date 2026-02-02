<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full mx-4 flex flex-col max-h-[90vh]"
      :class="maxWidthClass"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto custom-scrollbar">
        <slot></slot>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 cursor-pointer text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('save')"
          class="px-4 py-2 bg-indigo-600 cursor-pointer text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          ></span>
          {{ loading ? 'Saving...' : saveLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  loading: Boolean,
  saveLabel: {
    type: String,
    default: "Save",
  },
  maxWidthClass: {
    type: String,
    default: "max-w-lg",
  },
});

defineEmits(["close", "save"]);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
