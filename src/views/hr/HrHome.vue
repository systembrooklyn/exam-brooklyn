<template>
  <!-- ── Stat Cards ────────────────────────────────────────── -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
    <!-- Stat uses hasPermission (not can) to avoid isAdminUser bypassing API calls the token doesn't allow -->
    <div
      v-if="authStore.hasPermission(HR_PERMISSION.VIEW_EMPLOYEE)"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between"
    >
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Total Employees</p>
        <h2 class="text-3xl font-bold text-gray-800">{{ employeesCount }}</h2>
        <p class="text-xs text-green-600 mt-2 flex items-center gap-1">
          <span class="bg-green-100 px-1 rounded">↑ Active</span> workforce
        </p>
      </div>
      <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
        <Users class="w-6 h-6" />
      </div>
    </div>

    <!-- Stat Card 2 -->
    <div
      v-if="authStore.hasPermission(HR_PERMISSION.VIEW_CONTRACT)"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between"
    >
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Active Contracts</p>
        <h2 class="text-3xl font-bold text-gray-800">{{ contractsCount }}</h2>
        <p class="text-xs text-gray-400 mt-2">All time</p>
      </div>
      <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
        <FileText class="w-6 h-6" />
      </div>
    </div>

    <!-- Stat Card 3 -->
    <div
      v-if="authStore.hasPermission(HR_PERMISSION.VIEW_DEPARTMENT)"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between"
    >
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Departments</p>
        <h2 class="text-3xl font-bold text-gray-800">{{ departmentsCount }}</h2>
        <p class="text-xs text-gray-400 mt-2">Operational</p>
      </div>
      <div class="p-3 bg-orange-50 rounded-xl text-orange-600">
        <Building class="w-6 h-6" />
      </div>
    </div>

    <!-- Stat Card 4 — Open Positions (live from API) -->
    <div
      v-if="authStore.can(HR_PERMISSION.VIEW_MANPOWER_PLANS)"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between"
    >
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">Open Positions</p>
        <h2 class="text-3xl font-bold text-gray-800">
          <span v-if="plansStore.loading" class="inline-block w-8 h-8 rounded-lg bg-gray-100 animate-pulse"></span>
          <span v-else>{{ openPositionsCount }}</span>
        </h2>
        <p class="text-xs mt-2" :class="openPositionsCount > 0 ? 'text-red-500' : 'text-emerald-500'">
          {{ openPositionsCount > 0 ? `${totalVacancies} vacancies to fill` : 'All positions filled ✓' }}
        </p>
      </div>
      <div class="p-3 bg-red-50 rounded-xl text-red-600">
        <Briefcase class="w-6 h-6" />
      </div>
    </div>
  </div>

  <!-- ── Bottom panels ─────────────────────────────────────── -->
  <div
    v-if="authStore.can(HR_PERMISSION.VIEW_MANPOWER_PLANS)"
    class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in delay-100"
  >

    <!-- Department Coverage Chart -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-indigo-400" /> Department Coverage
        </h3>
        <router-link
          :to="{ name: 'hr-manpower-overview' }"
          class="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
        >
          View all →
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="plansStore.loading || positionsStore.loading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>

      <!-- Empty / no plans yet -->
      <div v-else-if="deptCoverageRows.length === 0" class="flex flex-col items-center justify-center h-36 text-gray-300">
        <BarChart3 class="w-10 h-10 mb-2 opacity-40" />
        <p class="text-sm">No headcount plans set yet</p>
        <router-link :to="{ name: 'hr-manpower-overview' }" class="text-xs text-indigo-400 mt-1 hover:underline">Set plans →</router-link>
      </div>

      <!-- Bars -->
      <div v-else class="space-y-3">
        <div v-for="dept in deptCoverageRows" :key="dept.name">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-gray-600 truncate max-w-[130px]">{{ dept.name }}</span>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span>{{ dept.current }}/{{ dept.ideal }}</span>
              <span
                class="font-bold px-1.5 py-0.5 rounded"
                :class="dept.pct >= 80 ? 'text-emerald-600 bg-emerald-50' : dept.pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-500 bg-red-50'"
              >{{ dept.pct }}%</span>
            </div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-700"
              :class="dept.pct >= 80 ? 'bg-emerald-500' : dept.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'"
              :style="{ width: Math.min(dept.pct, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Open Positions Feed -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-red-400" /> Positions Needing Hires
        </h3>
        <router-link
          :to="{ name: 'hr-manpower-overview' }"
          class="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
        >
          Manage →
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="plansStore.loading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>

      <!-- All filled -->
      <div v-else-if="openPositionsFeed.length === 0" class="flex flex-col items-center justify-center h-36 text-gray-300">
        <CheckCircle class="w-10 h-10 mb-2 opacity-40 text-emerald-400" />
        <p class="text-sm text-emerald-500 font-semibold">All positions fully staffed!</p>
      </div>

      <!-- Feed list -->
      <div v-else class="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        <div
          v-for="item in openPositionsFeed"
          :key="item.plan.id"
          class="flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl"
        >
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Briefcase class="w-4 h-4 text-red-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-700 truncate">{{ item.positionName }}</p>
            <p class="text-xs text-gray-400 truncate">
              {{ item.deptName }} &nbsp;·&nbsp; <span class="text-indigo-600 font-semibold">{{ item.branchName }}</span>
            </p>
          </div>
          <div class="flex-shrink-0 text-right">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
              {{ item.vacancy }} needed
            </span>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ item.plan.current_count }}/{{ item.plan.ideal_count }}</p>
          </div>
        </div>
      </div>

      <!-- Overflow notice -->
      <p v-if="openPositionsFeed.length >= 8" class="text-xs text-gray-400 text-center mt-2">
        Showing top 8 —
        <router-link :to="{ name: 'hr-manpower-overview' }" class="text-indigo-400 hover:underline">see all</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { Users, FileText, Building, Briefcase, BarChart3, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useHrEmployeesStore }    from '@/stores/hr/employees';
