<template>
  <div class="min-h-screen px-20">
    <Loader :show="groupStore.loading" />

    <!-- Main Content -->
    <div class="max-w-full mx-auto px-4 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl font-bold text-gray-900">Groups</h1>
          
          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="sendSMS"
              class="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <MessageSquareText :size="18" class="mr-2" />
              SMS
            </button>
            <button 
              @click="sendEmail"
              class="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Mail :size="18" class="mr-2" />
              Email
            </button>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search :size="16" class="text-gray-400" />
            </div>
            <input
              v-model="groupCodeInput"
              type="text"
              placeholder="Group Code..."
              @keyup.enter="searchGroup"
              class="w-80 pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button 
              @click="searchGroup"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200"
            >
              <Search :size="16" class="text-gray-400 hover:text-blue-600" />
            </button>
            <button 
              @click="copySearchQuery"
              class="absolute inset-y-0 right-8 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200"
            >
              <Copy :size="16" class="text-gray-400 hover:text-blue-600" />
            </button>
          </div>
        </div>
        <!-- Print Button -->
        <button 
          @click="printTable"
          class="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Printer :size="18" class="mr-2" />
          Print
        </button>
      </div>

      <!-- Group Information Pills -->
      <div v-if="hasSearched && groupStore.group && students.length > 0" class="flex flex-wrap gap-4 mb-6">
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          Group Count: {{ groupStats.totalStudents }}
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          Group Code: {{ groupStats.code }}
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          GR Module Name: {{ groupStats.courseName }}
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          GR Start Date: {{ groupStats.startDate }}
        </div>
      </div>

      <!-- Students Table -->
      <div v-if="hasSearched && filteredStudents.length > 0" class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y text-center divide-gray-200">
            <thead class="bg-gradient-to-r text-center from-blue-600 to-blue-700">
              <tr>
                <th class="px-6 py-6  text-lg font-semibold text-white uppercase tracking-wider">
                  <div >
                    <span>St No.</span>
                  </div>
                </th>
                <th class="px-6 py-6  text-lg font-semibold text-white uppercase tracking-wider">
                  <div >
                    <span>Name</span>
                  </div>
                </th>
                <th class="px-6 py-6  text-lg font-semibold text-white uppercase tracking-wider">
                  <div >
                    <span>Phone</span>
                  </div>
                </th>
                <th class="px-6 py-6  text-lg font-semibold text-white uppercase tracking-wider">
                  <div >
                    <span>Email</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr 
                v-for="(student, index) in filteredStudents" 
                :key="student.id || student.st_num"
                class="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                @click="selectStudent(student)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-3">
                      <div class="text-md font-semibold text-gray-900">{{ student.st_num }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-md font-medium text-gray-900">{{ student.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col space-y-1">
                    <span 
                      v-for="(phone, phoneIndex) in student.phones" 
                      :key="phoneIndex"
                      class="text-md text-gray-700 font-mono"
                    >
                      {{ phone }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-md text-gray-700">{{ student.email }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State Before Search -->
      <div v-else-if="!hasSearched" class="flex flex-col items-center justify-center py-16">
        <img 
          src="@/assets/undraw_empty_4zx0.png" 
          alt="Empty state" 
          class="w-96 h-96 object-contain mb-6"
        />
        <h3 class="mt-2 text-lg font-medium text-gray-900">Search for a group</h3>
        <p class="mt-1 text-sm text-gray-500">Enter a group code to view Group.</p>
      </div>

      <!-- Empty State After Search -->
      <div v-else-if="hasSearched && filteredStudents.length === 0" class="text-center flex flex-col items-center justify-center py-12">
        <img 
          src="@/assets/undraw_empty_4zx0.png" 
          alt="Empty state" 
          class="w-96 h-96 object-contain mb-6"
        />
        <h3 class="mt-2 text-lg font-medium text-gray-900">No Group Found</h3>
        <p class="mt-1 text-sm text-gray-500">No students are assigned to this group.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Copy, Bell, User, MessageSquareText, Mail, Printer } from 'lucide-vue-next'
import { useGroupStore } from '@/stores/groupStore'
import formatDate from '@/components/global/FormDate'
import Loader from '@/components/global/Loader.vue'

// Store
const groupStore = useGroupStore()

// Reactive data
const groupCodeInput = ref('') // Input for searching groups
const selectedStudent = ref(null)
const hasSearched = ref(false)
const students = ref([])

// Computed properties for group statistics
const groupStats = computed(() => {
  if (!groupStore.group) {
    return {
      totalStudents: 0,
      code: '-',
      courseName: '-',
      startDate: '-'
    }
  }
  
  const group = groupStore.group
  
  return {
    totalStudents: group.total_students || 0,
    code: group.code || '-',
    courseName: group.course?.name || '-',
    startDate: formatDate(group.start_date)
  }
})

// Computed property for filtered students
// For now, just return all students - no filtering applied
const filteredStudents = computed(() => {
  if (!students.value || students.value.length === 0) {
    return []
  }
  
  // Return all students without filtering
  return students.value
})

// Methods
const copySearchQuery = () => {
  if (groupCodeInput.value) {
    navigator.clipboard.writeText(groupCodeInput.value)
    // You could add a toast notification here
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
}

const sendSMS = () => {
  // Implement SMS functionality
}

const sendEmail = () => {
  // Implement Email functionality
}

const printTable = () => {
  window.print()
}

// Search group by code
const searchGroup = async () => {
  if (!groupCodeInput.value.trim()) {
    return
  }
  
  hasSearched.value = true
  const code = groupCodeInput.value.trim()
  
  try {
    await groupStore.fetchGroupsByCode(code)
    
    // Extract students from group response
    if (groupStore.group && groupStore.group.students) {
      // Convert Proxy array to plain array to ensure reactivity
      const studentsArray = Array.isArray(groupStore.group.students) 
        ? [...groupStore.group.students] 
        : []
      students.value = studentsArray
    } else {
      students.value = []
    }
  } catch (error) {
    console.error('Error fetching group:', error)
    students.value = []
  }
}

// Watch for group changes
watch(() => groupStore.group, (newGroup) => {
  if (newGroup && newGroup.students) {
    // Convert Proxy array to plain array to ensure reactivity
    students.value = Array.isArray(newGroup.students) ? [...newGroup.students] : []
  } else {
    students.value = []
  }
}, { deep: true, immediate: false })

// Lifecycle
onMounted(() => {
  // Optionally check if there's a code in route params or query
  // const route = useRoute()
  // if (route.query.code) {
  //   searchQuery.value = route.query.code
  //   searchGroup()
  // }
})
</script>
