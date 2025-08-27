<template>
  <div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-800">
    <h1
      class="text-3xl font-bold dark:text-white text-center mb-10 text-blue-900"
    >
      Welcome to the Company Portal
    </h1>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
    >
      <div
        v-for="(system, index) in filteredSystems"
        :key="index"
        class="bg-white dark:bg-gray-500 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 cursor-pointer hover:scale-105 transform"
      >
        <RouterLink
          :to="system.route"
          class="block text-center"
          v-if="system.route"
        >
          <img
            :src="system.image"
            :alt="system.name"
            class="h-32 mx-auto mb-4"
          />
          <h2 class="text-xl font-semibold text-blue-800">{{ system.name }}</h2>
        </RouterLink>
        <a :href="system.link" target="_blank" class="block text-center" v-else>
          <img
            :src="system.image"
            :alt="system.name"
            class="h-32 mx-auto mb-4"
          />
          <h2 class="text-xl font-semibold text-blue-800">{{ system.name }}</h2>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { computed } from "vue";
import onetask from "@/assets/exam.png";
import dashboard from "@/assets/dashbord.jpeg";
import reservation from "@/assets/reservation.jpeg";
import Placement from "@/assets/plasment.jpeg";
import srm from "@/assets/srm.png";
import finnance from "@/assets/finnance.png";
import { useAuthStore } from "@/stores/auth";

const systems = [
  {
    name: "Exams Portal",
    route: "/home",
    image: onetask,
    requiresPermission: "view-examPortalCard",
  },
  {
    name: "One Task System",
    link: "https://www.1task.net/",
    image:
      "https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202",
   requiresPermission: "view-1taskCard",
    },

  {
    name: "Dashboard",
    route: "/dashboard",
    image: dashboard,
    requiresPermission: "view-dashboardCard",
  },
  {
    name: "Reservation System",
    route: "/reservation",
    image: reservation,
    requiresPermission: "view-reservationCard",
  },
  {
    name: "Placement Test",
    route: "/placement-test",
    image: Placement,
    requiresPermission: "view-placementTestCard",
  },
  {
    name: "SRM System",
    route: "/srm",
    image: srm,
    requiresPermission: "view-srmCard",
  },
  {
    name: "finnance system",
    route: "/finnance",
    image: finnance,
    requiresPermission: "view-financeCard",
  },
];

const authStore = useAuthStore();

const filteredSystems = computed(() => {
  return systems.filter((system) => {
    if (system.requiresPermission) {
      return authStore.hasPermission(system.requiresPermission);
    }
    return true;
  });
});
</script>

<style scoped></style>
