<template>
  <div class="flex h-screen overflow-hidden bg-blue-50">
    <!-- Sidebar -->
    <Sidebar class="h-full" /> 

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Navbar -->
      <NavBar />

      <!-- Content area -->
      <main class="flex-1 px-1 bg-indigo-50 pb-5 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import NavBar from './NavBar.vue'
</script>
