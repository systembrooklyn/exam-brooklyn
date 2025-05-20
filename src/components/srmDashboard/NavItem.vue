<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  icon: Object,
  label: String,
  to: String
})

const route = useRoute()

const isActive = computed(() => route.path === props.to)
</script>

<template>
  <router-link
    :to="to"
    class="flex items-center gap-3 p-3 rounded-lg transition-all font-medium"
    :class="{
      'bg-indigo-100 text-indigo-700 font-semibold': isActive,
      'text-gray-600 hover:bg-gray-200': !isActive
    }"
  >
    <component :is="icon" class="w-5 h-5" />
    {{ label }}
  </router-link>
</template>
