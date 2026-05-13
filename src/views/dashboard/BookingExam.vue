<template>
  <div class="min-h-screen bg-slate-50/80">
    <div class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
      <!-- Page title -->
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-3">
          <router-link
            to="/systems"
            class="mt-1 shrink-0 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-primary/25 hover:bg-slate-50 hover:text-primary"
            aria-label="Back to systems"
          >
            <ArrowLeft class="h-5 w-5" />
          </router-link>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Booking Exam
            </h1>
            <!-- <p class="mt-1 max-w-xl text-sm text-slate-600 sm:text-[15px]">
              Manage and view exam bookings within a specific date range.
            </p> -->
          </div>
        </div>
      </header>

      <!-- Single surface: filters + table (horizontal scroll contained) -->
      <div
        class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5"
      >
        <div
          class="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:p-5"
        >
          <!-- <div>
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Date range
            </h2>
            <p class="mt-0.5 text-sm text-slate-600">
              Results load for the interval you choose.
            </p>
          </div> -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500" for="booking-from">
                From
              </label>
              <input
                id="booking-from"
                v-model="filters.from"
                type="date"
                class="h-11 min-w-[10.5rem] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-inner shadow-slate-900/5 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500" for="booking-to">
                To
              </label>
              <input
                id="booking-to"
                v-model="filters.to"
                type="date"
                class="h-11 min-w-[10.5rem] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-inner shadow-slate-900/5 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-[#5346e0] hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-55"
              @click="fetchBookings"
              :disabled="loading"
            >
              <Search v-if="!loading" class="h-4 w-4 shrink-0 opacity-95" aria-hidden="true" />
              <Loader2 v-else class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              <span>Get Bookings</span>
            </button>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div
          v-if="loading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/65 backdrop-blur-[1px]"
        >
          <div class="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white px-8 py-6 shadow-lg">
            <div class="relative h-11 w-11">
              <div class="absolute inset-0 rounded-full border-[3px] border-primary/20" />
              <div
                class="absolute inset-0 animate-spin rounded-full border-[3px] border-primary border-t-transparent"
              />
            </div>
            <p class="text-sm font-semibold text-slate-700">Loading bookings…</p>
          </div>
        </div>

        <div v-if="bookings.length > 0" class="fade-in min-w-0 max-w-full">
          <DataTable
            embedded
            compact
            cells-centered
            :tabular-column-keys="bookingTabularKeys"
            :rounded-top="false"
            :headers="headers"
            :items="bookings"
            :loading="loading"
            resource-type="bookings"
            :hide-actions="true"
            :link-name-to-details="false"
            :collapsible-text-keys="bookingCollapsibleKeys"
          />
        </div>

        <div v-else-if="!loading" class="fade-in px-4 py-14 text-center sm:px-8 sm:py-20">
          <div class="relative mx-auto mb-6 inline-block max-w-lg">
            <div class="absolute inset-0 scale-150 rounded-full bg-primary/[0.06] blur-3xl" />
            <img
              src="@/assets/undraw_empty_4zx0.png"
              alt=""
              class="relative mx-auto w-64 drop-shadow-md sm:w-80"
            />
          </div>
          <h2 class="text-xl font-bold text-slate-900 sm:text-2xl">No bookings to display</h2>
          <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Choose a date range in the bar above and click
            <span class="font-semibold text-primary">Get data</span>
            to load booking results.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Loader2, ArrowLeft } from 'lucide-vue-next'
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
  { label: 'Student #', key: 'student.st_num' },
  { label: 'Student name', key: 'student.name' },
  { label: 'Email', key: 'student.email' },
  { label: 'Phone', key: 'student.phones' },
  { label: 'Course', key: 'exam.course_name' },
  { label: 'Course code', key: 'exam.course_code' },
  { label: 'Exam', key: 'exam.name' },
  { label: 'Branch', key: 'branch.name' },
  { label: 'Booking date', key: 'booking_datetime', sortable: true },
]

/** Keep long course/exam text readable without blowing row height; DataTable adds See more. */
const bookingCollapsibleKeys = ['exam.course_name', 'exam.name']

const bookingTabularKeys = ['student.st_num', 'exam.course_code']

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
  background-color: #092C67; /* Fallback to theme primary color found in SidebarItem.vue */
}

.text-primary {
  color: #624ff6;
}
</style>
