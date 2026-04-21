<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in cursor-pointer"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full mx-4 flex flex-col max-h-[90vh] cursor-default"
      :class="maxWidthClass"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
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

      <!-- Body: default scrolls; use bodyOverflowVisible for dropdowns that must escape (e.g. MultiSelect) -->
      <div
        class="p-6 custom-scrollbar flex-1 min-h-0"
        :class="bodyOverflowVisible ? 'overflow-visible' : 'overflow-y-auto overflow-x-visible'"
      >
        <slot></slot>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
        <button
          @click="$emit('close')"
          class="px-4 py-2 cursor-pointer text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          {{ cancelLabel || 'Cancel' }}
        </button>
        <button
          v-if="hasSave !== false"
          @click="$emit('save')"
          class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          :class="
            loading || saveDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-indigo-700'
          "
          :disabled="loading || saveDisabled"
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
  cancelLabel: {
    type: String,
    default: "Cancel",
  },
  maxWidthClass: {
    type: String,
    default: "max-w-lg",
  },
  hasSave: {
    type: Boolean,
    default: true,
  },
  /** When true, body does not clip overflow (fixes MultiSelect inside modal). Tall content may need scrolling outside. */
  bodyOverflowVisible: {
    type: Boolean,
    default: false,
  },
  /** Disable Save (e.g. policy validation) without hiding the button. */
  saveDisabled: {
    type: Boolean,
    default: false,
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
