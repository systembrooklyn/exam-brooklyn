<!-- components/NavItem.vue -->
<template>
  <router-link
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700 font-medium"
  >
    <component :is="icon" class="w-5 h-5 text-[#6c63ff]" />
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup>
const props = defineProps({
  icon: Object, // 👈 أو type: [Object, Function]
  label: String,
  to: String
})
</script>
