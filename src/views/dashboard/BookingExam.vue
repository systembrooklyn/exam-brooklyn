<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Booking Exam</h1>
          <p class="text-gray-500 mt-1">Manage and view exam bookings within a specific time range.</p>
        </div>
        
        <!-- Filter Card -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">From</label>
            <input 
              v-model="filters.from" 
              type="date" 
              class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-sm font-medium transition-all"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">To</label>
            <input 
              v-model="filters.to" 
              type="date" 
              class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-sm font-medium transition-all"
            />
          </div>
          <div class="flex items-end pt-5">
            <button 
              @click="fetchBookings" 
              :disabled="loading"
              class="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 group"
            >
              <Search v-if="!loading" class="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <Loader2 v-else class="w-5 h-5 animate-spin" />
              <span>Get Data</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="relative min-h-[400px]">
        <!-- Loading Overlay -->
        <div v-if="loading" class="absolute inset-0 z-10 flex justify-center items-center backdrop-blur-[2px] bg-white/30 rounded-2xl">
          <div class="flex flex-col items-center gap-4">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-primary font-bold animate-pulse">Loading bookings...</p>
          </div>
        </div>

        <!-- Data Table -->
        <div v-if="bookings.length > 0" class="fade-in">
          <DataTable 
            :headers="headers" 
            :items="bookings" 
            :loading="loading"
            resourceType="bookings"
            :hideActions="true"
          />
        </div>

        <!-- Empty State / Welcome State -->
        <div v-else-if="!loading" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 fade-in">
          <div class="relative inline-block mb-8">
            <div class="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150"></div>
            <img src="@/assets/undraw_empty_4zx0.png" alt="No Data" class="relative mx-auto w-72 md:w-96 drop-shadow-xl" />
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">No Bookings to Display</h2>
          <p class="text-gray-500 mt-3 max-w-md mx-auto text-lg leading-relaxed">
            Choose your desired date range above and click <span class="text-primary font-semibold">Fetch Data</span> to retrieve the booking results.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Loader2 } from 'lucide-vue-next'
import apiClient from '@/api/axiosInstance'
import { BOOKINGS } from '@/api/Api'
import DataTable from '@/components/dashboard/DataTable.vue'
import notyf from '@/components/global/notyf'

const loading = ref(false)
const bookings = ref([])

// Default to last 7 days
const today = new Date().toISOString().split('T')[0]
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const filters = ref({
  from: lastWeek,
  to: today
})

const headers = [
    { label: 'Student Num', key: 'student.st_num' },
    { label: 'Student Name', key: 'student.name' },
    { label: 'Email', key: 'student.email' },
    { label: 'Phone', key: 'student.phones' },
    { label: 'Course', key: 'exam.course_name' },
  { label: 'Course code', key: 'exam.course_code' },
    { label: 'Exam', key: 'exam.name' },
    { label: 'Branch', key: 'branch.name' },
    { label: 'Booking Date', key: 'booking_datetime' }
]

const fetchBookings = async () => {
  if (!filters.value.from || !filters.value.to) {
    notyf.error('Please select both From and To dates')
    return
  }

  loading.value = true
  try {
    const response = await apiClient.post(BOOKINGS, {
      from: filters.value.from,
      to: filters.value.to
    })
    
    // API returns results in response.data.data or response.data
    const data = response.data.data || response.data
    bookings.value = Array.isArray(data) ? data : []
    
    if (bookings.value.length === 0) {
      notyf.success('Query successful: No records found.')
    } else {
      notyf.success(`Loaded ${bookings.value.length} bookings successfully!`)
    }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    notyf.error(error.response?.data?.message || 'Failed to fetch bookings. Please try again.')
    bookings.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}

.bg-primary {
  background-color: #624ff6; /* Fallback to theme primary color found in SidebarItem.vue */
}

.text-primary {
  color: #624ff6;
}

.shadow-primary\/20 {
  shadow-color: rgba(98, 79, 246, 0.2);
}
</style>
