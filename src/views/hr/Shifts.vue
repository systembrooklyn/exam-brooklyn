<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Shifts Management</h1>
        <p class="text-gray-500 mt-1">Configure work shifts and timings</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Shift
      </button>
    </div>

    <!-- Error -->
    <div v-if="shiftStore.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ shiftStore.error }}</span>
      <button @click="shiftStore.error = null" class="text-red-800 font-bold">×</button>
    </div>



    <HrDataTable
      :headers="headers"
      :items="shiftStore.shifts"
      :loading="shiftStore.loading"
      emptyMessage="No shifts found."
      @edit="openEditModal"
      @delete="confirmDelete"
    >
      <template #start_time="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #end_time="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #break_start="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #break_end="{ value }">
        {{ formatTime(value) }}
      </template>

      <template #is_active="{ value }">
         <span class="px-2 py-1 rounded-full text-xs font-semibold"
            :class="value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
          >
           {{ value ? 'Active' : 'Inactive' }}
          </span>
      </template>
    </HrDataTable>

     <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Shift' : 'New Shift'"
      :loading="shiftStore.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
          <input
            v-model="form.shift_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Morning Shift"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input v-model="form.start_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input v-model="form.end_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>
         <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Break Start</label>
                <input v-model="form.break_start" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Break End</label>
                <input v-model="form.break_end" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This Shift will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue'; // Import Interface
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import notyf from "@/components/global/notyf"; // Import Notyf

const shiftStore = useHrShiftsStore();
// const shifts = computed(() => shiftStore.shifts); // No longer needed, HrDataTable uses shiftStore.shifts directly

onMounted(() => {
  shiftStore.getShifts();
});

// Headers for the table
const headers = [
  { label: 'Name', key: 'shift_name' },
  { label: 'Start Time', key: 'start_time' },
  { label: 'End Time', key: 'end_time' },
  { label: 'Break Start', key: 'break_start' },
  { label: 'Break End', key: 'break_end' },
  // { label: 'Status', key: 'is_active' },
];

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  shift_name: '',
  start_time: '',
  end_time: '',
  break_start: '',
  break_end: ''
});

// Helper to format HH:mm:ss to HH:mm for display
// (Input type="time" usually works with HH:mm)
const formatTime = (timeStr) => {
    if(!timeStr) return '--:--';
    // If API returns seconds, slice them off for display consistency if needed
    // or just return as is. The input type="time" expects HH:mm.
    return timeStr.slice(0, 5);
};

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
      shift_name: '',
      start_time: '09:00',
      end_time: '17:00',
      break_start: '12:00',
      break_end: '12:30'
      };
  showModal.value = true;
};

const openEditModal = (shift) => {
  isEditing.value = true;
  editingId.value = shift.id;
  form.value = { ...shift };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // shiftStore.error = null;
};

const handleSubmit = async () => {
  if (!form.value.shift_name || !form.value.start_time || !form.value.end_time) {
    notyf.error('Shift name, Start time, and End time are required');
    return;
  }

  // Basic validation: Check if start < end
  const start = form.value.start_time;
  const end = form.value.end_time;

  if (end <= start) { // For simple same-day shifts
      notyf.error('End Time must be after Start Time. If this is an overnight shift, please adjust logic or split shifts.');
      return;
  }

  // Validate break within shift
  if (form.value.break_start && form.value.break_end) {
      // Convert times to comparable format (e.g., minutes from midnight or Date objects)
      // For simplicity, comparing string HH:mm is usually sufficient if they are valid times
      // and we assume same day.
      if (form.value.break_start < start || form.value.break_end > end) {
          notyf.error('Break time must be within the shift hours.');
          return;
      }
      if (form.value.break_start >= form.value.break_end) {
          notyf.error('Break End must be after Break Start.');
          return;
      }
  }

  try {
    if (isEditing.value) {
      await shiftStore.updateShift(editingId.value, form.value);
    } else {
      await shiftStore.createShift(form.value);
    }
    closeModal();
  } catch (error) {
     console.error(error);
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await shiftStore.deleteShift(deleteId.value);
    } catch (error) {
      console.error(error);
    } finally {
      showDeleteConfirm.value = false;
      deleteId.value = null;
    }
  }
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
    deleteId.value = null;
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
