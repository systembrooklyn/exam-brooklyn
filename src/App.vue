
<script setup>
import Nav from "@/components/pages/NavBar.vue"
import { useRoute } from "vue-router"

const route = useRoute()
</script>

<template>
  <div class="dark:bg-gray-800 min-h-screen flex flex-col">
    <Nav v-if="!route.path.startsWith('/dashboard') && !route.path.startsWith('/finnance') && !route.path.startsWith('/reservation') && !route.path.startsWith('/hr')" />
    
    <router-view />
  </div>
</template>



