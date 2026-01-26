<script setup lang="ts">
import { ref, computed } from "vue"
import FinnanceTable from "../../components/finnance-dahboard/FinnanceTable.vue"


const headers = [
  { key: "name", label: "Name", class: "bg-blue-50" },
  { key: "studentNo", label: "Student No", class: "bg-yellow-50" },
  { key: "date", label: "Res. Date", class: "bg-orange-50" },
  { key: "email", label: "Email", class: "bg-indigo-50" },
  { key: "phone", label: "Phone", class: "bg-gray-50" },
  { key: "amount", label: "Res. Amount", class: "bg-yellow-100" },
  { key: "studyType", label: "Type", class: "bg-amber-50" },
  { key: "examResult", label: "Pass Exam Results", class: "bg-green-50" },
  { key: "scholarship", label: "Scholarship", class: "bg-purple-50" },
  { key: "grade", label: "Grade", class: "bg-pink-50" },
  { key: "reservationAgent", label: "Reservation Agent", class: "bg-brown-50" }
]


const data = [
  {
    id: 1,
    name: "Mostafa Mohamed Essam",
    studentNo: "27207",
    date: "21/07/2023",
    email: "mo_Essam91@yahoo.com",
    phone: "201000398779",
    amount: 0,
    studyType: "TRANSFER",
    examResult: "-",
    scholarship: "TQM",
    grade: "Good",
    reservationAgent: "441_Bassma"
  },
  {
    id: 2,
    name: "hesham nasef lhamaky",
    studentNo: "29385",
    date: "19/07/2023",
    email: "heshamnasef159@gmail.com",
    phone: "201092464381",
    amount: 200,
    studyType: "RESERVATION",
    examResult: "Pass",
    scholarship: "MBA",
    grade: "V.Good",
    reservationAgent: "Kholoud_560"
  },
  {
    id: 3,
    name: "Ahmed Hassan Mohamed",
    studentNo: "29390",
    date: "21/07/2023",
    email: "ahmed_adr2002@yahoo.com",
    phone: "201119580590",
    amount: 200,
    studyType: "RESERVATION",
    examResult: "Fail",
    scholarship: "MBA",
    grade: "Good",
    reservationAgent: "Princess_559"
  }
]


const fromDate = ref("2023-07-19")
const toDate = ref("2023-07-23")

const filteredData = computed(() => {
  return data.filter(item => {
    const d = new Date(item.date.split("/").reverse().join("-"))
    return d >= new Date(fromDate.value) && d <= new Date(toDate.value)
  })
})


const editInvoice = (row: any) => {
}
const deleteInvoice = (id: number) => {
}

const loading = ref(false)
</script>

<template>
  <div>
    <div class="flex gap-4 mb-6">
      <div class="flex flex-col">
        <label class="font-semibold text-gray-600">From:</label>
        <input
          v-model="fromDate"
          type="date"
          class="border border-indigo-400 rounded-md px-3 py-1   shadow-sm focus:ring focus:ring-indigo-200"
        />
      </div>
      <div class="flex flex-col">
        <label class="font-semibold text-gray-600">To:</label>
        <input
          v-model="toDate"
          type="date"
          class="border border-indigo-400 rounded-md px-3 py-1 shadow-sm focus:ring focus:ring-indigo-200"
        />
      </div>
    </div>

   
    <FinnanceTable
      :data="filteredData"
      :headers="headers"
      :loading="loading"
      @edit="editInvoice"
      @delete="deleteInvoice"
    />
  </div>
</template>
