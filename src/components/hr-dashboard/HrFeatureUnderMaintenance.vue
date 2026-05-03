<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-amber-100 p-10 md:p-14 animate-fade-in min-h-[400px] flex flex-col items-center justify-center text-center"
    role="status"
    aria-live="polite"
  >
    <div
      class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6"
    >
      <LucideConstruction class="w-8 h-8" aria-hidden="true" />
    </div>
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
      Under maintenance
    </h1>
    <p v-if="featureTitle" class="text-sm font-semibold text-amber-800/90 mt-2">
      {{ featureTitle }}
    </p>
    <p class="text-gray-600 max-w-md mt-4 text-sm md:text-base leading-relaxed">
      This area is temporarily unavailable while we improve it. Please check back
      soon or contact your administrator if you need help.
    </p>
  </div>
</template>

<script setup>
import { LucideConstruction } from 'lucide-vue-next'

defineProps({
  /** Optional label for which HR area is affected (shown under the main heading). */
  featureTitle: {
    type: String,
    default: '',
  },
})
</script>
