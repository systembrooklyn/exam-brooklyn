<script setup>
import { ref } from 'vue';
import { Mail, Loader2 } from 'lucide-vue-next';
import { usePlacementTestsStore } from '@/stores/placementTestsStore';
import { useRouter } from 'vue-router';

const placementTestsStore = usePlacementTestsStore();

const email = ref('');
const router = useRouter();
const loading = ref(false);
const studentData = ref(null);
const showConfirm = ref(false);
const acceptedTerms = ref(false);
const startPlas = ref({
  pt_id: null,
st_id:null
});

function handleSubmit() {
  loading.value = true;
  studentData.value = null;

  placementTestsStore.fetchStudenByEmail(email.value).then(response => {
    studentData.value = placementTestsStore.student
    showConfirm.value = true;
  }).finally(() => {
    loading.value = false;
  });
}

function confirmStart() {
  showConfirm.value = false;
  startPlas.value.pt_id = placementTestsStore.placementTest.id;
  startPlas.value.st_id = studentData.value.id;
router.push({name : 'placement-essay'})

}

function cancelConfirm() {
  showConfirm.value = false;
  email.value = '';
  studentData.value = null;
  acceptedTerms.value = false;
}
</script>


<template>
    <div class="w-full max-w-4xl border border-gray-300 mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800">
        <img src="@/assets/logo.png" class="h-15 mx-auto" alt="">
        <h2 class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-5">Placement Test</h2>
  
      <!-- Information Section -->
      <div class="bg-blue-50 p-6 border-l-4 border-blue-500 rounded-xl shadow-md text-blue-900 mb-6">
        <p class="font-semibold text-lg mb-2">Please Be Noted Of The Following:</p>
        <div class="space-y-2">
          <p><strong>Time of the exam is:</strong> 1 hour</p>
          <p><strong>The test is composed of three phases:</strong></p>
          <ul class="list-disc list-inside pl-4">
            <li>Phase 1 : English Test (60 Q)</li>
            <li>Phase 2 : IQ Test (15 Q)</li>
            <li>Phase 3 : Computer Test (10 Q)</li>
          </ul>
        </div>
        <div class="mt-4 text-sm text-gray-700">
          <p>Good Luck,</p>
          <p>Regards,</p>
          <p class="font-semibold">Brooklyn Business School Team</p>
        </div>
      </div>
  
      <!-- Form Section -->
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- email -->
        <div class="md:col-span-2">
          <label class="form-label">Email</label>
          <div class="relative">
            <Mail  class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input v-model="email" type="text" class="form-input pl-10" placeholder="Enter your email" />
          </div>
        </div>
  
 
        <!-- Submit Button -->
        <div class="md:col-span-2 text-center mt-6">
        <button type="submit" :disabled="loading" class="bg-primary text-white py-2 px-10 cursor-pointer rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 mx-auto">
  <Loader2 v-if="loading" class="animate-spin w-5 h-5" />
  <span v-if="!loading">Start Test</span>
  <span v-else>Loading...</span>
</button>

        </div>
      </form>

<!-- Confirmation Popup -->
<div v-if="showConfirm" class="fixed inset-0 bg-[rgba(0,0,0,0.6)] bg-opacity-50 flex justify-center items-center z-50">
  <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-3xl text-center transform transition-all duration-300">

    <!-- Lucide Icon -->
    <div class="flex justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#092c67" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <polyline points="16 11 18 13 22 9"></polyline>
      </svg>
    </div>

    <h3 class="text-2xl font-bold text-blue-900 dark:text-white mb-6">Is this your information?</h3>

    <!-- Grid Layout - Two Columns with Conditional Rendering -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700 dark:text-gray-200 text-left px-8 mb-6">

      <!-- Name -->
      <p v-if="studentData?.name"><strong>Name:</strong> {{ studentData.name }}</p>

      <!-- Email -->
      <p v-if="studentData?.email"><strong>Email:</strong> {{ studentData.email }}</p>

      <!-- Phone -->
      <p v-if="studentData?.phones?.[0]"><strong>Phone:</strong> {{ studentData.phones[0] }}</p>

      <!-- Company -->
      <p v-if="studentData?.company"><strong>Company:</strong> {{ studentData.company }}</p>

      <!-- Major -->
      <p v-if="studentData?.major"><strong>Major:</strong> {{ studentData.major }}</p>

      <!-- University -->
      <p v-if="studentData?.faculty"><strong>University:</strong> {{ studentData.faculty }}</p>

    </div>

    <!-- Terms Checkbox -->
    <div class="flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 mt-4">
      <input type="checkbox" id="terms" v-model="acceptedTerms" class="h-4 w-4 text-[#092c67] focus:ring-[#092c67] border-gray-300 rounded">
      <label for="terms" class="ml-2">I agree to the terms and conditions</label>
    </div>

    <!-- Buttons -->
    <div class="flex justify-center gap-4 mt-6">
      <button 
        @click="confirmStart" 
        :disabled="!acceptedTerms"
        :class="{
          'bg-[#092c67] hover:bg-[#07224f]': acceptedTerms,
          'bg-gray-400 cursor-not-allowed': !acceptedTerms
        }"
        class="text-white px-6 py-2 rounded-lg transition-colors duration-300"
      >
        Yes
      </button>
      <button @click="cancelConfirm" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-300">
        No
      </button>
    </div>
  </div>
</div>
    </div>
  </template>
  

  
  <style scoped>
  .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e3a8a;
  }
  .form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    padding-left: 2.25rem;
    border: 1px solid #d1d5db;
    border-radius: 0.75rem;
    outline: none;
    transition: border 0.3s;
    background-color: #f9fafb;
  }
  .form-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }
  
  .bg-blue-50 {
    background-color: #eff6ff;
  }
  
  .text-blue-900 {
    color: #1e3a8a;
  }
  
  .shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .list-disc {
    list-style-type: disc;
  }
  
  .list-inside {
    list-style-position: inside;
  }
  </style>
  