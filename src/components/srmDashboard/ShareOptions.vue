<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
    <h2 class="text-xl font-bold mb-6 text-[#6c63ff] dark:text-white text-center">Share Options</h2>
    <div class="flex flex-wrap gap-4 justify-center">
      <ShareButton icon="Mail" text="Email" color="text-red-600" />
      <ShareButton icon="MessageSquare" text="SMS" color="text-green-600" />
      <ShareButton icon="Share2" text="Online Share" color="text-blue-600" />
      <ShareButton icon="QrCode" text="QR" color="text-black" />
      <ShareButton icon="AppWindow" text="App" color="text-yellow-500" />
    </div>
  </div>
</template>

<script setup>
import ShareButton from './ShareButton.vue'
</script>
