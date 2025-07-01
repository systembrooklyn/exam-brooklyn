<template>
  <div class="flex min-h-screen bg-blue-50">
    <!-- Sidebar -->
    <Sidebar /> 

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <NavBar />

      <!-- Content area -->
      <main class="flex-1 px-1 bg-indigo-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import NavBar from './NavBar.vue'
</script>
