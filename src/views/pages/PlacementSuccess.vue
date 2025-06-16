<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6 text-center">
    <img
      src="https://cdn-icons-png.flaticon.com/512/3159/3159066.png"
      alt="Success"
      class="w-40 h-40 mb-6 animate-bounce"
    />
    <h1 class="text-3xl md:text-4xl font-bold text-green-700 mb-4">لقد أنهيت الامتحان بنجاح! 🎉</h1>
    <p class="text-lg text-gray-700 mb-6">
      شكرًا لمشاركتك في الاختبار. سيتم مراجعة نتائجك قريبًا.
    </p>
    <router-link
      to="/"
      class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition duration-300"
    >
      العودة إلى الصفحة الرئيسية
    </router-link>
  </div>
</template>

<script setup>
// لا حاجة لأي سكريبت خاص هنا إلا لو هتعملي redirect تلقائي
</script>

<style scoped>
</style>
