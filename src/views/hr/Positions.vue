<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Positions</h1>
        <p class="text-gray-500 mt-1">Manage positions and their hiring requirements</p>
      </div>
      <button
        v-if="authStore.can(HR_PERMISSION.CREATE_POSITION)"
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
      >
        <span class="text-lg leading-none">+</span> Add Position
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <select
        v-model="deptFilter"
        @change="onDeptFilterChange"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
          {{ dept.department_name }}
        </option>
      </select>

      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search positions..."
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-52"
        />
      </div>

      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="set">Requirements Set</option>
        <option value="unset">Pending</option>
      </select>

      <!-- Stats -->
      <div class="ml-auto flex items-center gap-2.5">
        <span class="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-100">
          <Briefcase class="w-3.5 h-3.5" />
          {{ positions.length }} Positions
        </span>
        <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-100">
          <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          {{ setCount }} Set
        </span>
        <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-100">
          <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
          {{ unsetCount }} Pending
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="positionsStore.loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredPositions.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400">
      <Briefcase class="w-10 h-10 mb-2 opacity-40" />
      <p class="text-base font-medium">No positions found</p>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide w-10">#</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">Position</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">Department</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Job Type</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Gender</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Salary</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Experience</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">Keywords</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Shifts</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(position, index) in filteredPositions"
              :key="position.id"
              class="hover:bg-gray-50/60 transition-colors"
            >
              <!-- # -->
              <td class="px-4 py-3.5 text-gray-400 font-medium text-xs">{{ index + 1 }}</td>

              <!-- Position -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase class="w-4 h-4 text-indigo-500" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="font-semibold text-gray-800 leading-snug">{{ position.name }}</span>
                    <span 
                      class="text-[10px] font-medium flex items-center gap-1 mt-0.5"
                      :class="requirementMap[position.id] ? 'text-emerald-600' : 'text-amber-600'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="requirementMap[position.id] ? 'bg-emerald-500' : 'bg-amber-400'"></span>
                      {{ requirementMap[position.id] ? 'Set' : 'Pending' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Department -->
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                  {{ position.department?.name || position.department?.department_name || departmentNameById(position.department_id) || '—' }}
                </span>
              </td>

              <!-- Job Type -->
              <td class="px-4 py-3.5 text-center">
                <span v-if="requirementMap[position.id]" :class="jobTypeClass(requirementMap[position.id].job_type)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap">
                  {{ formatJobType(requirementMap[position.id].job_type) }}
                </span>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Gender -->
              <td class="px-4 py-3.5 text-center">
                <span v-if="requirementMap[position.id]" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                  {{ requirementMap[position.id].gender || '—' }}
                </span>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Salary -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <template v-if="requirementMap[position.id] && (requirementMap[position.id].salary_min || requirementMap[position.id].salary_max)">
                  <span class="text-emerald-700 font-semibold text-xs">
                    {{ formatNum(requirementMap[position.id].salary_min) }}–{{ formatNum(requirementMap[position.id].salary_max) }}
                    <span class="text-emerald-400 font-normal">EGP</span>
                  </span>
                </template>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Experience -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <template v-if="requirementMap[position.id] && (requirementMap[position.id].experience_min != null || requirementMap[position.id].experience_max != null)">
                  <span class="text-gray-700 text-xs font-semibold">
                    {{ requirementMap[position.id].experience_min ?? 0 }}–{{ requirementMap[position.id].experience_max ?? '∞' }}
                    <span class="text-gray-400 font-normal">yrs</span>
                  </span>
                </template>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Keywords -->
              <td class="px-4 py-3.5 max-w-[160px]">
                <div v-if="requirementMap[position.id] && getKeywords(requirementMap[position.id]).length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="kw in getKeywords(requirementMap[position.id]).slice(0, 2)"
                    :key="kw"
                    class="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full"
                  >{{ kw }}</span>
                  <span v-if="getKeywords(requirementMap[position.id]).length > 2" class="text-xs text-gray-400 py-0.5">
                    +{{ getKeywords(requirementMap[position.id]).length - 2 }}
                  </span>
                </div>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Shifts -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <div v-if="requirementMap[position.id] && getShiftsNames(requirementMap[position.id]).length > 0" class="flex flex-wrap gap-1 justify-center max-w-[200px]">
                  <span
                    v-for="shiftName in getShiftsNames(requirementMap[position.id])"
                    :key="shiftName"
                    class="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium whitespace-nowrap"
                  >
                    {{ shiftName }}
                  </span>
                </div>
                <span v-else class="text-gray-200">—</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-2">
                  <!-- Requirements -->
                  <button
                    v-if="authStore.can(HR_PERMISSION.UPDATE_POSITION)"
                    @click="openRequirementsModal(position)"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    :class="requirementMap[position.id]
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                    :title="requirementMap[position.id] ? 'Edit Requirements' : 'Add Requirements'"
                  >
                    <ClipboardList class="w-3.5 h-3.5" />
                    <span>{{ requirementMap[position.id] ? 'Req.' : 'Add Req.' }}</span>
                  </button>

                  <!-- Edit Position -->
                  <button
                    v-if="authStore.can(HR_PERMISSION.UPDATE_POSITION)"
                    @click="openEditModal(position)"
                    class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Edit Position"
                  >
                    <Edit class="w-4 h-4" />
                  </button>

                  <!-- Delete -->
                  <button
                    v-if="authStore.can(HR_PERMISSION.DELETE_POSITION)"
                    @click="confirmDelete(position.id)"
                    class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Position"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Position Modal -->
    <HrModal
      :show="showPositionModal"
      :title="isEditing ? 'Edit Position' : 'New Position'"
      :loading="positionsStore.loading"
      @close="showPositionModal = false"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Position Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="e.g., Senior Engineer"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Department <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.department_id"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
          >
            <option :value="null">— Select Department —</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.department_name }}
            </option>
          </select>
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirm -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This position will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Requirements Modal -->
    <PositionRequirementsModal
      :show="showRequirementsModal"
      :position-id="activePositionId"
      @close="onRequirementsClose"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrPositionsStore } from '@/stores/hr/positions';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useHrPositionRequirementsStore } from '@/stores/hr/positionRequirements';
