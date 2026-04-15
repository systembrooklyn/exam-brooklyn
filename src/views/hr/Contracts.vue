<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Contracts</h1>
        <p class="text-gray-500 mt-1">Manage employee contracts and terms</p>
      </div>
      <button
        v-if="authStore.can(HR_PERMISSION.CREATE_CONTRACT)"
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
        <span class="text-xl">+</span> New Contract
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search employee..."
        class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />

      <select v-model="typeFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
        <option value="">All Types</option>
        <option value="new">New</option>
        <option value="old">Old</option>
        <option value="hourly">Hourly</option>
        <option value="online">Online</option>
      </select>

      <select v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
        <option value="">All Status</option>
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </select>
    </div>

    <!-- Error -->
    <div v-if="contractStore.error"
      class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ contractStore.error }}</span>
      <button @click="contractStore.error = null" class="text-red-800 font-bold cursor-pointer">×</button>
    </div>



    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredContracts"
      :loading="contractStore.loading"
      emptyMessage="No contracts found."
      :has-delete="false"
      :has-edit="authStore.can(HR_PERMISSION.UPDATE_CONTRACT)"
      @edit="openEditModal"
    >
      <template #employee="{ item }">
        <span class="font-medium text-gray-900">
          {{ item.employee?.name?.trim() || getEmployeeName(item.employee_id) || '—' }}
        </span>
      </template>

      <template #shift="{ item }">
        <div class="text-gray-600 text-xs space-y-1">
          <template v-if="getContractShiftDisplayRows(item).length">
            <div
              v-for="(row, index) in getContractShiftDisplayRows(item)"
              :key="`${item.id}-shift-row-${row.shift_id ?? row.shift?.id}-${index}`"
            >
              {{ formatContractShiftRow(row) }}
            </div>
          </template>
          <span v-else class="block">
            {{ item.shift?.shift_name || getShiftLabelById(item.shift_id) || '-' }}
            <span v-if="item.shift">({{ formatTime(item.shift.start_time) }} - {{ formatTime(item.shift.end_time)
              }})</span>
          </span>
        </div>
      </template>

      <template #fixed_monthly_salary="{ value }">
        <span class="font-mono text-gray-700">
          {{ value }}
        </span>
      </template>

      <template #is_active="{ value }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold"
          :class="(value || value === 1) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
          {{ (value || value === 1) ? 'Active' : 'Inactive' }}
        </span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal :show="showModal" :title="isEditing ? 'Edit Contract' : 'New Contract'" :loading="contractStore.loading"
      maxWidthClass="max-w-4xl" @close="closeModal" @save="handleSubmit">
      <div class="space-y-4">
        <!-- Tabs Header -->
        <div class="flex border-b border-gray-200 mb-4 overflow-x-auto">
          <button @click="activeTab = 'general'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer"
            :class="activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
            General
          </button>
          <button @click="activeTab = 'schedule'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer"
            :class="activeTab === 'schedule' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
            Schedule
          </button>
          <button @click="activeTab = 'salary'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer"
            :class="activeTab === 'salary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
            Salary
          </button>
          <button @click="activeTab = 'status'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer"
            :class="activeTab === 'status' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
            Status
          </button>
        </div>

        <!-- General Tab -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee <span
                    class="text-red-500">*</span></label>
                <select v-model="form.employee_id"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                  :disabled="isEditing">
                  <option :value="null">Select Employee</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.personal_info?.first_name }} {{ emp.personal_info?.last_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <select v-model="form.type"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                  <option value="new">New</option>
                  <option value="old">Old</option>
                  <option value="hourly">Hourly</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Duration & Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date <span
                    class="text-red-500">*</span></label>
                <input v-model="form.start_date" type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date <span
                    class="text-red-500">*</span></label>
                <input v-model="form.end_date" type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="form.description" rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter contract details..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Tab -->
        <div v-if="activeTab === 'schedule'" class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Shift Configuration
            </h3>
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  @click="setScheduleMode('single')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  :class="scheduleMode === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                >
                  Single Shift
                </button>
                <button
                  type="button"
                  @click="setScheduleMode('double')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  :class="scheduleMode === 'double' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                >
                  Two Shifts
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4" :class="scheduleMode === 'double' ? 'lg:grid-cols-2' : ''">
                <div
                  v-for="(shiftEntry, index) in activeShiftEntries"
                  :key="`form-shift-${index}`"
                  class="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-gray-800">
                      {{ scheduleMode === 'double' ? `Shift ${index + 1}` : 'Shift' }}
                    </h4>
                    <span class="text-xs text-gray-500">{{ shiftEntry.days.length }} day(s)</span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                    <select
                      v-model="shiftEntry.shift_id"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                      <option :value="null">Select Shift</option>
                      <option v-for="shift in shifts" :key="shift.id" :value="shift.id">
                        {{ shift.shift_name }} ({{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Assigned Days</label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="(day, dayIndex) in daysOfWeek"
                        :key="`${index}-${dayIndex}`"
                        type="button"
                        @click="toggleShiftDay(index, dayIndex)"
                        :disabled="isShiftDayDisabled(index, dayIndex)"
                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                        :class="shiftEntry.days.includes(dayIndex) ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'"
                      >
                        {{ day }}
                      </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                      Pick only working days. Days off and duplicate selections are blocked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Working Conditions
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Days</label>
                <input v-model="form.weekly_working_days" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label>
                <input v-model="form.weekly_working_hours" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Days Off Count</label>
                <input v-model="form.days_off_count" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Detailed Days Off
            </h3>
            <div>
              <div class="flex flex-wrap gap-2">
                <button v-for="(day, index) in daysOfWeek" :key="index" type="button" @click="toggleDayOff(index)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer"
                  :class="form.day_off.includes(index) ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-2 ring-indigo-600 ring-offset-2' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
                  {{ day }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Working days: {{ workingDaysCount }} / Assigned shift days: {{ assignedShiftDaysCount }}
              </p>
            </div>
          </div>
        </div>

        <!-- Salary Tab -->
        <div v-if="activeTab === 'salary'" class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Compensation
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div :class="form.type === 'hourly' ? 'md:col-span-1' : 'md:col-span-2'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fixed Monthly Salary <span
                    class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-2 top-2.5 text-gray-500 text-xs">EGP</span>
                  <input v-model="form.fixed_monthly_salary" type="number"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div v-if="form.type === 'hourly'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Hours Limit</label>
                <input v-model="form.max_hours_limit" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div :class="form.type === 'hourly' ? 'md:col-span-1' : 'md:col-span-2'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Other variable amounts</label>
                <input v-model="form.other_var_amounts" type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>


        <!-- Status Tab -->
        <div v-if="activeTab === 'status'" class="space-y-4">
          <div class="flex items-center gap-3 p-4 border border-gray-100 rounded-lg bg-gray-50">
            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="form.is_active" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600">
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700">Contract Is Active</span>
            </label>
            <p class="text-xs text-gray-500">Only one contract should be active per employee.</p>
          </div>
        </div>

      </div>

    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal v-if="showDeleteConfirm" title="Are you sure?" text="This Contract will be deleted permanently."
      icon="warning" @confirm="handleDeleteConfirm" @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrContractsStore } from '@/stores/hr/contracts';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import { handleError } from '@/stores/handleError';
import { useAuthStore } from '@/stores/auth';
import { HR_PERMISSION } from '@/constants/hrPermissions';

const contractStore = useHrContractsStore();
const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const shiftStore = useHrShiftsStore();

const employees = computed(() => employeeStore.employees);
const shifts = computed(() => shiftStore.shifts);
const contracts = computed(() => contractStore.contracts);

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const defaultShiftEntry = () => ({ shift_id: null, days: [] });
const scheduleMode = ref('single');

const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');

// Table Headers
const headers = [
  { label: 'Employee', key: 'employee' },
  { label: 'Type', key: 'type' },
  { label: 'Shift', key: 'shift' },
  { label: 'Start Date', key: 'start_date' },
  { label: 'End Date', key: 'end_date' },
  { label: 'Salary', key: 'fixed_monthly_salary' },
  { label: 'Active', key: 'is_active' },
];

const getEmployeeName = (id) => {
  const emp = employees.value.find((e) => Number(e.id) === Number(id));
  if (!emp) return '';
  if (emp.personal_info) {
    return `${emp.personal_info.first_name ?? ''} ${emp.personal_info.last_name ?? ''}`.trim();
  }
  if (emp.name) return String(emp.name).trim();
  return `Emp #${id}`;
};

/** Align search with table display: API `employee.name`, store name, id. */
const contractEmployeeSearchText = (c) => {
  const parts = [
    c?.employee?.name,
    getEmployeeName(c?.employee_id),
    c?.employee_id != null && c?.employee_id !== '' ? String(c.employee_id) : '',
  ];
  return parts
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const filteredContracts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return contracts.value.filter((c) => {
    const matchesSearch = !q || contractEmployeeSearchText(c).includes(q);
    const matchesType = !typeFilter.value || c.type === typeFilter.value;

    // Handle boolean vs number 0/1 or string "0"/"1" for isActive
    const isActive = c.is_active == 1 || c.is_active == true;
    const matchesStatus = statusFilter.value === '' || isActive === statusFilter.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('general');

// Delete Confirmation (Assuming Contract Deletion exists, if not, this is dormant but ready)
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const createDefaultForm = () => ({
  employee_id: null,
  shift_id: null,
  shifts: [defaultShiftEntry()],
  type: 'new',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  weekly_working_hours: 40,
  weekly_working_days: 5,
  days_off_count: 2,
  day_off: [5, 6],
  fixed_monthly_salary: '',
  max_hours_limit: 0,
  other_var_amounts: 0,
  description: '',
  is_active: true,
});

const form = ref({
  ...createDefaultForm(),
});

onMounted(async () => {
  await contractStore.getContracts();
  await employeeStore.getEmployees();
  await shiftStore.getShifts();
});

const formatTime = (time) => {
  if (!time) return '';

  // Extract hours and minutes from "HH:MM:SS" format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const min = minutes;

  // Convert to 12-hour format
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${min} ${period}`;
};

const getShiftLabelById = (shiftId) => {
  const n = Number(shiftId);
  if (!Number.isFinite(n)) return '-';
  const shift = shifts.value.find((s) => Number(s.id) === n);
  if (!shift) return `Shift #${n}`;
  return `${shift.shift_name} (${formatTime(shift.start_time)} - ${formatTime(shift.end_time)})`;
};

const normalizeNumericDays = (days) => {
  const unique = new Set();
  (Array.isArray(days) ? days : []).forEach((day) => {
    const n = Number(day);
    if (Number.isInteger(n) && n >= 0 && n <= 6) unique.add(n);
  });
  return [...unique].sort((a, b) => a - b);
};

const normalizeShiftEntries = (entries) => {
  const normalized = (Array.isArray(entries) ? entries : []).map((entry) => ({
    shift_id: entry?.shift_id != null && entry?.shift_id !== '' ? Number(entry.shift_id) : null,
    days: normalizeNumericDays(entry?.days),
  }));
  return normalized.filter((entry) => entry.shift_id || entry.days.length);
};

/** API list/detail: `contract_shifts[]` with nested `shift` and `days` / `day_names`. */
const normalizeContractShiftsEntries = (rows) => {
  if (!Array.isArray(rows) || !rows.length) return [];
  return rows
    .map((row) => {
      const sid =
        row?.shift_id != null && row?.shift_id !== ''
          ? Number(row.shift_id)
          : row?.shift?.id != null && row?.shift?.id !== ''
            ? Number(row.shift.id)
            : null;
      return {
        shift_id: Number.isFinite(sid) ? sid : null,
        days: normalizeNumericDays(row?.days),
      };
    })
    .filter((entry) => entry.shift_id != null && Number.isFinite(entry.shift_id));
};

/** Prefer `contract_shifts` (API), then flat `shifts`, for table display. */
const getContractShiftDisplayRows = (item) => {
  if (Array.isArray(item?.contract_shifts) && item.contract_shifts.length) {
    return item.contract_shifts;
  }
  if (Array.isArray(item?.shifts) && item.shifts.length) {
    return item.shifts;
  }
  return [];
};

const formatContractShiftRow = (row) => {
  const embedded = row?.shift;
  if (embedded?.shift_name) {
    return `${embedded.shift_name} (${formatTime(embedded.start_time)} - ${formatTime(embedded.end_time)})`;
  }
  return getShiftLabelById(row?.shift_id);
};

const activeShiftEntries = computed(() =>
  scheduleMode.value === 'double' ? form.value.shifts.slice(0, 2) : form.value.shifts.slice(0, 1),
);

const workingDaysCount = computed(() => 7 - form.value.day_off.length);

const assignedShiftDaysCount = computed(() => {
  const merged = activeShiftEntries.value.flatMap((entry) => entry.days);
  return new Set(merged).size;
});

const ensureShiftEntriesForMode = (mode) => {
  if (!Array.isArray(form.value.shifts) || form.value.shifts.length === 0) {
    form.value.shifts = [defaultShiftEntry()];
  }
  if (mode === 'double') {
    if (!form.value.shifts[1]) form.value.shifts.push(defaultShiftEntry());
  } else {
    form.value.shifts = [form.value.shifts[0] || defaultShiftEntry()];
  }
};

const setScheduleMode = (mode) => {
  scheduleMode.value = mode;
  ensureShiftEntriesForMode(mode);
};

const toggleDayOff = (dayIndex) => {
  if (form.value.day_off.includes(dayIndex)) {
    form.value.day_off = form.value.day_off.filter(d => d !== dayIndex);
  } else {
    form.value.day_off.push(dayIndex);
  }
  form.value.day_off = normalizeNumericDays(form.value.day_off);
  form.value.days_off_count = form.value.day_off.length;
  const offSet = new Set(form.value.day_off);
  form.value.shifts = form.value.shifts.map((entry) => ({
    ...entry,
    days: normalizeNumericDays(entry.days).filter((day) => !offSet.has(day)),
  }));
};

const isShiftDayDisabled = (shiftIndex, dayIndex) => {
  if (form.value.day_off.includes(dayIndex)) return true;
  return activeShiftEntries.value.some((entry, idx) => idx !== shiftIndex && entry.days.includes(dayIndex));
};

const toggleShiftDay = (shiftIndex, dayIndex) => {
  const entry = activeShiftEntries.value[shiftIndex];
  if (!entry || isShiftDayDisabled(shiftIndex, dayIndex)) return;
  if (entry.days.includes(dayIndex)) {
    entry.days = entry.days.filter((d) => d !== dayIndex);
  } else {
    entry.days = [...entry.days, dayIndex];
  }
  entry.days = normalizeNumericDays(entry.days);
};

const hydrateFormFromContract = (contract) => {
  const normalizedDayOff = normalizeNumericDays(contract?.day_off);
  const fromContractShifts = normalizeContractShiftsEntries(contract?.contract_shifts);
  const fromFlatShifts = normalizeShiftEntries(contract?.shifts);
  const incomingShifts = fromContractShifts.length ? fromContractShifts : fromFlatShifts;
  const fallbackShiftId = contract?.shift?.id ?? contract?.shift_id ?? null;
  const fallbackShifts = fallbackShiftId ? [{ shift_id: Number(fallbackShiftId), days: [] }] : [];
  const shiftsPayload = incomingShifts.length ? incomingShifts : fallbackShifts;
  const finalShifts = shiftsPayload.length ? shiftsPayload : [defaultShiftEntry()];

  form.value = {
    ...createDefaultForm(),
    ...contract,
    employee_id: contract?.employee ? Number(contract.employee.id) : Number(contract?.employee_id) || null,
    shift_id: finalShifts[0]?.shift_id ?? null,
    shifts: finalShifts,
    day_off: normalizedDayOff,
    days_off_count: normalizedDayOff.length,
    is_active: contract?.is_active === 1 || contract?.is_active === true,
  };

  scheduleMode.value = finalShifts.length > 1 ? 'double' : 'single';
  ensureShiftEntriesForMode(scheduleMode.value);
};

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = createDefaultForm();
  scheduleMode.value = 'single';
  ensureShiftEntriesForMode('single');
  activeTab.value = 'general';
  showModal.value = true;
};

const openEditModal = async (contract) => {
  isEditing.value = true;
  editingId.value = contract.id;
  hydrateFormFromContract(contract);

  activeTab.value = 'general';
  showModal.value = true;
  try {
    const fullContract = await contractStore.getContract(contract.id);
    if (showModal.value && editingId.value === contract.id) {
      hydrateFormFromContract(fullContract);
    }
  } catch (error) {
    console.warn('Failed to fetch fresh contract data:', error);
  }
};



const closeModal = () => {
  showModal.value = false;
};

const buildValidatedShiftAssignments = () => {
  const shiftsPayload = activeShiftEntries.value.map((entry) => ({
    shift_id: entry.shift_id != null && entry.shift_id !== '' ? Number(entry.shift_id) : null,
    days: normalizeNumericDays(entry.days),
  }));

  if (shiftsPayload.some((entry) => !Number.isFinite(entry.shift_id))) {
    notyf.error('Please select shift for each configured schedule block.');
    return null;
  }

  if (
    scheduleMode.value === 'double' &&
    shiftsPayload[0]?.shift_id != null &&
    shiftsPayload[0].shift_id === shiftsPayload[1]?.shift_id
  ) {
    notyf.error('Please choose two different shifts for the double-shift mode.');
    return null;
  }

  const offSet = new Set(form.value.day_off);
  const flattened = shiftsPayload.flatMap((entry) => entry.days);

  if (flattened.some((day) => offSet.has(day))) {
    notyf.error('Shift days cannot include selected days off.');
    return null;
  }

  if (new Set(flattened).size !== flattened.length) {
    notyf.error('A day cannot be assigned to more than one shift.');
    return null;
  }

  if (flattened.length !== workingDaysCount.value) {
    notyf.error(`Please assign exactly ${workingDaysCount.value} working day(s) across shifts.`);
    return null;
  }

  if (scheduleMode.value === 'single' && shiftsPayload[0].days.length !== workingDaysCount.value) {
    notyf.error('Single-shift mode requires all working days assigned to the same shift.');
    return null;
  }

  return shiftsPayload.map((entry) => ({
    shift_id: Number(entry.shift_id),
    days: normalizeNumericDays(entry.days),
  }));
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.type || !form.value.start_date || !form.value.fixed_monthly_salary) {
    notyf.error('Please fill in core fields (Employee, Type, Start Date, Salary).');
    return;
  }

  const normalizedDayOff = normalizeNumericDays(form.value.day_off);
  form.value.day_off = normalizedDayOff;
  form.value.days_off_count = normalizedDayOff.length;

  const shiftsPayload = buildValidatedShiftAssignments();
  if (!shiftsPayload) {
    return;
  }

  const { contract_shifts: _omitContractShifts, ...formRest } = form.value;
  const payload = {
    ...formRest,
    shifts: shiftsPayload,
    shift_id: shiftsPayload[0]?.shift_id ?? null,
    is_active: form.value.is_active ? 1 : 0,
    employee_id: Number(form.value.employee_id),
    weekly_working_hours: Number(form.value.weekly_working_hours) || 0,
    weekly_working_days: workingDaysCount.value,
    days_off_count: normalizedDayOff.length,
    day_off: normalizedDayOff,
    fixed_monthly_salary: Number(form.value.fixed_monthly_salary) || 0,
    other_var_amounts: Number(form.value.other_var_amounts) || 0,
    max_hours_limit: Number(form.value.max_hours_limit) || 0,
  };

  try {
    if (isEditing.value) {
      await contractStore.updateContract(editingId.value, payload);
    } else {
      await contractStore.createContract(payload);
    }
    closeModal();
  } catch (error) {
    console.error("Submission failed:", error);
    handleError(error);
  }
};

const confirmDelete = (id) => {
  // Note: Contracts API doc didn't explicitly mention delete, 
  // but implement logic just in case user wants enabled later or provided
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await contractStore.deleteContract(deleteId.value);
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
