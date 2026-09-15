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
            :rounded-top="false"
            :headers="headers"
            :items="bookings"
            :loading="loading"
            resource-type="bookings"
            :hide-actions="true"
            :link-name-to-details="false"
            :collapsible-text-keys="bookingCollapsibleKeys"
            @add-note="openNoteModal"
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

    <!-- Log student contact (note optional) -->
    <div
      v-if="showNoteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      @click.self="closeNoteModal"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-note-title"
      >
        <div class="flex items-center justify-between bg-[#092C67] px-5 py-4 text-white">
          <div>
            <h2 id="booking-note-title" class="text-base font-semibold tracking-wide sm:text-lg">
              Log student contact
            </h2>
            <p class="mt-0.5 text-xs font-normal text-white/75">
              Confirm the CTA — a note is optional
            </p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-white/15"
            aria-label="Close"
            @click="closeNoteModal"
          >
            &times;
          </button>
        </div>

        <div class="px-5 pb-2 pt-5">
          <div
            v-if="selectedBooking?.student?.name"
            class="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Student
            </p>
            <p class="mt-0.5 text-sm font-semibold text-slate-800">
              {{ selectedBooking.student.name }}
              <span
                v-if="selectedBooking.student.st_num"
                class="ms-1 font-medium tabular-nums text-slate-400"
              >
                · #{{ selectedBooking.student.st_num }}
              </span>
            </p>
          </div>

          <div class="mb-1.5 flex items-center justify-between gap-2">
            <label
              class="text-sm font-medium text-slate-700"
              for="booking-note-text"
            >
              Note
            </label>
            <span class="text-xs font-medium text-slate-400">Optional</span>
          </div>
          <textarea
            id="booking-note-text"
            v-model="noteText"
            rows="5"
            placeholder="Add details about the call / message (optional)…"
            class="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p class="mt-2 text-xs leading-relaxed text-slate-500">
            You can confirm contact without writing a note. Add one only if you need a record of what was discussed.
          </p>
        </div>

        <div class="flex justify-end gap-2 px-5 pb-5 pt-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            :disabled="savingNote"
            @click="closeNoteModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-[#092C67] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b3a85] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="savingNote"
            @click="saveNote"
          >
            <Loader2 v-if="savingNote" class="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{{ noteText.trim() ? 'Confirm & save note' : 'Confirm contact' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Loader2, ArrowLeft } from 'lucide-vue-next'
import apiClient from '@/api/axiosInstance'
import { BOOKINGS, BOOKING_NOTES } from '@/api/Api'
import DataTable from '@/components/dashboard/DataTable.vue'
import notyf from '@/components/global/notyf'

const loading = ref(false)
const bookings = ref([])

const showNoteModal = ref(false)
const selectedBooking = ref(null)
const noteText = ref('')
const savingNote = ref(false)

// Default to last 7 days
const today = new Date().toISOString().split('T')[0]
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const filters = ref({
  from: lastWeek,
  to: today
})

const headers = [
  { label: 'Student', key: 'student_name_and_num' },
  { label: 'Email', key: 'student.email' },
  { label: 'Phone', key: 'student.phones' },
  { label: 'Course', key: 'course_display' },
  { label: 'Instructor name', key: 'exam.instructor_name' },
  { label: 'Branch', key: 'branch.name' },
  { label: 'Booking date', key: 'booking_datetime', sortable: true },
  { label: 'Action', key: 'notes' },
]

/** Keep long course/exam text readable without blowing row height; DataTable adds See more. */
const bookingCollapsibleKeys = ['course_display', 'exam.instructor_name']

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
    bookings.value = (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      course_display: `${item.exam?.course_name ?? ''}(${item.exam?.course_code ?? ''})`,
    }))
    
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

const openNoteModal = (item) => {
  selectedBooking.value = item
  // Preserve empty string (contacted, no note) vs null (never contacted)
  noteText.value = item?.notes != null ? String(item.notes) : ''
  showNoteModal.value = true
}

const closeNoteModal = () => {
  if (savingNote.value) return
  showNoteModal.value = false
  selectedBooking.value = null
  noteText.value = ''
}

const saveNote = async () => {
  const booking = selectedBooking.value
  if (!booking?.id) return

  const trimmed = noteText.value.trim()

  savingNote.value = true
  try {
    // Empty notes is allowed — employee can confirm CTA without writing a note
    const response = await apiClient.post(BOOKING_NOTES(booking.id), { notes: trimmed })
    const payload = response.data?.data ?? response.data
    const savedNotes = payload?.notes

    const row = bookings.value.find((b) => String(b.id) === String(booking.id))
    if (row) {
      if (trimmed === '') {
        // Keep '' so UI shows "Done" (not null = no action). Prefer API value if it has content.
        row.notes =
          savedNotes != null && String(savedNotes).trim() !== ''
            ? savedNotes
            : ''
      } else {
        // Prefer full API string (includes " - actor - id")
        row.notes = savedNotes != null ? savedNotes : trimmed
      }
    }
    notyf.success(trimmed ? 'Contact logged with note' : 'Contact confirmed')
    showNoteModal.value = false
    selectedBooking.value = null
    noteText.value = ''
  } catch (error) {
    console.error('Error saving booking note:', error)
    notyf.error(error.response?.data?.message || 'Failed to log contact. Please try again.')
  } finally {
    savingNote.value = false
  }
}

onMounted(() => {
  fetchBookings()
})
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