import { useHrContractsStore }    from '@/stores/hr/contracts';
import { useHrDepartmentsStore }  from '@/stores/hr/departments';
import { useHrPositionsStore }    from '@/stores/hr/positions';
import { useManpowerPlansStore }  from '@/stores/hr/manpowerPlans';
import { useAuthStore }           from '@/stores/auth';
import { HR_PERMISSION }          from '@/constants/hrPermissions';

const authStore      = useAuthStore();
const empStore       = useHrEmployeesStore();
const contractStore  = useHrContractsStore();
const deptStore      = useHrDepartmentsStore();
const positionsStore = useHrPositionsStore();
const plansStore     = useManpowerPlansStore();

onMounted(async () => {
  const tasks = [];
  if (authStore.can(HR_PERMISSION.VIEW_EMPLOYEE))   tasks.push(empStore.getEmployees());
  if (authStore.can(HR_PERMISSION.VIEW_CONTRACT))   tasks.push(contractStore.getContracts());
  if (authStore.can(HR_PERMISSION.VIEW_DEPARTMENT)) tasks.push(deptStore.getDepartments());
  if (authStore.can(HR_PERMISSION.VIEW_MANPOWER_PLANS)) {
    tasks.push(positionsStore.getPositions());
    tasks.push(plansStore.getPlans());
  }
  await Promise.all(tasks);
});

const employeesCount  = computed(() => empStore.employees.length);
const contractsCount  = computed(() => contractStore.contracts.filter(c => c.is_active).length);
const departmentsCount = computed(() => deptStore.departments.length);

// ── Manpower stats ─────────────────────────────────────────────────────────
/** planByPositionId: quick lookup map using plan.position.id (nested object) */
const planByPositionId = computed(() => {
  const map = {};
  plansStore.plans.forEach(p => {
    const posId = plansStore.positionIdOf(p);
    if (posId != null) map[posId] = p;
  });
  return map;
});

/** Positions that have a plan AND still have vacancy */
const openPositionsCount = computed(() =>
  positionsStore.positions.filter(pos => {
    const plan = planByPositionId.value[pos.id];
    return plan && plansStore.vacancyOf(plan) > 0;
  }).length
);

/** Total number of open headcount slots across all positions */
const totalVacancies = computed(() =>
  plansStore.plans.reduce((sum, p) => sum + plansStore.vacancyOf(p), 0)
);

// ── Department coverage rows (for chart) ───────────────────────────────────
const deptCoverageRows = computed(() => {
  const map = {};
  positionsStore.positions.forEach(pos => {
    const deptName =
      pos.department?.name ||
      pos.department?.department_name ||
      deptStore.departments.find(d => d.id === pos.department_id)?.department_name ||
      'Unknown';
    if (!map[deptName]) map[deptName] = { name: deptName, ideal: 0, current: 0 };
    const plan = planByPositionId.value[pos.id];
    if (plan) {
      map[deptName].ideal   += plan.ideal_count   ?? 0;
      map[deptName].current += plan.current_count ?? 0;
    }
  });
  return Object.values(map)
    .filter(d => d.ideal > 0)
    .map(d => ({ ...d, pct: Math.round((d.current / d.ideal) * 100) }))
    .sort((a, b) => a.pct - b.pct);   // lowest coverage first = most urgent at top
});

// ── Open positions feed ────────────────────────────────────────────────────
const openPositionsFeed = computed(() => {
  return plansStore.plans
    .map(plan => {
      const vacancy = plansStore.vacancyOf(plan);
      if (vacancy === 0) return null;
      // Position name: prefer nested plan.position.name, fallback to positionsStore
      const posId = plansStore.positionIdOf(plan);
      const posFromStore = positionsStore.positions.find(p => p.id === posId);
      const positionName = plan.position?.name || posFromStore?.name || `Position #${posId}`;
      const deptName =
        plan.position?.department?.name ||
        posFromStore?.department?.name ||
        posFromStore?.department?.department_name ||
        '—';
      const branchName = plan.branch?.name || plan.branch?.branch_name || 'No Branch';
      return { plan, positionName, deptName, branchName, vacancy };
    })
    .filter(Boolean)
    .sort((a, b) => b.vacancy - a.vacancy)
    .slice(0, 8);
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}
.delay-100 {
  animation-delay: 0.1s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
