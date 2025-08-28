<script setup lang="ts">
import FinnanceTable from '../../components/finnance-dahboard/FinnanceTable.vue';
const data = [
  {
    id: 1,
    amount: 5000,
    date: '2025-08-01',
    studentNo: 'STU-001',
    paidAmount: 3000,
    upaid: 2000,
    name: 'Ahmed Ali',
    email: 'ahmed@test.com',
    phone: '+20123456789',
    studyType: 'Full-Time'
  },
  {
    id: 2,
    amount: 8000,
    date: '2025-08-02',
    studentNo: 'STU-002',
    paidAmount: 8000,
    upaid: 0,
    name: 'Sara Mohamed',
    email: 'sara@test.com',
    phone: '+20123456780',
    studyType: 'Part-Time'
  }
]


const headers = [
  { key: 'amount', label: 'Amount', class: 'bg-yellow-50' },
  { key: 'date', label: 'Date', class: 'bg-orange-50' },
  { key: 'studentNo', label: 'Student No', class: 'bg-yellow-50' },
  { key: 'paidAmount', label: 'Paid Amount', class: 'bg-green-50' },
  { key: 'upaid', label: 'Upaid', class: 'bg-red-50' },
  { key: 'name', label: 'Name', class: 'bg-blue-50' },
  { key: 'email', label: 'Email', class: 'bg-indigo-50' },
  { key: 'phone', label: 'Phone', class: 'bg-gray-50' },
  { key: 'studyType', label: 'Study Type', class: 'bg-amber-50' }
]
</script>

<template>
    <h1 class="text-2xl font-bold mb-4">Invoices After 2 Days</h1>

    <FinnanceTable
      :data="data"
      :headers="headers"
      :loading="loading"
      @edit="editInvoice"
      @delete="deleteInvoice"
    />
</template>