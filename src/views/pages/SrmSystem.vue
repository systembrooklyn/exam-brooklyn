<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
    <Loader :show="studentStore.loading" />
    <div class="w-full max-w-2xl text-center">
      <h1 class="text-3xl font-bold text-blue-800 dark:text-white mb-6">
        Search Student Information
      </h1>

      <input
        v-model="studentId"
        @keyup.enter="searchStudent"
        type="text"
        placeholder="Enter Student ID..."
        class="w-full p-4 rounded-xl shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      />

      <button
        @click="searchStudent"
        class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
      >
        Search
      </button>

      <img
        src="@/assets/search.png"
        alt="Search Student"
        class="w-64 mx-auto mt-10 opacity-90"
      />

      <p class="mt-4 text-gray-600 dark:text-gray-300">
        Start by entering the student's ID above to view detailed information.
      </p>
    </div>
    <StudentProfile
      v-if="studentStore.student"
      :student="studentStore.student"
      class="mt-10 w-full max-w-2xl"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {useStudentStore} from '@/stores/SearchStudent'; 
import Loader from '@/components/global/Loader.vue';
import StudentProfile from '@/components/dashboard/StudentProfile.vue';
const studentStore = useStudentStore();

const studentId = ref('');

const searchStudent = async () => {
 
  console.log('Searching for student with ID:', studentId.value);
  
 await studentStore.fetchStudent(studentId.value);
  
  
};


</script>

<style scoped>
</style>
