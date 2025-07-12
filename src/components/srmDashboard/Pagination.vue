<template>
  <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center space-x-2">
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      Previous
    </button>

    <button
      v-for="(page, index) in pageNumbers"
      :key="index"
      @click="goToPage(page)"
      class="px-3 py-1 border rounded"
      :class="{
        'bg-indigo-600 text-white font-bold rounded-full': page === currentPage,
        'bg-white text-gray-700 hover:bg-gray-100': page !== currentPage,
        'cursor-default': page === '...',
      }"
      :disabled="page === '...'"
    >
      {{ page }}
    </button>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      Next
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  pageNumbers: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:current-page"]);

function goToPage(page) {
  if (page === "...") return;
  emit("update:current-page", page);
}
</script>