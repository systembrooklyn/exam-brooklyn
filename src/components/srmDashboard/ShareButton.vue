<template>
  <button
    class="flex items-center gap-2 border border-blue-400 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
  >
    <component :is="iconComponent" :class="['w-5 h-5', color]" />
    <span class="font-semibold text-black dark:text-white">{{ text }}</span>
  </button>
</template>

<script setup>
import {
  Mail,
  MessageSquare,
  Share2,
  QrCode,
  AppWindow,
} from 'lucide-vue-next'

const props = defineProps({
  icon: String,
  text: String,
  color: String,
})

const iconComponent = {
  Mail,
  MessageSquare,
  Share2,
  QrCode,
  AppWindow,
}[props.icon]
</script>
