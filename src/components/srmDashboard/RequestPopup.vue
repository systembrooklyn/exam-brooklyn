<!-- src/components/srmDashboard/RequestPopup.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
      <button @click="$emit('close')" class="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-2xl">&times;</button>
      <h2 class="text-xl font-bold text-indigo-600 mb-4 text-center">Request Details</h2>

      <div class="grid grid-cols-2 gap-4 text-sm text-gray-800">
        <div><strong>ID:</strong> {{ request.id }}</div>
        <div><strong>Status:</strong> {{ request.status }}</div>
        <div><strong>Type:</strong> {{ request.type }}</div>
        <div><strong>Field:</strong> {{ request.field }}</div>
        <div class="col-span-2"><strong>Gmail Sent:</strong> {{ request.value }}</div>
        <div class="col-span-2"><strong>Comment:</strong> {{ request.comment }}</div>
        <div class="col-span-2"><strong>Manager Response:</strong> {{ request.manager_response }}</div>
        <div class="col-span-2"><strong>Employee Response:</strong> {{ request.employee_response }}</div>
        <div><strong>Created At:</strong> {{ formatDate(request.created_at) }}</div>
        <div><strong>Updated At:</strong> {{ formatDate(request.updated_at) }}</div>
        <div><strong>Manager Resp. At:</strong> {{ formatDate(request.manager_response_at) }}</div>
        <div><strong>Employee Resp. At:</strong> {{ formatDate(request.employee_response_at) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import formatDate from "../global/FormDate";

const props = defineProps({
  request: Object,
  visible: Boolean,
});


</script>
