<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employee Requests</h1>
        <p class="text-gray-500 mt-1">Manage leave, overtime, and shift changes</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showPendingOnly = !showPendingOnly"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
          :class="showPendingOnly ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600'"
        >
          {{ showPendingOnly ? 'Show All' : 'Showing Pending' }}
        </button>
        <button
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span class="text-xl">+</span> New Request
        </button>
      </div>
    </div>

    <!-- Profile Missing Error -->
    <div v-if="profileError" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6">
        <div class="flex items-center gap-3">
            <LucideAlertTriangle class="w-5 h-5 flex-shrink-0" />
            <div>
                <p class="font-bold">Personal Profile Not Found</p>
                <p class="text-sm opacity-90">To view your requests or create new ones, you must first have an employee record linked to your user account. Please contact your HR administrator.</p>
            </div>
        </div>
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="requests"
      :loading="store.loading"
      emptyMessage="No requests found."
      :hasActions="false"
      :hasDelete="false"
      :hasEdit="false"
      @edit="null"
    >
      <template #status="{ item }">
        <span 
          class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
          :class="{
            'bg-yellow-100 text-yellow-700': item.status === 'pending',
            'bg-green-100 text-green-700': item.status === 'approved',
            'bg-red-100 text-red-700': item.status === 'rejected'
          }"
        >
          {{ item.status }}
        </span>
      </template>
      <template #actions="{ item }">
        <div v-if="item.status === 'pending'" class="flex gap-2 justify-center">
          <button @click="confirmApprove(item.id)" class="text-green-600 hover:text-green-800 p-1 cursor-pointer transition-transform hover:scale-125" title="Approve">
             <LucideCheckCircle class="w-6 h-6" />
          </button>
          <button @click="confirmReject(item.id)" class="text-red-600 hover:text-red-800 p-1 cursor-pointer transition-transform hover:scale-125" title="Reject">
             <LucideXCircle class="w-6 h-6" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <!-- New Request Modal -->
    <HrModal
      :show="showModal"
      title="Create New Request"
      :loading="store.loading"
      @close="showModal = false"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select v-model="form.request_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="lateness">Lateness</option>
            <option value="leave">Leave</option>
            <option value="overtime">Overtime</option>
            <option value="vacation">Vacation</option>
            <option value="day_off_swap">Day Off Swap</option>
            <option value="work_from_home">Work From Home</option>
            <option value="shift_move">Shift Move</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input v-model="form.day" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Hours (Lateness/Leave) -->
          <div v-if="['lateness', 'leave'].includes(form.request_type)" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
            <input v-model="form.duration_hours" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 2" />
          </div>

          <!-- Conditional: Day Replacement (Day Off Swap) -->
          <div v-if="form.request_type === 'day_off_swap'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
            <input v-model="form.day_replacement" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Type (Vacation) -->
          <div v-if="form.request_type === 'vacation'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
            <select v-model="form.duration_type" class="w-full border border-gray-300 rounded-lg px-4 py-2">
                <option value="full">Full Day</option>
                <option value="half">Half Day</option>
            </select>
          </div>

          <!-- From/To Time (Optional for most, usually for Overtime/Leave) -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">From Time</label>
            <input v-model="form.from_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
            <input v-model="form.to_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
        </div>
      </div>
    </HrModal>

    <!-- Confirmation Modals -->
    <SweetAlert2Modal
      v-if="showConfirmApprove"
      title="Approve Request?"
      text="Are you sure you want to approve this request?"
      icon="question"
      confirmButtonText="Yes, Approve"
      confirmButtonClass="bg-emerald-600 hover:bg-emerald-700"
      @confirm="handleApprove"
      @cancel="showConfirmApprove = false"
    />
    <!-- Rejection Modal -->
    <HrModal
      v-if="showConfirmReject"
      :show="showConfirmReject"
      title="Reject Request"
      :loading="store.loading"
      saveLabel="Reject"
      @close="showConfirmReject = false"
      @save="handleReject"
    >
      <div class="space-y-4">
        <div class="mb-4 text-gray-600">
           Are you sure you want to reject this request?
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
          <textarea 
            v-model="rejectionNote" 
            rows="4" 
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Please explain why this request is being rejected..."
          ></textarea>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useHrRequestsStore } from '@/stores/hr/requests';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import { LucideCheckCircle, LucideXCircle, LucideAlertTriangle } from 'lucide-vue-next';
