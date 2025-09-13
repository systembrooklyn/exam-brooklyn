<template>
  <div class="flex min-h-screen bg-blue-50">
    <!-- Sidebar -->
    <Sidebar /> 

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <NavBar />

      <!-- Content area -->
      <main class=" p-4 bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavBar from '../dashboard/NavBar.vue';
import Sidebar from '../dashboard/Sidebar.vue';


</script>
