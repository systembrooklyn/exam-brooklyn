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
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
            <!-- Filter by: Created at | Booking date -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Filter by
              </span>
              <div
                class="inline-flex h-11 rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-inner shadow-slate-900/5"
                role="group"
                aria-label="Date filter field"
              >
                <button
                  type="button"
                  class="rounded-lg px-3 text-sm font-semibold transition"
                  :class="dateFilterMode === 'created_at'
                    ? 'bg-[#092C67] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'"
                  :aria-pressed="dateFilterMode === 'created_at'"
                  @click="setDateFilterMode('created_at')"
                >
                  Created at
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 text-sm font-semibold transition"
                  :class="dateFilterMode === 'booking_datetime'
                    ? 'bg-[#092C67] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'"
                  :aria-pressed="dateFilterMode === 'booking_datetime'"
                  @click="setDateFilterMode('booking_datetime')"
                >
                  Booking date
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-500" for="booking-from">
                {{ dateFilterMode === 'created_at' ? 'Created from' : 'Booking from' }}
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
                {{ dateFilterMode === 'created_at' ? 'Created to' : 'Booking to' }}
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
            :key="dateFilterMode"
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
            :highlight-today-field="dateFilterMode === 'created_at' ? 'created_at' : 'booking_datetime'"
            :initial-sort-key="activeSortKey"
            initial-sort-direction="asc"
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
          <div class="relative" ref="statusSplitRef">
            <div class="inline-flex overflow-hidden rounded-xl shadow-sm">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                :class="selectedStatusMeta.btnClass"
                :disabled="savingNote"
                @click="saveNote"
              >
                <Loader2 v-if="savingNote" class="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ selectedStatusMeta.label }}</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center border-l border-white/25 px-2.5 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                :class="selectedStatusMeta.btnClass"
                :disabled="savingNote"
                aria-label="Choose contact status"
                aria-haspopup="listbox"
                :aria-expanded="statusMenuOpen"
                @click.stop="statusMenuOpen = !statusMenuOpen"
              >
                <ChevronDown
                  class="h-4 w-4 transition-transform"
                  :class="statusMenuOpen ? 'rotate-180' : ''"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div
              v-if="statusMenuOpen"
              class="absolute bottom-full end-0 z-10 mb-1.5 min-w-[10.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="listbox"
              aria-label="Contact status"
            >
              <button
                v-for="opt in contactStatuses"
                :key="opt.value"
                type="button"
                role="option"
                class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm font-medium transition hover:bg-slate-50"
                :class="opt.value === selectedStatus ? 'bg-slate-50' : ''"
                :aria-selected="opt.value === selectedStatus"
                @click="selectContactStatus(opt.value)"
              >
                <span
                  class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  :class="opt.dotClass"
                  aria-hidden="true"
                />
                <span :class="opt.textClass">{{ opt.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Search, Loader2, ArrowLeft, ChevronDown } from 'lucide-vue-next'
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

const contactStatuses = [
  {
    value: 'confirmed',
    label: 'confirmed',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  {
    value: 'pending',
    label: 'pending',
    btnClass: 'bg-amber-500 hover:bg-amber-600',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
  },
  {
    value: 'canceled',
    label: 'canceled',
    btnClass: 'bg-rose-600 hover:bg-rose-700',
    textClass: 'text-rose-700',
    dotClass: 'bg-rose-500',
  },
]

const selectedStatus = ref('confirmed')
const statusMenuOpen = ref(false)
const statusSplitRef = ref(null)

const selectedStatusMeta = computed(
  () => contactStatuses.find((s) => s.value === selectedStatus.value) ?? contactStatuses[0]
)

const selectContactStatus = (value) => {
  selectedStatus.value = value
  statusMenuOpen.value = false
}

const onDocPointerDown = (event) => {
  const el = statusSplitRef.value
  if (!el || !statusMenuOpen.value) return
  if (!el.contains(event.target)) statusMenuOpen.value = false
}

watch(showNoteModal, (open) => {
  if (!open) statusMenuOpen.value = false
})

// Default: From = yesterday, To = From + 7 days
const toDateInputValue = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fromDate = new Date()
fromDate.setHours(0, 0, 0, 0)
fromDate.setDate(fromDate.getDate() - 1)

const toDate = new Date(fromDate)
toDate.setDate(toDate.getDate() + 7)

const filters = ref({
  from: toDateInputValue(fromDate),
  to: toDateInputValue(toDate),
})

/** 'created_at' | 'booking_datetime' */
const dateFilterMode = ref('created_at')

/** Ascending sort follows the active date filter (Created at ↔ Booking date). */
const activeSortKey = computed(() =>
  dateFilterMode.value === 'created_at'
    ? 'student_name_and_Created_at'
    : 'booking_datetime'
)

const headers = [
  { label: 'Student', key: 'student_name_and_Created_at', sortable: true },
  { label: 'Email', key: 'student_email_and_num' },
  { label: 'Phone', key: 'student.phones' },
  { label: 'Course', key: 'course_display' },
  { label: 'Instructor name', key: 'exam.instructor_name' },
  { label: 'Branch', key: 'branch.name' },
  { label: 'Booking date', key: 'booking_datetime', sortable: true },
  { label: 'Action', key: 'notes' },
]

/** Keep long course/exam text readable without blowing row height; DataTable adds See more. */
const bookingCollapsibleKeys = ['course_display', 'exam.instructor_name']

const isDateInRange = (item, from, to, mode) => {
  const raw = mode === 'booking_datetime' ? item?.booking_datetime : item?.created_at
  if (!raw || !from || !to) return false
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return false
  const day = toDateInputValue(parsed)
  return day >= from && day <= to
}

const setDateFilterMode = (mode) => {
  if (dateFilterMode.value === mode || loading.value) return
  dateFilterMode.value = mode
  fetchBookings()
}

const fetchBookings = async () => {
  if (!filters.value.from || !filters.value.to) {
    notyf.error('Please select both From and To dates')
    return
  }

  loading.value = true
  try {
    const response = await apiClient.post(BOOKINGS, {
      from: filters.value.from,
      to: filters.value.to,
      filter_by: dateFilterMode.value,
    })
    
    // API returns results in response.data.data or response.data
    const data = response.data.data || response.data
    const rows = (Array.isArray(data) ? data : [])
      .filter((item) =>
        isDateInRange(item, filters.value.from, filters.value.to, dateFilterMode.value)
      )
      .map((item) => ({
        ...item,
        course_display: `${item.exam?.course_name ?? ''}(${item.exam?.course_code ?? ''})`,
      }))

    bookings.value = rows
    
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
  const existing = String(item?.status ?? '').trim().toLowerCase()
  selectedStatus.value = contactStatuses.some((s) => s.value === existing)
    ? existing
    : 'confirmed'
  statusMenuOpen.value = false
  showNoteModal.value = true
}

const closeNoteModal = () => {
  if (savingNote.value) return
  showNoteModal.value = false
  selectedBooking.value = null
  noteText.value = ''
  selectedStatus.value = 'confirmed'
  statusMenuOpen.value = false
}

const saveNote = async () => {
  const booking = selectedBooking.value
  if (!booking?.id) return

  const trimmed = noteText.value.trim()
  const status = selectedStatus.value

  savingNote.value = true
  statusMenuOpen.value = false
  try {
    // Omit notes when empty — only send status
    const body = { status }
    if (trimmed) body.notes = trimmed

    const response = await apiClient.post(BOOKING_NOTES(booking.id), body)
    const payload = response.data?.data ?? response.data
    const savedNotes = payload?.notes
    const savedStatus = payload?.status ?? status

    const row = bookings.value.find((b) => String(b.id) === String(booking.id))
    if (row) {
      row.status = savedStatus
      if (trimmed === '') {
        // Keep '' so UI shows status label (not null = no action). Prefer API value if it has content.
        row.notes =
          savedNotes != null && String(savedNotes).trim() !== ''
            ? savedNotes
            : ''
      } else {
        // Prefer full API string (includes " - actor - id")
        row.notes = savedNotes != null ? savedNotes : trimmed
      }
    }
    notyf.success(trimmed ? 'Contact logged with note' : `Contact ${status}`)
    showNoteModal.value = false
    selectedBooking.value = null
    noteText.value = ''
    selectedStatus.value = 'confirmed'
  } catch (error) {
    console.error('Error saving booking note:', error)
    notyf.error(error.response?.data?.message || 'Failed to log contact. Please try again.')
  } finally {
    savingNote.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
  fetchBookings()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
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
