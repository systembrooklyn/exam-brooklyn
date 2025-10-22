<template>
  <div class="min-h-screen ">
  

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-6">
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
              v-model="searchQuery"
              type="text"
              placeholder="Group ID..."
              class="w-80 pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button 
              @click="copySearchQuery"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200"
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
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          Group Count: {{ groupStats.totalGroups }} / ({{ groupStats.freshGroups }} Fresh)
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          Group Time: {{ groupStats.timeRange }}
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          GR Module Name: {{ groupStats.moduleName }}
        </div>
        <div class="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
          GR Start Date: {{ groupStats.startDate }}
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
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
                    <span>St Type</span>
                  </div>
                </th>
                <th class="px-6 py-6  text-lg font-semibold text-white uppercase tracking-wider">
                  <div >
                    <span>Grade</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr 
                v-for="(student, index) in filteredStudents" 
                :key="student.id" 
                class="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                @click="selectStudent(student)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                  
                    <div class="ml-3">
                      <div class="text-md font-semibold text-gray-900">{{ student.studentNo }}</div>
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
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {{ student.studentType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium"
                    :class="getGradeClass(student.grade)"
                  >
                    {{ student.grade }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="students.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No students found</h3>
        <p class="mt-1 text-sm text-gray-500">No students are assigned to this group.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Copy, Bell, User, MessageSquareText, Mail, Printer } from 'lucide-vue-next'

// Reactive data
const loading = ref(false)
const searchQuery = ref('')
const selectedStudent = ref(null)
const students = ref([
  {
    id: 1,
    studentNo: 30292,
    name: 'Asmaa Mahmoud Taha Ahmed',
    phones: ['201023767076'],
    studentType: 'Student',
    grade: '5 Years Ex'
  },
  {
    id: 2,
    studentNo: 31028,
    name: 'mageed ahmed mohamed',
    phones: ['201004096348'],
    studentType: 'Student',
    grade: '5 Years Ex'
  },
  {
    id: 3,
    studentNo: 28112,
    name: 'kamal emad kamal',
    phones: ['01278472929', '01134333406'],
    studentType: 'Student',
    grade: 'Excellent'
  },
  {
    id: 4,
    studentNo: 29894,
    name: 'ISLAM EMAM GABER',
    phones: ['201110333060'],
    studentType: 'Student',
    grade: 'V.Good'
  },
  {
    id: 5,
    studentNo: 30072,
    name: 'Rania Mohamed Sayed Ahmed ElBeshir',
    phones: ['201200098694', '01116449442'],
    studentType: 'Student',
    grade: '5 Years Ex'
  },
  {
    id: 6,
    studentNo: 30074,
    name: 'mina adel lotfy',
    phones: ['201050008451'],
    studentType: 'Student',
    grade: '5 Years Ex'
  },
  {
    id: 7,
    studentNo: 30092,
    name: 'Khalid Osama Hussien Zaky',
    phones: ['201065197179'],
    studentType: 'Student',
    grade: 'V.Good'
  },
  {
    id: 8,
    studentNo: 30106,
    name: 'Monica Michael Ramzy',
    phones: ['201004678076'],
    studentType: 'Student',
    grade: '5 Years Ex'
  },
  {
    id: 9,
    studentNo: 30259,
    name: 'Ramez Nabil Zekry',
    phones: ['201226065544'],
    studentType: 'Student',
    grade: '5 Years Ex'
  }
])

// Computed properties for group statistics
const groupStats = computed(() => {
  return {
    totalGroups: 34,
    freshGroups: 0,
    timeRange: '10 to 3',
    moduleName: 'marketing',
    startDate: '27/09/2024'
  }
})

// Computed property for filtered students
const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) {
    return students.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(student => 
    student.studentNo.toString().includes(query) ||
    student.name.toLowerCase().includes(query) ||
    student.phones.some(phone => phone.includes(query))
  )
})

// Methods
const copySearchQuery = () => {
  if (searchQuery.value) {
    navigator.clipboard.writeText(searchQuery.value)
    // You could add a toast notification here
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
  console.log('Selected student:', student)
}

const sendSMS = () => {
  console.log('Sending SMS to group...')
  // Implement SMS functionality
}

const sendEmail = () => {
  console.log('Sending Email to group...')
  // Implement Email functionality
}

const printTable = () => {
  window.print()
}

const getGradeClass = (grade) => {
  const gradeLower = grade.toLowerCase()
  if (gradeLower.includes('excellent')) {
    return 'bg-green-100 text-green-800'
  } else if (gradeLower.includes('good')) {
    return 'bg-blue-100 text-blue-800'
  } else if (gradeLower.includes('years')) {
    return 'bg-purple-100 text-purple-800'
  } else {
    return 'bg-gray-100 text-gray-800'
  }
}
const fetchStudents = async () => {
  loading.value = true
  try {
    // Here you would typically fetch data from your API
    // await api.getStudentsForGroup(groupId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error('Error fetching students:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchStudents()
})
</script>
