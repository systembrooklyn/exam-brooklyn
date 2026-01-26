// Vue 3 Composition API - Watch Nested Object Issue & Solutions
<template>
    <div  class="flex flex-col items-center gap-7 justify-center h-screen">
    <input type="text"  v-model="student.name"  class="border w-44 border-gray-300 rounded-md p-2" />
    <input type="text"  v-model="student.contact.phone" class="border w-44 border-gray-300 rounded-md p-2" />
    </div>
</template>
<script setup>
import { ref, watch } from 'vue';


const student = ref({
  name: 'John Doe',

  contact: {
    phone: '123456',
    email: 'test@example.com'
  }
});


watch(
  () => student.value,
  (newVal, oldVal) => {
  },
  {deep:true}
);


// watch(
//   () => student.value.contact.phone,
//   (newVal, oldVal) => {
//   }
// );


// watch(
//   () => student.value.contact,
//   (newVal, oldVal) => {
//   },
//   { deep: true }
// );




</script>