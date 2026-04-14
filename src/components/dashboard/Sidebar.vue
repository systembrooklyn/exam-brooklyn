<template>
  <transition name="slide">
    <aside v-if="isSidebarOpen" class="fixed md:static md:block w-64 min-h-screen bg-white shadow-lg z-50"
      :style="{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }">
      <X @click="isSidebarOpen = false"
        class="cursor-pointer md:hidden absolute top-4 w-4 h-4 right-4 hover:text-gray-400" />
      <div class="p-4 font-bold pb-8 pt-8 text-xl flex justify-between items-center">

        <h1 class="font-bold text-primary">Brooklyn</h1>
        <img src="../../assets/logo.png" class="h-10" alt="" />

      </div>
      <ul class="space-y-2">
        <SidebarItem v-for="item in activeItems" :key="item.name" :item="item" />

      </ul>
    </aside>
  </transition>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import SidebarItem from './SidebarItem.vue'
import { items } from './itemsLink'
import { itemfinnance } from '../finnance-dahboard/sideItem'
import { buildHrSidebarItems, filterHrSidebarItems } from '../hr-dashboard/sideItem'
import { X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { itemReservation } from '../Reservation/itemReservation'



const authStore = useAuthStore()
const router = useRouter();
const route = useRoute();



const isSidebarOpen = ref(true)  
const emitter = inject('emitter')

function getRouteMeta(routeName) {
  const route = router.getRoutes().find(r => r.name === routeName)
  return route?.meta || {}
}


const filteredDashboardItems = computed(() =>
  items
    .map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          const meta = getRouteMeta(child.route)
          return !meta.requiresPermission || authStore.hasPermission(meta.requiresPermission)
        })

        return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
      }

      const meta = getRouteMeta(item.route)
      return !meta.requiresPermission || authStore.hasPermission(meta.requiresPermission) ? item : null
    })
    .filter(Boolean)
)

const activeItems = computed(() => {
  if (route.path.startsWith('/finnance')) {
    return itemfinnance
    
  }
  if (route.path.startsWith('/hr')) {
    const raw = buildHrSidebarItems(
      authStore.canManageFullAttendance,
      authStore.isAdminUser,
    );
    return filterHrSidebarItems(raw, (slug) => authStore.can(slug));
  }
    if (route.path.startsWith('/reservation')) {
    return itemReservation
  }
  return filteredDashboardItems.value
})
onMounted(() => {
  if (emitter) {
    emitter.on('toggle-sidebar', (isOpen) => {
      isSidebarOpen.value = isOpen
    })
  } else {
    console.error('Emitter is not available')
  }
})
</script>

<style scoped>
/* Apply smooth transition on transform */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
