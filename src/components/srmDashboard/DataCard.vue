<template>
  <div class="bg-white flex items-center  gap-10 dark:bg-gray-800 p-5 rounded-2xl shadow">
     <component :is="img" class="w-20 h-20 text-indigo-500 shrink-0" />
   <div>
     <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{{ title }}</h3>
    <ul class="space-y-2 text-gray-700 dark:text-gray-300">
      <li v-if="!items || items.length === 0">No data available</li>
      <li v-for="(item, index) in items" :key="index">
        {{ item.name || item.status || JSON.stringify(item).slice(0, 40) + '...' }}
      </li>
    </ul>
   </div>
   
  </div>
</template>

<script setup>
defineProps({
  title: String,
  items: Array,
  img : [String, Object, Function]

});
</script>