import notyf from "@/components/global/notyf";

const store = useHrRequestsStore();
const requests = computed(() => store.requests);
const showPendingOnly = ref(false);
const showModal = ref(false);
const profileError = ref(false);

const showConfirmApprove = ref(false);
const showConfirmReject = ref(false);
const targetId = ref(null);
const rejectionNote = ref('');

const form = ref({
  request_type: 'leave',
  day: '',
  duration_hours: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full'
});

const headers = computed(() => {
  const baseHeaders = [
    { label: 'Type', key: 'request_type' },
    { label: 'Date', key: 'day' },
    { label: 'Status', key: 'status' },
  ];
  
  // Only show the column if we are in "Pending" view or if there ARE pending items to manage
  if (showPendingOnly.value || requests.value.some(r => r.status === 'pending')) {
    baseHeaders.push({ label: 'Actions', key: 'actions' });
  }
  
  return baseHeaders;
});

const fetchData = async () => {
  profileError.value = false;
  try {
    if (showPendingOnly.value) {
      await store.getPendingRequests();
    } else {
      await store.getMyRequests();
    }
    console.log("Current Requests list in view:", requests.value);
  } catch (e) {
    if (e.response?.status === 404 && e.response?.data?.message?.includes('profile')) {
      profileError.value = true;
    }
  }
};

onMounted(fetchData);
watch(showPendingOnly, fetchData);

const openAddModal = () => {
  form.value = { 
    request_type: 'leave', 
    day: '', 
    duration_hours: null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full'
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!form.value.day) {
    notyf.error('Please select a date');
    return;
  }

  // Build clean payload based on API rules
  const payload = {
    request_type: form.value.request_type,
    day: form.value.day,
    from_time: form.value.from_time || null,
    to_time: form.value.to_time || null,
  };

  // 1. duration_hours: required for "lateness and Leave" requests only
  if (['lateness', 'leave'].includes(form.value.request_type)) {
    if (!form.value.duration_hours) {
        notyf.error('Duration hours is required for this request type');
        return;
    }
    payload.duration_hours = parseInt(form.value.duration_hours);
  }

  // 2. day_replacement: required for "day off swap" requests only
  if (form.value.request_type === 'day_off_swap') {
    if (!form.value.day_replacement) {
        notyf.error('Replacement date is required for day off swap');
        return;
    }
    payload.day_replacement = form.value.day_replacement;
  }

  // 3. duration_type: required for "vacation" requests only
  if (form.value.request_type === 'vacation') {
    payload.duration_type = form.value.duration_type; // 'full' or 'half'
  }

  console.log("Submitting refined Request payload:", payload);

  try {
    await store.createRequest(payload);
    showModal.value = false;
    await fetchData();
  } catch (e) {
    console.error("Submission failed:", e);
  }
};

const confirmApprove = (id) => {
  targetId.value = id;
  showConfirmApprove.value = true;
};

const handleApprove = async () => {
  try {
    await store.approveRequest(targetId.value);
    await fetchData();
  } catch (e) {
    console.error("Approval failed:", e);
  } finally {
    showConfirmApprove.value = false;
  }
};

const confirmReject = (id) => {
  targetId.value = id;
  rejectionNote.value = '';
  showConfirmReject.value = true;
};

const handleReject = async () => {
  try {
    await store.rejectRequest(targetId.value, rejectionNote.value);
    await fetchData();
    showConfirmReject.value = false;
  } catch (e) {
    console.error("Rejection failed:", e);
  }
};
</script>
