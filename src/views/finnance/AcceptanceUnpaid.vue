<script setup >
import { ref, computed } from "vue"
import FinnanceTable from "../../components/finnance-dahboard/FinnanceTable.vue"


const headers = [
  { key: "name", label: "Name", class: "bg-blue-50" },
  { key: "email", label: "Email", class: "bg-indigo-50" },
  { key: "phone", label: "Phone", class: "bg-gray-50" },
  { key: "deadlineDate", label: "Deadline Date", class: "bg-red-50" },
  { key: "deadlineAmount", label: "Deadline Amount", class: "bg-pink-50" }
]


const data = [
  {
    id: 1,
    name: "Sara Mohammed Hussein",
    email: "saramohammedhssein8@gmail.com",
    phone: "201156800105",
    deadlineDate: "12/09/2025",
    deadlineAmount: 3000
  },
  {
    id: 2,
    name: "essam gado ahmed abdelmaguid gado",
    email: "essamgado18@gmail.com",
    phone: "201550751212",
    deadlineDate: "12/09/2025",
    deadlineAmount: 3000
  },
  {
    id: 3,
    name: "maha youssef mahmoud",
    email: "mahayoussef88@gmail.com",
    phone: "201270132049",
    deadlineDate: "12/09/2025",
    deadlineAmount: 3000
  },
  {
    id: 4,
    name: "Hammam Hussam Abdalraouf",
    email: "hammam-hamham@hotmail.com",
    phone: "201155351174",
    deadlineDate: "12/09/2025",
    deadlineAmount: 3000
  }
]


const startDate = ref("2025-09-05")


const filteredData = computed(() => {
  return data.filter(item => {
    const d = new Date(item.deadlineDate.split("/").reverse().join("-"))
    return d >= new Date(startDate.value) 
  })
})

const loading = ref(false)


const editDeadline = (row: any) => {
  console.log("Edit deadline:", row)
}
const deleteDeadline = (id: number) => {
  console.log("Delete deadline:", id)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Acceptance Unpaid</h1>
    
    <div class="flex gap-4 mb-6">
      <div class="flex flex-col">
        <label class="font-semibold text-gray-600">Start Date:</label>
        <input
          v-model="startDate"
          type="date"
          class="border border-indigo-400 rounded-md px-3 py-1 shadow-sm focus:ring focus:ring-indigo-200"
        />
      </div>
     
    </div>

  
    <FinnanceTable
      :data="filteredData"
      :headers="headers"
      :loading="loading"
      @edit="editDeadline"
      @delete="deleteDeadline"
    />
  </div>
</template>
