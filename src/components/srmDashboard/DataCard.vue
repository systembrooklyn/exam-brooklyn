<!-- components/srmDashboard/DataCard.vue -->
<template>
  <div
    :class="[
      'flex items-center justify-between gap-5  p-5 rounded-2xl cursor-pointer shadow hover:shadow-2xl transition duration-300 ease-in-out',
      'dark:bg-gray-800 bg-white',
      colorClass,
    ]"
  >
    <component :is="icon" class="w-12 h-12 shrink-0" />

    <div class="flex-1">
      <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        {{ title }}
      </h3>

      <template v-if="Array.isArray(items)">
        <ul class="space-y-1 text-gray-700 dark:text-gray-300">
          <li v-for="(it, i) in items" :key="i">{{ it }}</li>
        </ul>
      </template>
      <template v-else>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ items }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,

  items: { type: [String, Number, Array], default: "" },

  icon: { type: [Object, Function], required: true },

  colorClass: { type: String, default: "" },
});
</script>
