<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center px-4">
      <!-- Success Icon SVG -->
      <svg
        class="w-24 h-24 text-green-500 mb-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12l2 2 4-4m-6.5 8a9 9 0 1112.7-12.7A9 9 0 012.5 12z"
        />
      </svg>
  
      <h1 class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
        Reservation Confirmed!
      </h1>
  
      <p class="text-gray-700 dark:text-gray-300 mb-6">
        Thank you! Your reservation has been successfully submitted.
      </p>
  
      <button
        @click="router.push({ name: 'SystemsPage' })"
        class=" cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl transition"
      >
        Go Home
      </button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  
  </script>
  