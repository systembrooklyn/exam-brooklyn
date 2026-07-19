<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 class="w-6 h-6 text-indigo-500" />
          Manpower Overview
        </h1>
        <p class="text-gray-500 mt-1 text-sm">
          Track position staffing levels, vacancies, and department coverage grouped by branch
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.can(HR_PERMISSION.RECALC_ALL_MANPOWER_PLANS)"
          @click="handleRecalcAll"
          class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
          :disabled="plansStore.loading"
        >
          <RefreshCw class="w-4 h-4" :class="{'animate-spin': plansStore.loading}" />
          Recalculate All
        </button>
        <button
          v-if="authStore.can(HR_PERMISSION.CREATE_MANPOWER_PLANS)"
          @click="openPlanModal(null)"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Plus class="w-4 h-4" /> Set Headcount Plan
        </button>
      </div>
    </div>

    <!-- ── Summary Stat Cards ─────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Positions</p>
          <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
          <p class="text-xs text-gray-400 mt-1">Across all departments</p>
        </div>
        <div class="p-2.5 bg-indigo-50 rounded-xl text-indigo-500 flex-shrink-0">
          <Briefcase class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Filled</p>
          <p class="text-3xl font-bold text-emerald-600">{{ stats.filled }}</p>
          <p class="text-xs text-emerald-500 mt-1">Positions fully staffed</p>
        </div>
        <div class="p-2.5 bg-emerald-50 rounded-xl text-emerald-500 flex-shrink-0">
          <CheckCircle class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Open Vacancies</p>
          <p class="text-3xl font-bold text-red-500">{{ stats.openVacancies }}</p>
          <p class="text-xs text-red-400 mt-1">Across all branches</p>
        </div>
        <div class="p-2.5 bg-red-50 rounded-xl text-red-500 flex-shrink-0">
          <AlertCircle class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">No Plan Set</p>
          <p class="text-3xl font-bold text-amber-500">{{ stats.noPlan }}</p>
          <p class="text-xs text-amber-400 mt-1">Needs headcount goal</p>
        </div>
        <div class="p-2.5 bg-amber-50 rounded-xl text-amber-500 flex-shrink-0">
          <ClipboardList class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- ── Department Coverage ─────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" v-if="deptStats.length">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Building class="w-4 h-4 text-indigo-400" /> Department Coverage
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="dept in deptStats"
          :key="dept.name"
          class="bg-gray-50 rounded-xl p-4 border border-gray-100"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700 truncate">{{ dept.name }}</span>
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
              :class="dept.pct >= 80 ? 'bg-emerald-100 text-emerald-700' : dept.pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'"
            >{{ dept.pct }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="dept.pct >= 80 ? 'bg-emerald-500' : dept.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'"
              :style="{ width: dept.pct + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-400">
            {{ dept.current }} / {{ dept.ideal }} employees &nbsp;·&nbsp;
            <span class="font-semibold text-gray-500">{{ dept.positions }} positions</span>
          </p>
        </div>
      </div>
    </div>

    <!-- ── Filters ─────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search positions..."
            class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-52 bg-white"
          />
        </div>

        <select
          v-model="deptFilter"
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
        >
          <option value="">All Departments</option>
          <option v-for="d in uniqueDepts" :key="d" :value="d">{{ d }}</option>
        </select>

        <select
          v-model="statusFilter"
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="filled">Filled</option>
          <option value="open">Has Vacancy</option>
          <option value="no_plan">No Plan</option>
        </select>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <button
          @click="expandAll"
          class="px-2.5 py-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors border border-gray-200 bg-white cursor-pointer"
        >
          Expand All Branches
        </button>
        <button
          @click="collapseAll"
          class="px-2.5 py-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors border border-gray-200 bg-white cursor-pointer"
        >
          Collapse All
        </button>
      </div>
    </div>

    <!-- ── Main Table ──────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredRows.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400">
        <Briefcase class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No positions found</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-12">#</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Position / Branch</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Department</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Ideal</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Current</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Vacancy</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Coverage</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th
                v-if="authStore.can(HR_PERMISSION.CREATE_MANPOWER_PLANS) || authStore.can(HR_PERMISSION.UPDATE_MANPOWER_PLANS) || authStore.can(HR_PERMISSION.RECALC_MANPOWER_PLANS)"
                class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide"
              >Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-for="(row, idx) in filteredRows" :key="row.position.id">
              <!-- Parent Row: Position Aggregated Info -->
              <tr class="bg-white hover:bg-gray-50/40 transition-colors font-medium text-gray-800">
                <!-- # with Expand / Collapse Toggle -->
                <td class="px-4 py-3.5 text-gray-400 text-xs font-medium">
                  <div class="flex items-center gap-1">
                    <span>{{ idx + 1 }}</span>
                    <button
                      v-if="row.plans.length > 0"
                      @click="toggleExpand(row.position.id)"
                      class="text-gray-400 hover:text-gray-600 focus:outline-none p-0.5 rounded cursor-pointer transition-transform duration-200"
                    >
                      <ChevronDown v-if="expandedPositions.has(row.position.id)" class="w-3.5 h-3.5" />
                      <ChevronRight v-else class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                <!-- Position Name -->
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase class="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <span
                        class="font-bold text-gray-900 leading-snug cursor-pointer hover:underline"
                        @click="row.plans.length > 0 ? toggleExpand(row.position.id) : null"
                      >
                        {{ row.position.name }}
                      </span>
                      <span v-if="row.plans.length > 0" class="text-[10px] text-gray-400 block font-normal mt-0.5">
                        {{ row.plans.length }} branch plan(s)
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Department Name -->
                <td class="px-4 py-3.5">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                    {{ row.deptName }}
                  </span>
                </td>

                <!-- Aggregated Ideal -->
                <td class="px-4 py-3.5 text-center font-bold text-gray-700">
                  <span v-if="row.plans.length > 0">{{ row.ideal }}</span>
                  <span v-else class="text-gray-200">—</span>
                </td>

                <!-- Aggregated Current -->
                <td class="px-4 py-3.5 text-center font-bold text-gray-700">
                  <span v-if="row.plans.length > 0">{{ row.current }}</span>
                  <span v-else class="text-gray-200">—</span>
                </td>

                <!-- Aggregated Vacancy -->
                <td class="px-4 py-3.5 text-center">
                  <template v-if="row.plans.length > 0">
                    <span
                      v-if="row.vacancy > 0"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100"
                    >
                      <TrendingDown class="w-3 h-3" /> {{ row.vacancy }} needed
                    </span>
                    <span v-else class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle class="w-3 h-3" /> Full
                    </span>
                  </template>
                  <span v-else class="text-gray-200">—</span>
                </td>

                <!-- Aggregated Coverage Progress Bar -->
                <td class="px-4 py-3.5 text-center">
                  <template v-if="row.plans.length > 0">
                    <div class="flex items-center gap-2 justify-center">
                      <div class="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          class="h-1.5 rounded-full transition-all"
                          :class="row.pct >= 100 ? 'bg-emerald-500' : row.pct >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                          :style="{ width: Math.min(row.pct, 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs font-bold text-gray-500 w-9 text-left">{{ row.pct }}%</span>
                    </div>
                  </template>
                  <span v-else class="text-gray-200">—</span>
                </td>

                <!-- Aggregated Overall Status -->
                <td class="px-4 py-3.5 text-center">
                  <span :class="overallStatusBadge(row).cls" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap">
                    <component :is="overallStatusBadge(row).icon" class="w-3 h-3" />
                    {{ overallStatusBadge(row).label }}
                  </span>
                </td>

                <!-- Parent Actions: Set/Add Plan -->
                <td v-if="authStore.can(HR_PERMISSION.CREATE_MANPOWER_PLANS)" class="px-4 py-3.5 text-center">
                  <button
                    @click="openPlanModal(row)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Add branch plan"
                  >
                    <Plus class="w-3 h-3" /> Add Plan
                  </button>
                </td>
              </tr>

              <!-- Child Rows: Individual Branch Plans (Shown when expanded) -->
              <tr
                v-if="expandedPositions.has(row.position.id)"
                v-for="plan in row.plans"
                :key="'plan-' + plan.id"
                class="bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-b border-gray-100/50 text-xs text-gray-600"
              >
                <!-- Indented # Column -->
                <td class="px-4 py-2.5"></td>

                <!-- Branch Details with Icon -->
                <td class="px-4 py-2.5 pl-8">
                  <div class="flex items-center gap-1.5 text-gray-600 font-medium">
                    <MapPin class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Branch: {{ plan.branch?.name || plan.branch?.branch_name || 'No Branch' }}</span>
                    <span v-if="plan.notes" class="text-[10px] text-gray-400 font-normal">({{ plan.notes }})</span>
                  </div>
                </td>

                <!-- Empty Department for Child Row -->
                <td class="px-4 py-2.5 text-gray-300">—</td>

                <!-- Ideal Branch Count -->
                <td class="px-4 py-2.5 text-center font-semibold text-gray-700">
                  {{ plan.ideal_count }}
                </td>

                <!-- Current Branch Count -->
                <td class="px-4 py-2.5 text-center font-semibold text-gray-700">
                  {{ plan.current_count }}
                </td>

                <!-- Branch Vacancy -->
                <td class="px-4 py-2.5 text-center">
                  <span
                    v-if="plansStore.vacancyOf(plan) > 0"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100/60"
                  >
                    {{ plansStore.vacancyOf(plan) }} needed
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-500 border border-emerald-100/60">
                    Full ✓
                  </span>
                </td>

                <!-- Branch Coverage Progress Bar -->
                <td class="px-4 py-2.5 text-center">
                  <div class="flex items-center gap-2 justify-center">
                    <div class="w-12 bg-gray-100 rounded-full h-1">
                      <div
                        class="h-1 rounded-full transition-all"
                        :class="planCoveragePct(plan) >= 100 ? 'bg-emerald-500' : planCoveragePct(plan) >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                        :style="{ width: Math.min(planCoveragePct(plan), 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-[10px] font-medium text-gray-400 w-7 text-left">{{ planCoveragePct(plan) }}%</span>
                  </div>
                </td>

                <!-- Branch Plan Status -->
                <td class="px-4 py-2.5 text-center">
                  <span :class="statusBadge(plan).cls" class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap">
                    <component :is="statusBadge(plan).icon" class="w-2.5 h-2.5" />
                    {{ statusBadge(plan).label }}
                  </span>
                </td>

                <!-- Branch Plan Actions (Edit / Recalc / Delete) -->
                <td v-if="authStore.can(HR_PERMISSION.UPDATE_MANPOWER_PLANS) || authStore.can(HR_PERMISSION.DELETE_MANPOWER_PLANS) || authStore.can(HR_PERMISSION.RECALC_MANPOWER_PLANS)" class="px-4 py-2.5">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      v-if="authStore.can(HR_PERMISSION.RECALC_MANPOWER_PLANS)"
                      @click="handleRecalcPlan(plan.id)"
                      class="p-1 text-indigo-500 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                      title="Recalculate this plan"
                      :disabled="plansStore.loading"
                    >
                      <RefreshCw class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-if="authStore.can(HR_PERMISSION.UPDATE_MANPOWER_PLANS)"
                      @click="openPlanModal(row, plan)"
                      class="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="Edit branch plan"
                    >
                      <Edit class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-if="authStore.can(HR_PERMISSION.DELETE_MANPOWER_PLANS)"
                      @click="confirmDeletePlan(plan.id)"
                      class="p-1 text-red-400 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Remove branch plan"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Headcount Plan Modal ────────────────────────────── -->
    <HrModal
      :show="showPlanModal"
      :title="editingPlan ? 'Edit Headcount Plan' : 'Set Headcount Plan'"
      :loading="plansStore.loading"
      @close="showPlanModal = false"
      @save="handlePlanSave"
    >
      <div class="space-y-5">
        <!-- Position Select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Position <span class="text-red-500">*</span>
          </label>
          <select
            v-model="planForm.position_id"
            :disabled="!!editingPlan"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option :value="null">— Select position —</option>
            <option v-for="p in positionsStore.positions" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>

        <!-- Branch Select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Branch <span class="text-red-500">*</span>
          </label>
          <select
            v-model="planForm.branch_id"
            :disabled="!!editingPlan"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option :value="null">— Select Branch —</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">
              {{ b.name || b.branch_name }}
            </option>
          </select>
        </div>

        <!-- Headcount input fields -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ideal Headcount <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="planForm.ideal_count"
              type="number" min="1"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. 5"
            />
            <p class="text-xs text-gray-400 mt-1">Required number of employees</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Count</label>
            <input
              v-model.number="planForm.current_count"
              type="number" min="0"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. 3"
            />
            <p class="text-xs text-gray-400 mt-1">Current employees at this branch</p>
          </div>
        </div>

        <!-- Live preview -->
        <div v-if="planForm.ideal_count > 0" class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p class="text-xs font-semibold text-indigo-700 mb-2">Preview</p>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="w-full bg-indigo-100 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="previewPct >= 100 ? 'bg-emerald-500' : previewPct >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                  :style="{ width: Math.min(previewPct, 100) + '%' }"
                ></div>
              </div>
            </div>
            <span class="text-xs font-bold text-indigo-700">{{ previewPct }}%</span>
          </div>
          <p class="text-xs text-indigo-600 mt-1.5">
            {{ planForm.current_count || 0 }} / {{ planForm.ideal_count }} filled
            <span v-if="previewVacancy > 0" class="text-red-500 font-semibold ml-1">· {{ previewVacancy }} vacancy</span>
            <span v-else class="text-emerald-600 font-semibold ml-1">· Fully staffed ✓</span>
          </p>
        </div>
      </div>
    </HrModal>

    <!-- ── Delete Confirm ─────────────────────────────────── -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Remove Headcount Plan?"
      text="This will delete the staffing plan for this branch. The position itself will remain."
      icon="warning"
      @confirm="handleDeletePlan"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Briefcase, CheckCircle, AlertCircle, ClipboardList, Search,
  Building, Plus, BarChart3, TrendingDown, Trash2,
  ChevronDown, ChevronRight, MapPin, Edit, RefreshCw
} from 'lucide-vue-next';
import { useManpowerPlansStore } from '@/stores/hr/manpowerPlans';
import { useHrPositionsStore } from '@/stores/hr/positions';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useReservationStore } from '@/stores/reservations';
import { useAuthStore } from '@/stores/auth';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import notyf from '@/components/global/notyf';

const plansStore      = useManpowerPlansStore();
const positionsStore  = useHrPositionsStore();
const deptsStore      = useHrDepartmentsStore();
const reservationStore = useReservationStore();
const authStore       = useAuthStore();

// ── Filters ───────────────────────────────────────────────────────────────
const searchQuery = ref('');
const deptFilter  = ref('');
const statusFilter = ref('');

// ── Loading ────────────────────────────────────────────────────────────────
const loading = computed(() => plansStore.loading || positionsStore.loading || reservationStore.loadingBranches);

// ── Dropdowns / Options ────────────────────────────────────────────────────
const branches = computed(() => reservationStore.branches);

// ── Expand/Collapse Positions State ────────────────────────────────────────
const expandedPositions = ref(new Set());

const toggleExpand = (posId) => {
  if (expandedPositions.value.has(posId)) {
    expandedPositions.value.delete(posId);
  } else {
    expandedPositions.value.add(posId);
  }
};

const expandAll = () => {
  allRows.value.forEach(r => {
    if (r.plans.length > 0) expandedPositions.value.add(r.position.id);
  });
};

const collapseAll = () => {
  expandedPositions.value.clear();
};

// ── Computed Rows with Aggregation & Grouping ────────────────────────────────
/** Group plans by position.id */
const plansByPositionId = computed(() => {
  const map = {};
  plansStore.plans.forEach(p => {
    const posId = plansStore.positionIdOf(p);
    if (posId != null) {
      if (!map[posId]) map[posId] = [];
      map[posId].push(p);
    }
  });
  return map;
});

/** Aggregate position rows with all their branch plans */
const allRows = computed(() => {
  return positionsStore.positions.map(position => {
    const plans = plansByPositionId.value[position.id] || [];
    const deptName =
      position.department?.name ||
      position.department?.department_name ||
      deptsStore.departments.find(d => d.id === position.department_id)?.department_name ||
      '—';

    // Sum details across all plans for this position
    const ideal   = plans.reduce((sum, p) => sum + (p.ideal_count || 0), 0);
    const current = plans.reduce((sum, p) => sum + (p.current_count || 0), 0);
    const vacancy = plans.reduce((sum, p) => sum + plansStore.vacancyOf(p), 0);
    const pct     = ideal > 0 ? Math.round((current / ideal) * 100) : 0;

    return { position, plans, deptName, ideal, current, vacancy, pct };
  });
});

const uniqueDepts = computed(() => [...new Set(allRows.value.map(r => r.deptName).filter(n => n !== '—'))].sort());

const filteredRows = computed(() => {
  let rows = allRows.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    rows = rows.filter(r => r.position.name?.toLowerCase().includes(q));
  }
  if (deptFilter.value) {
    rows = rows.filter(r => r.deptName === deptFilter.value);
  }
  if (statusFilter.value === 'filled')  rows = rows.filter(r => r.plans.length > 0 && r.vacancy === 0);
  if (statusFilter.value === 'open')    rows = rows.filter(r => r.plans.length > 0 && r.vacancy > 0);
  if (statusFilter.value === 'no_plan') rows = rows.filter(r => r.plans.length === 0);
  return rows;
});

// ── Summary statistics ──────────────────────────────────────────────────────
const stats = computed(() => {
  const all = allRows.value;
  return {
    total:         all.length,
    filled:        all.filter(r => r.plans.length > 0 && r.vacancy === 0).length,
    openVacancies: plansStore.plans.reduce((sum, p) => sum + plansStore.vacancyOf(p), 0),
    noPlan:        all.filter(r => r.plans.length === 0).length,
  };
});

// ── Department statistics ───────────────────────────────────────────────────
const deptStats = computed(() => {
  const map = {};
  allRows.value.forEach(row => {
    const key = row.deptName;
    if (!map[key]) map[key] = { name: key, positions: 0, ideal: 0, current: 0 };
    map[key].positions++;
    row.plans.forEach(plan => {
      map[key].ideal   += plan.ideal_count   ?? 0;
      map[key].current += plan.current_count ?? 0;
    });
  });
  return Object.values(map)
    .filter(d => d.name !== '—')
    .map(d => ({ ...d, pct: d.ideal > 0 ? Math.round((d.current / d.ideal) * 100) : 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// ── Status Badges Helpers ───────────────────────────────────────────────────
const overallStatusBadge = (row) => {
  if (row.plans.length === 0) return { cls: 'bg-amber-50 text-amber-600 border-amber-100', label: 'No Plan', icon: ClipboardList };
  if (row.vacancy === 0) return { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Filled', icon: CheckCircle };
  return { cls: 'bg-red-50 text-red-600 border-red-100', label: `${row.vacancy} Open`, icon: AlertCircle };
};

const statusBadge = (plan) => {
  const vacancy = plansStore.vacancyOf(plan);
  if (vacancy === 0) return { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100/60', label: 'Filled', icon: CheckCircle };
  return { cls: 'bg-red-50 text-red-600 border-red-100/60', label: `${vacancy} Open`, icon: AlertCircle };
};

const planCoveragePct = (plan) =>
  plan.ideal_count > 0 ? Math.round((plan.current_count / plan.ideal_count) * 100) : 0;

// ── Plan Modal actions ─────────────────────────────────────────────────────
const showPlanModal = ref(false);
const editingPlan   = ref(null);
const planForm      = ref({ position_id: null, branch_id: null, ideal_count: 1, current_count: 0 });

const previewPct     = computed(() =>
  planForm.value.ideal_count > 0
    ? Math.round(((planForm.value.current_count || 0) / planForm.value.ideal_count) * 100)
    : 0
);
const previewVacancy = computed(() =>
  Math.max(0, planForm.value.ideal_count - (planForm.value.current_count || 0))
);

const openPlanModal = (row, plan = null) => {
  if (plan) {
    editingPlan.value = plan;
    planForm.value = {
      position_id:   row.position.id,
      branch_id:     plan.branch?.id ?? plan.branch_id ?? null,
      ideal_count:   plan.ideal_count,
      current_count: plan.current_count,
    };
  } else {
    editingPlan.value = null;
    planForm.value = {
      position_id:   row?.position?.id ?? null,
      branch_id:     null,
      ideal_count:   1,
      current_count: 0,
    };
  }
  showPlanModal.value = true;
};

const handlePlanSave = async () => {
  if (!planForm.value.position_id) {
    notyf.error('Please select a position.');
    return;
  }
  if (!planForm.value.branch_id) {
    notyf.error('Please select a branch.');
    return;
  }
  if (!planForm.value.ideal_count || planForm.value.ideal_count < 1) {
    notyf.error('Ideal headcount must be at least 1.');
    return;
  }

  const payload = {
    position_id:   planForm.value.position_id,
    branch_id:     planForm.value.branch_id,
    ideal_count:   planForm.value.ideal_count,
    current_count: planForm.value.current_count || 0
  };

  try {
    if (editingPlan.value) {
      await plansStore.updatePlan(editingPlan.value.id, payload);
    } else {
      await plansStore.createPlan(payload);
    }
    showPlanModal.value = false;
  } catch (_) { /* handled in store */ }
};

// ── Delete Plan actions ────────────────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deletingPlanId    = ref(null);

const confirmDeletePlan = (id) => {
  deletingPlanId.value = id;
  showDeleteConfirm.value = true;
};
const handleDeletePlan = async () => {
  try {
    await plansStore.deletePlan(deletingPlanId.value);
    showDeleteConfirm.value = false;
  } catch (_) { /* handled in store */ }
};

const handleRecalcAll = async () => {
  try {
    await plansStore.recalcAll();
    // Full refresh: plans + positions so all stats and rows update
    await Promise.all([
      plansStore.getPlans(),
      positionsStore.getPositions(),
    ]);
  } catch (_) {}
};

const handleRecalcPlan = async (id) => {
  try {
    await plansStore.recalcPlan(id);
    // Full table refresh so stats cards and all rows reflect the change
    await Promise.all([
      plansStore.getPlans(),
      positionsStore.getPositions(),
    ]);
  } catch (_) {}
};

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    plansStore.getPlans(),
    positionsStore.getPositions(),
    deptsStore.getDepartments(),
    reservationStore.fetchBranches(),
  ]);

  // Auto-expand positions that already have plans set by default
  allRows.value.forEach(r => {
    if (r.plans.length > 0) {
      expandedPositions.value.add(r.position.id);
    }
  });
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
