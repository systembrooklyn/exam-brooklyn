<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  router.replace({ name: "exam-start" });
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
</template>
