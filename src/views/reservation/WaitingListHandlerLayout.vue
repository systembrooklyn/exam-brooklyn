<template>
  <div class="w-full p-4 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="mb-3 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 gap-3">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </span>
          Waiting List Handler
        </h1>
        <!-- <p class="text-slate-400 text-xs mt-0.5">Manage, filter, and complete student reservations from the waiting list</p> -->
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 mb-3">
      <div class="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2">
        <h3 class="text-md font-bold text-indigo-900 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          Filter Reservations
        </h3>
        <button 
          @click="clearFilters" 
          class="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition"
        >
          Clear Filters
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 items-end">
        <!-- Status -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
          <select 
            v-model="filters.status" 
            class="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="manual">Manual</option>
            <option value="reserve">Reserve</option>
            <option value="ask">Ask</option>
            <option value="cancel">Cancel</option>
          </select>
        </div>

        <!-- Branch -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Branch</label>
          <select 
            v-model="filters.branch_id" 
            class="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition text-slate-700 font-medium disabled:opacity-60"
            :disabled="loadingBranches"
          >
            <option value="">{{ loadingBranches ? 'Loading branches...' : 'All Branches' }}</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <!-- Registered By -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Registered By</label>
          <multiselect 
            v-model="selectedRegisteredBy" 
            :options="employeeOptions" 
            :searchable="true" 
            :loading="employeeStore.loading"
            :close-on-select="true"
            :show-labels="false"
            placeholder="All Registrars"
            label="displayName"
            track-by="id"
          />
        </div>

        <!-- Reserved By -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Reserved By</label>
          <multiselect 
            v-model="selectedReservedBy" 
            :options="employeeOptions" 
            :searchable="true" 
            :loading="employeeStore.loading"
            :close-on-select="true"
            :show-labels="false"
            placeholder="All Reservative Agents"
            label="displayName"
            track-by="id"
          />
        </div>

        <!-- Called By -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Called By</label>
          <multiselect 
            v-model="selectedCalledBy" 
            :options="employeeOptions" 
            :searchable="true" 
            :loading="employeeStore.loading"
            :close-on-select="true"
            :show-labels="false"
            placeholder="All Caller Agents"
            label="displayName"
            track-by="id"
          />
        </div>

        <!-- Date From -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date From</label>
          <input 
            type="date" 
            v-model="filters.date_from" 
            class="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition text-slate-700 font-medium" 
          />
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date To</label>
          <input 
            type="date" 
            v-model="filters.date_to" 
            class="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition text-slate-700 font-medium" 
          />
        </div>

        <!-- Apply Button -->
        <div>
          <button 
            @click="applyFilters" 
            class="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-1.5 px-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-1.5 text-sm h-[38px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Panel -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <WaitingHandler
        :selectedStudents="selectedStudents"
        :students="reservations"
        :loading="loading"
        @studentChanged="addStudent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import WaitingHandler from "../../components/Reservation/WaitingHandler.vue";
import { useReservationStore } from "@/stores/reservations";
import { useEmployeeStore } from "@/stores/employeesStore";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const reservationStore = useReservationStore();
const employeeStore = useEmployeeStore();

const reservations = computed(() => reservationStore.reservations);
const loading = computed(() => reservationStore.loading);
const loadingBranches = computed(() => reservationStore.loadingBranches);
const employees = computed(() => employeeStore.employees);

const selectedStudents = ref([]);
const branches = computed(() => reservationStore.branches);

const filters = ref({
  registered_by: "",
  reserved_by: "",
  called_by: "",
  branch_id: "",
  status: "",
  date_from: "",
  date_to: "",
});

// Build searchable employee options with fingerprint details
const employeeOptions = computed(() => {
  return employees.value.map(emp => {
    const fp = emp.fingerprint ?? emp.personal_info?.fingerprint ?? emp.personal_info?.fingerPrint ?? emp.fingerPrint ?? '';
    return {
      ...emp,
      displayName: fp ? `${emp.name} (${fp})` : emp.name
    };
  });
});

// Computed properties to bind v-model on vue-multiselect objects with filter IDs
const selectedRegisteredBy = computed({
  get: () => employeeOptions.value.find(emp => emp.id === filters.value.registered_by) || null,
  set: (val) => {
    filters.value.registered_by = val ? val.id : "";
  }
});

const selectedReservedBy = computed({
  get: () => employeeOptions.value.find(emp => emp.id === filters.value.reserved_by) || null,
  set: (val) => {
    filters.value.reserved_by = val ? val.id : "";
  }
});

const selectedCalledBy = computed({
  get: () => employeeOptions.value.find(emp => emp.id === filters.value.called_by) || null,
  set: (val) => {
    filters.value.called_by = val ? val.id : "";
  }
});

const applyFilters = async () => {
  const cleanParams = {};
  Object.keys(filters.value).forEach((key) => {
    if (filters.value[key]) {
      cleanParams[key] = filters.value[key];
    }
  });
  await reservationStore.fetchReservations(cleanParams);
  
  // Clear selection if the selected student is no longer in the loaded list
  if (selectedStudents.value.length > 0) {
    const currentId = selectedStudents.value[0].id;
    const exists = reservationStore.reservations.some((r) => r.id === currentId);
    if (!exists) {
      selectedStudents.value = [];
    }
  }
};

const clearFilters = async () => {
  filters.value = {
    registered_by: "",
    reserved_by: "",
    called_by: "",
    branch_id: "",
    status: "",
    date_from: "",
    date_to: "",
  };
  await applyFilters();
};

const addStudent = (s) => {
  selectedStudents.value = [s];
};

onMounted(async () => {
  sessionStorage.removeItem("selectedReservation");
  
  // Call API direct when open waiting list tab to get normally data
  reservationStore.fetchReservations();
  
  // Load selectors metadata in parallel
  employeeStore.fetchEmployees();
  reservationStore.fetchBranches();
});
</script>

<style>
/* Custom overrides to make vue-multiselect blend into premium UI */
.multiselect__tags {
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 8px 40px 0 12px !important;
  min-height: 42px !important;
}
.multiselect__single {
  font-size: 14px !important;
  color: #334155 !important;
  font-weight: 500 !important;
  margin-bottom: 8px !important;
}
.multiselect__placeholder {
  font-size: 14px !important;
  color: #94a3b8 !important;
  margin-bottom: 8px !important;
}
.multiselect__select {
  height: 40px !important;
}
.multiselect__option--highlight {
  background: #4f46e5 !important;
}
</style>


