<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Position Requirements</h1>
        <p class="text-gray-500 mt-1">View and manage hiring requirements for each position</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="deptFilter"
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
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-56"
        />
      </div>

      <!-- Status filter -->
      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="set">Requirements Set</option>
        <option value="unset">Not Set</option>
      </select>

      <!-- Stats summary -->
      <div class="ml-auto flex items-center gap-3 text-sm text-gray-500">
        <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium border border-emerald-100">
          <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          {{ setCount }} Set
        </span>
        <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-medium border border-amber-100">
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
      <ClipboardList class="w-10 h-10 mb-2 opacity-40" />
      <p class="text-base font-medium">No positions found</p>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-600 w-8">#</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-600">Position</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-600">Department</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Job Type</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Gender</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Salary Range</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Experience</th>
              <th class="px-4 py-3.5 text-left font-semibold text-gray-600">Keywords</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Status</th>
              <th class="px-4 py-3.5 text-center font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(position, index) in filteredPositions"
              :key="position.id"
              class="hover:bg-gray-50/60 transition-colors group"
            >
              <!-- # -->
              <td class="px-4 py-3.5 text-gray-400 font-medium">{{ index + 1 }}</td>

              <!-- Position Name -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase class="w-4 h-4 text-indigo-500" />
                  </div>
                  <span class="font-semibold text-gray-800">{{ position.name }}</span>
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
                <template v-if="requirementMap[position.id]">
                  <span :class="jobTypeClass(requirementMap[position.id].job_type)" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap">
                    {{ formatJobType(requirementMap[position.id].job_type) }}
                  </span>
                </template>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Gender -->
              <td class="px-4 py-3.5 text-center">
                <template v-if="requirementMap[position.id]">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                    {{ requirementMap[position.id].gender || '—' }}
                  </span>
                </template>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Salary Range -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <template v-if="requirementMap[position.id] && (requirementMap[position.id].salary_min || requirementMap[position.id].salary_max)">
                  <span class="text-emerald-700 font-semibold text-xs">
                    {{ formatNum(requirementMap[position.id].salary_min) }} – {{ formatNum(requirementMap[position.id].salary_max) }}
                    <span class="text-emerald-500 font-normal">EGP</span>
                  </span>
                </template>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Experience -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <template v-if="requirementMap[position.id] && (requirementMap[position.id].experience_min != null || requirementMap[position.id].experience_max != null)">
                  <span class="text-gray-700 text-xs font-semibold">
                    {{ requirementMap[position.id].experience_min ?? 0 }}–{{ requirementMap[position.id].experience_max ?? '∞' }}
                    <span class="text-gray-400 font-normal">yrs</span>
                  </span>
                </template>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Keywords -->
              <td class="px-4 py-3.5 max-w-[180px]">
                <div v-if="requirementMap[position.id] && getKeywords(requirementMap[position.id]).length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="kw in getKeywords(requirementMap[position.id]).slice(0, 3)"
                    :key="kw"
                    class="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full"
                  >{{ kw }}</span>
                  <span v-if="getKeywords(requirementMap[position.id]).length > 3" class="text-xs text-gray-400 py-0.5">
                    +{{ getKeywords(requirementMap[position.id]).length - 3 }}
                  </span>
                </div>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3.5 text-center">
                <span v-if="requirementMap[position.id]" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Set
                </span>
                <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                  Pending
                </span>
              </td>

              <!-- Action -->
              <td class="px-4 py-3.5 text-center">
                <button
                  v-if="authStore.can(HR_PERMISSION.UPDATE_POSITION)"
                  @click="openRequirementsModal(position)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                  :class="requirementMap[position.id]
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                >
                  <ClipboardList class="w-3.5 h-3.5" />
                  {{ requirementMap[position.id] ? 'Edit' : 'Add' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Requirements Modal -->
    <PositionRequirementsModal
      :show="showRequirementsModal"
      :position-id="activePositionId"
      @close="onModalClose"
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
import PositionRequirementsModal from '@/components/hr-dashboard/PositionRequirementsModal.vue';
import { Briefcase, ClipboardList, Search } from 'lucide-vue-next';

const positionsStore = useHrPositionsStore();
const deptsStore = useHrDepartmentsStore();
const requirementsStore = useHrPositionRequirementsStore();
const authStore = useAuthStore();

const positions = computed(() => positionsStore.positions);
const departments = computed(() => deptsStore.departments);

const deptFilter = ref('');
const searchQuery = ref('');
const statusFilter = ref('');

const requirementMap = ref({});

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
  if (statusFilter.value === 'set') {
    list = list.filter(p => requirementMap.value[p.id]);
  } else if (statusFilter.value === 'unset') {
    list = list.filter(p => !requirementMap.value[p.id]);
  }
  return list;
});

const setCount = computed(() => positions.value.filter(p => requirementMap.value[p.id]).length);
const unsetCount = computed(() => positions.value.filter(p => !requirementMap.value[p.id]).length);

const departmentNameById = (id) => {
  if (!id) return null;
  const dept = departments.value.find(d => d.id === Number(id));
  return dept?.department_name ?? null;
};

const formatJobType = (val) => {
  const map = { full_time: 'Full Time', part_time: 'Part Time', freelance: 'Freelance' };
  return map[val] || val || '—';
};

const jobTypeClass = (val) => {
  if (val === 'full_time') return 'bg-sky-50 text-sky-700 border-sky-100';
  if (val === 'part_time') return 'bg-orange-50 text-orange-700 border-orange-100';
  if (val === 'freelance') return 'bg-violet-50 text-violet-700 border-violet-100';
  return 'bg-gray-50 text-gray-600 border-gray-100';
};

const formatNum = (val) => {
  if (!val) return '0';
  return Number(val).toLocaleString();
};

const getKeywords = (req) => {
  if (!req?.keywords) return [];
  if (Array.isArray(req.keywords)) return req.keywords;
  if (typeof req.keywords === 'string') {
    try { return JSON.parse(req.keywords); } catch { return req.keywords.split(',').map(k => k.trim()).filter(Boolean); }
  }
  return [];
};

const loadAllRequirements = async () => {
  try {
    const res = await requirementsStore.getRequirements();
    const map = {};
    const list = res?.data || requirementsStore.requirements;
    list.forEach(req => {
      if (req.position_id) map[req.position_id] = req;
    });
    requirementMap.value = map;
  } catch (e) {
    console.error('Could not load requirements', e);
  }
};

onMounted(async () => {
  await Promise.all([
    positionsStore.getPositions(),
    deptsStore.getDepartments(),
    loadAllRequirements(),
  ]);
});

// Modal
const showRequirementsModal = ref(false);
const activePositionId = ref(null);

const openRequirementsModal = (position) => {
  activePositionId.value = position.id;
  showRequirementsModal.value = true;
};

const onModalClose = async () => {
  showRequirementsModal.value = false;
  await loadAllRequirements();
};
</script>
