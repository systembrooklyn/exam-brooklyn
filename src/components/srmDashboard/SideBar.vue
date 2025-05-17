<template>
  <div class="flex min-h-screen bg-gray-100 ">
    <!-- Sidebar -->
    <aside class="w-70 bg-white shadow-lg shadow-blue-300 flex flex-col ">
      <div class="flex flex-col items-center py-6 border-b">
       <img
  :src="img || 'https://via.placeholder.com/100'"
  class="w-20 h-20 rounded-full"
/>

        <h2 class="mt-2 font-semibold text-gray-800">{{ name }}</h2>
        <p class="text-sm text-gray-400">{{num}}</p>
      </div>
      <nav class="flex-1 px-4 pt-6 space-y-2">
        <NavItem v-for="item in navItems" class="text-red" :key="item.label" v-bind="item" />
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavItem from './NavItem.vue';
import { LayoutDashboard, GraduationCap, Users } from 'lucide-vue-next';


const props = defineProps({
  img: {
    type: String,
  },
  name: {
    type: String,
  },
  num: {
    type: String,
  },
})

const navItems = ref([
  { icon: LayoutDashboard, label: 'My Dashboard', to: '/dashboard' },
  { icon: GraduationCap, label: 'Students', to: '/students' },
  { icon: Users, label: 'Teachers', to: '/teachers' },
])


</script>