import { useAuthStore } from '@/stores/auth';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import PositionRequirementsModal from '@/components/hr-dashboard/PositionRequirementsModal.vue';
import notyf from '@/components/global/notyf';
import { Briefcase, ClipboardList, Search, Edit, Trash2 } from 'lucide-vue-next';

const positionsStore = useHrPositionsStore();
const deptsStore = useHrDepartmentsStore();
const requirementsStore = useHrPositionRequirementsStore();
const authStore = useAuthStore();

const positions = computed(() => positionsStore.positions);
const departments = computed(() => deptsStore.departments);

// ── Filters ──────────────────────────────────────────────
const deptFilter = ref('');
const searchQuery = ref('');
const statusFilter = ref('');

const filteredPositions = computed(() => {
  let list = positions.value;
  if (deptFilter.value) {
    list = list.filter(p =>
      (p.department_id ?? p.department?.id ?? p.department?.department_id) === Number(deptFilter.value)
    );
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(p => p.name?.toLowerCase().includes(q));
  }
  if (statusFilter.value === 'set')   list = list.filter(p =>  requirementMap.value[p.id]);
  if (statusFilter.value === 'unset') list = list.filter(p => !requirementMap.value[p.id]);
  return list;
});

const setCount   = computed(() => positions.value.filter(p =>  requirementMap.value[p.id]).length);
const unsetCount = computed(() => positions.value.filter(p => !requirementMap.value[p.id]).length);

// ── Helpers ───────────────────────────────────────────────
const departmentNameById = (id) => {
  if (!id) return null;
  return departments.value.find(d => d.id === Number(id))?.department_name ?? null;
};

const formatJobType = (val) => ({ full_time: 'Full Time', part_time: 'Part Time', freelance: 'Freelance' }[val] || val || '—');

const jobTypeClass = (val) => {
  if (val === 'full_time') return 'bg-sky-50 text-sky-700 border-sky-100';
  if (val === 'part_time') return 'bg-orange-50 text-orange-700 border-orange-100';
  if (val === 'freelance') return 'bg-violet-50 text-violet-700 border-violet-100';
  return 'bg-gray-50 text-gray-600 border-gray-100';
};

const formatNum = (val) => val ? Number(val).toLocaleString() : '0';

const getKeywords = (req) => {
  if (!req?.keywords) return [];
  if (Array.isArray(req.keywords)) return req.keywords;
  if (typeof req.keywords === 'string') {
    try { return JSON.parse(req.keywords); } catch { return req.keywords.split(',').map(k => k.trim()).filter(Boolean); }
  }
  return [];
};

const getShiftsNames = (req) => {
  if (!req?.shifts) return [];
  if (Array.isArray(req.shifts)) {
    return req.shifts.map(s => s.shift_name || s.name || `Shift ${s.id || s}`);
  }
  return [];
};

// ── Requirements map ──────────────────────────────────────
const requirementMap = ref({});

const loadAllRequirements = async () => {
  try {
    const res = await requirementsStore.getRequirements();
    const map = {};
    const list = res?.data || requirementsStore.requirements;
    list.forEach(req => { if (req.position_id) map[req.position_id] = req; });
    requirementMap.value = map;
  } catch (e) {
    console.error('Could not load requirements', e);
  }
};

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    positionsStore.getPositions(),
    deptsStore.getDepartments(),
    loadAllRequirements(),
  ]);
});

const onDeptFilterChange = async () => {
  await positionsStore.getPositions(deptFilter.value || null);
};

// ── Position CRUD ─────────────────────────────────────────
const showPositionModal = ref(false);
const isEditing        = ref(false);
const editingId        = ref(null);
const showDeleteConfirm = ref(false);
const deleteId         = ref(null);

const form = ref({ name: '', department_id: null });

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', department_id: null };
  showPositionModal.value = true;
};

const openEditModal = (position) => {
  isEditing.value = true;
  editingId.value = position.id;
  form.value = {
    name: position.name,
    department_id: position.department_id ?? position.department?.id ?? position.department?.department_id ?? null,
  };
  showPositionModal.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name?.trim()) { notyf.error('Position name is required'); return; }
  if (!form.value.department_id) { notyf.error('Department is required'); return; }
  try {
    if (isEditing.value) {
      await positionsStore.updatePosition(editingId.value, { name: form.value.name.trim(), department_id: Number(form.value.department_id) });
    } else {
      await positionsStore.createPosition({ name: form.value.name.trim(), department_id: Number(form.value.department_id) });
    }
    showPositionModal.value = false;
  } catch (e) { /* handled in store */ }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  showDeleteConfirm.value = false;
  if (!deleteId.value) return;
  await positionsStore.deletePosition(deleteId.value);
  deleteId.value = null;
};

// ── Requirements Modal ────────────────────────────────────
const showRequirementsModal = ref(false);
const activePositionId      = ref(null);

const openRequirementsModal = (position) => {
  activePositionId.value = position.id;
  showRequirementsModal.value = true;
};

const onRequirementsClose = async () => {
  showRequirementsModal.value = false;
  await loadAllRequirements();
};
</script>
