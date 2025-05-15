<!-- components/BaseLoader.vue -->
<template>
  <Loading :active="show" :can-cancel="false" is-full-page color="#2563eb" loader="bars"  :width="100" :height="100"/>
</template>

<script setup>
import { defineProps } from 'vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})
</script>
