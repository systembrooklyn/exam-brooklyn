<template>
    <div class="w-full max-w-4xl border border-gray-300 mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800">
        <img src="@/assets/logo.png" class="h-15 mx-auto" alt="">
        <h2 class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-5">Placement Test</h2>
  
      <!-- Information Section -->
      <div class="bg-blue-50 p-6 border-l-4 border-blue-500 rounded-xl shadow-md text-blue-900 mb-6">
        <p class="font-semibold text-lg mb-2">Please be noted of the following:</p>
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
        <!-- User Name -->
        <div class="md:col-span-2">
          <label class="form-label">User Name</label>
          <div class="relative">
            <User class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input v-model="form.userName" type="text" class="form-input pl-10" placeholder="Enter your username" />
          </div>
        </div>
  
        <!-- Mobile Number -->
        <div class="md:col-span-2">
          <label class="form-label">Mobile Number</label>
          <div class="relative">
            <Phone class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input v-model="form.mobileNumber" type="tel" class="form-input pl-10" placeholder="Enter your mobile number" />
          </div>
        </div>
  
        <!-- Password -->
        <div class="md:col-span-2">
          <label class="form-label">Password</label>
          <div class="relative">
            <Lock class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input v-model="form.password" type="password" class="form-input pl-10" placeholder="Enter your password" />
          </div>
        </div>
  
        <!-- Start Time -->
        <div class="md:col-span-2">
          <label class="form-label">Start Time</label>
          <div class="relative">
            <Calendar class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input v-model="form.startTime" type="datetime-local" class="form-input pl-10" />
          </div>
        </div>
  
        <!-- Submit Button -->
        <div class="md:col-span-2 text-center mt-6">
          <button type="submit" class="bg-primary text-white py-2 px-10 cursor-pointer rounded-xl hover:bg-blue-700 transition">
            Start Test
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  import { User, Phone, Lock, Calendar } from 'lucide-vue-next';
  
  const form = reactive({
    userName: '',
    mobileNumber: '',
    password: '',
    startTime: '',
  });
  
  function handleSubmit() {
    console.log('Test Data:', JSON.stringify(form));
    // You can handle form submission logic here
  }
  </script>
  
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
  