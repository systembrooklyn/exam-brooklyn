<script setup>
    import { Send } from 'lucide-vue-next';
const emit = defineEmits(['submit']);
</script>

<template>
  <div class="flex flex-col gap-3">

    <button 
      class="bg-indigo-600 text-white p-3 rounded-lg font-semibold shadow"
      @click="emit('submit')">
      SUBMIT
      <Send class="inline w-5 h-5"/>
    </button>

    <button class="bg-green-600 text-white p-3 rounded-lg font-semibold shadow">
      Temporary Receipt
    </button>

  </div>
</template>
