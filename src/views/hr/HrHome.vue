<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
    <!-- Stat Card 1 -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Total Employees</p>
        <h2 class="text-3xl font-bold text-gray-800">124</h2>
        <p class="text-xs text-green-600 mt-2 flex items-center gap-1">
          <span class="bg-green-100 px-1 rounded">↑ 12%</span> vs last month
        </p>
      </div>
      <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
        <Users class="w-6 h-6" />
      </div>
    </div>

    <!-- Stat Card 2 -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Active Contracts</p>
        <h2 class="text-3xl font-bold text-gray-800">118</h2>
         <p class="text-xs text-gray-400 mt-2">All time</p>
      </div>
      <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
        <FileText class="w-6 h-6" />
      </div>
    </div>

     <!-- Stat Card 3 -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Departments</p>
        <h2 class="text-3xl font-bold text-gray-800">8</h2>
         <p class="text-xs text-gray-400 mt-2">Operational</p>
      </div>
      <div class="p-3 bg-orange-50 rounded-xl text-orange-600">
        <Building class="w-6 h-6" />
      </div>
    </div>
    
     <!-- Stat Card 4 -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Open Positions</p>
        <h2 class="text-3xl font-bold text-gray-800">12</h2>
         <p class="text-xs text-red-500 mt-2">Urgent hiring</p>
      </div>
      <div class="p-3 bg-red-50 rounded-xl text-red-600">
        <Briefcase class="w-6 h-6" />
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in delay-100">
      <!-- Quick Actions / Some Chart Placeholder -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col justify-center items-center text-gray-400">
        <p>Employee Growth Chart Placeholder</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col justify-center items-center text-gray-400">
         <p>Recent Activities Placeholder</p>
      </div>
  </div>
</template>

<script setup>
import { Users, FileText, Building, Briefcase } from 'lucide-vue-next';
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards; 
  opacity: 0;
}
.delay-100 {
  animation-delay: 0.1s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
