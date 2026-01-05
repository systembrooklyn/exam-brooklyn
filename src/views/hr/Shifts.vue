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
    <div v-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ store.error }}</span>
      <button @click="store.error = null" class="text-red-800 font-bold">×</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !shifts.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="shifts.length === 0" class="col-span-full text-center text-gray-500 py-10">
          No shifts configured.
      </div>

      <div v-for="shift in shifts" :key="shift.id" class="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow relative group">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg text-gray-800">{{ shift.shift_name }}</h3>
             <span class="text-xs text-gray-400">ID: {{ shift.id }}</span>
          </div>
          <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
             <Clock class="w-5 h-5"/>
          </div>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex justify-between"><span>Start Time:</span> <span class="font-medium text-gray-900">{{ formatTime(shift.start_time) }}</span></div>
          <div class="flex justify-between"><span>End Time:</span> <span class="font-medium text-gray-900">{{ formatTime(shift.end_time) }}</span></div>
          <div class="flex justify-between"><span>Break:</span> <span class="font-medium text-gray-900">{{ formatTime(shift.break_start) }} - {{ formatTime(shift.break_end) }}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button @click="confirmDelete(shift.id)" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors">Delete</button>
            <button @click="openEditModal(shift)" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors">Edit Details</button>
        </div>
      </div>
    </div>

     <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Shift' : 'New Shift'"
      :loading="store.loading"
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
import { onMounted, ref, computed } from 'vue';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import { Clock } from 'lucide-vue-next';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';

const store = useHrShiftsStore();
const shifts = computed(() => store.shifts);

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

onMounted(() => {
  store.getShifts();
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
  // store.error = null;
};

const handleSubmit = async () => {
  if (!form.value.shift_name) {
    alert('Shift name is required');
    return;
  }

  try {
    if (isEditing.value) {
      await store.updateShift(editingId.value, form.value);
    } else {
      await store.createShift(form.value);
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
      await store.deleteShift(deleteId.value);
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
