<template>
  <div
    class="min-h-screen w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-4 bg-gray-50/50 dark:bg-gray-900/50 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Tag class="w-6 h-6" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Price Settings
          </h1>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-300">
            {{ store.priceSettings.length }} categories
          </span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
          Configure payment methods, exam papers, and grade adjustments modifiers.
        </p>
      </div>

      <div class="flex items-center gap-3.5 self-start sm:self-auto">
        <!-- View mode switcher -->
        <div
          class="flex items-center bg-gray-100 dark:bg-gray-850 p-1 rounded-xl shadow-inner border border-gray-200/40 dark:border-gray-700/40">
          <button @click="viewMode = 'table'"
            :class="viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-650 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
            <List class="w-3.5 h-3.5" />
            Table
          </button>
          <button @click="viewMode = 'chart'"
            :class="viewMode === 'chart' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-650 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
            <GitBranch class="w-3.5 h-3.5" />
            Mind Map
          </button>
        </div>

        <div @click="openAddModal" class="buttons">
          <button class="btn"><span></span>
            <p data-start="good luck!" data-text="ADD!" data-title="new Setting"></p>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-6 space-y-4 animate-pulse">
      <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4 mb-6"></div>
      <div class="space-y-4">
        <div v-for="i in 5" :key="i"
          class="grid grid-cols-8 gap-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded col-span-2"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>

    <template v-else>

      <!-- ── Tab Bar ──────────────────────────────────────────── -->
      <div v-if="viewMode === 'table'"
        class="flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-1.5 mb-4 overflow-x-auto no-scrollbar">
        <button v-for="tab in TABS" :key="tab.key" @click="activeTab = tab.key" :class="[
          activeTab === tab.key ? tabActiveClass(tab.color) : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer'
        ]">
          <component :is="tab.icon" class="w-4 h-4 flex-shrink-0" />
          {{ tab.label }}
          <span
            :class="activeTab === tab.key ? tabBadgeActiveClass(tab.color) : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
            class="inline-flex items-center justify-center min-w-[1.35rem] h-5 px-1 rounded-full text-[10px] font-bold transition-all">
            {{ tabCount(tab.key) }}
          </span>
        </button>
      </div>

      <!-- ── Table Card ─────────────────────────────────────────── -->
      <div v-if="viewMode === 'table'"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden">

        <!-- Tab Summary Strip -->
        <div class="px-5 py-3 border-b border-gray-150 dark:border-gray-700/60 flex items-center gap-3">
          <span :class="tabDotClass(activeTabDef?.color)" class="w-2.5 h-2.5 rounded-full flex-shrink-0"></span>
          <span class="text-sm font-bold text-gray-900 dark:text-white">{{ activeTab }}</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ tabItems.length }} {{ tabItems.length === 1 ?
            'entry' : 'entries' }}</span>
          <div class="flex-1"></div>
          <!-- <button @click="openAddModal" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
            <Plus class="w-3.5 h-3.5" />
            Add {{ activeTab }}
          </button> -->
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs border-collapse text-center">
            <thead class="bg-slate-50/75 dark:bg-slate-900/40 border-b border-gray-150 dark:border-gray-700/60">
              <tr>
                <th
                  class="px-2.5 py-3 text-left font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Name</th>
                <th
                  class="px-2.5 py-3 text-left font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Description</th>
                <th
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Modifier</th>
                <th
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Amount Type</th>
                <th
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Amount</th>
                <!-- Payment Method specific -->
                <th v-if="activeTab === 'Payment Method'"
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  DL Count</th>
                <th v-if="activeTab === 'Payment Method'"
                  class="px-2.5 py-3 font-bold text-blue-500 dark:text-blue-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  1st Deadline</th>
                <th v-if="activeTab === 'Payment Method'"
                  class="px-2.5 py-3 font-bold text-indigo-500 dark:text-indigo-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Interval</th>
                <th v-if="activeTab === 'Payment Method'"
                  class="px-2.5 py-3 font-bold text-amber-500 dark:text-amber-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Forced Start</th>
                <!-- Parents (hidden for Grade) -->
                <th v-if="activeTab !== 'Grade'"
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Parents</th>
                <!-- Children (Payment Method + Grade) -->
                <th v-if="activeTab === 'Payment Method' || activeTab === 'Grade'"
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Children</th>
                <th
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Active</th>
                <th
                  class="px-2.5 py-3 font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">
                  Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">

              <!-- Empty state per tab -->
              <tr v-if="tabItems.length === 0">
                <td :colspan="tableColspan" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center max-w-xs mx-auto space-y-4">
                    <div :class="tabEmptyIconClass(activeTabDef?.color)" class="p-4 rounded-full ring-8">
                      <component :is="activeTabDef?.icon" class="w-8 h-8" />
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">No {{ activeTab }} entries yet
                      </h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Create the first {{ activeTab }}
                        pricing rule to get started.</p>
                    </div>
                    <button @click="openAddModal"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all duration-200 cursor-pointer">
                      <Plus class="w-4 h-4" />
                      Add {{ activeTab }}
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Data rows -->
              <template v-for="item in tabItems" :key="item.id">
                <tr class="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-150">
                  <!-- Name -->
                  <td class="px-2.5 py-3 text-left min-w-[130px]">
                    <div class="flex flex-col items-start gap-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <!-- Clickable name: toggles scholarship expansion row -->
                        <button @click="toggleDescription(item.id)"
                          class="flex items-center gap-1.5 group cursor-pointer">
                          <span
                            class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-left">
                            {{ item.name }}
                          </span>
                          <!-- Scholarship count badge -->
                          <span v-if="item.scholarships && item.scholarships.length"
                            :class="expandedDescriptions.has(item.id) ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'"
                            class="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full text-[9px] font-bold transition-all"
                            :title="item.scholarships.length + ' scholarship(s)'">
                            {{ item.scholarships.length }}
                          </span>
                          <!-- chevron -->
                          <ChevronRight class="w-3 h-3 transition-all duration-200"
                            :class="expandedDescriptions.has(item.id) ? 'rotate-90 text-indigo-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-indigo-400'" />
                        </button>
                      </div>
                      <!-- Parent Badge below name -->
                      <span v-if="item.children && item.children.length"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-100/50 uppercase tracking-wider">
                        Parent
                      </span>
                    </div>
                  </td>

                  <!-- Description -->
                  <td class="px-2.5 py-3 text-left min-w-[110px] max-w-[170px]">
                    <span v-if="item.description"
                      class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2"
                      :title="item.description">
                      {{ item.description }}
                    </span>
                    <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
                  </td>

                  <!-- Modifier -->
                  <td class="px-2.5 py-3">
                    <span :class="modifierBadgeClass(item.modifier)"
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                      {{ item.modifier }}
                    </span>
                  </td>

                  <!-- Amount Type -->
                  <td
                    class="px-2.5 py-3 text-gray-600 dark:text-gray-300 capitalize font-medium text-xs whitespace-nowrap">
                    {{ item.amount_type }}</td>

                  <!-- Amount -->
                  <td class="px-2.5 py-3 text-gray-900 dark:text-gray-100 font-bold font-mono text-sm whitespace-nowrap">
                    {{ formatAmount(item.amount, item.amount_type) }}
                  </td>

                  <!-- Payment Method only: DL Count -->
                  <td v-if="activeTab === 'Payment Method'"
                    class="px-2.5 py-3 text-gray-500 dark:text-gray-400 font-mono text-sm">
                    {{ item.dl_count != null ? item.dl_count : '—' }}
                  </td>

                  <!-- Payment Method only: First Deadline -->
                  <td v-if="activeTab === 'Payment Method'"
                    class="px-2.5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    <span v-if="item.first_deadline_days != null"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 text-[10px] font-semibold">
                      {{ item.first_deadline_days }}d
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>

                  <!-- Payment Method only: Interval -->
                  <td v-if="activeTab === 'Payment Method'"
                    class="px-2.5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    <span v-if="item.interval_days != null"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 text-[10px] font-semibold">
                      {{ item.interval_days }}d
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>

                  <!-- Payment Method only: Forced Start -->
                  <td v-if="activeTab === 'Payment Method'"
                    class="px-2.5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    <span v-if="item.forced_start_date"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:amber-300 text-[10px] font-semibold">
                      {{ String(item.forced_start_date).substring(0, 10) }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>

                  <!-- Parents (hidden for Grade) -->
                  <td v-if="activeTab !== 'Grade'" class="px-2.5 py-3">
                    <div v-if="item.parents && item.parents.length"
                      class="flex flex-wrap gap-1 justify-center max-w-[160px] mx-auto">
                      <span v-for="p in item.parents" :key="p.id"
                        class="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-semibold border border-indigo-100/60">
                        {{ p.name }}
                      </span>
                    </div>
                    <span v-else class="text-gray-400 dark:text-gray-550 text-xs">—</span>
                  </td>

                  <!-- Children (Payment Method + Grade only) -->
                  <td v-if="activeTab === 'Payment Method' || activeTab === 'Grade'" class="px-2.5 py-3">
                    <div v-if="item.children && item.children.length"
                      class="flex flex-wrap gap-1 justify-center max-w-[160px] mx-auto">
                      <span v-for="c in item.children" :key="c.id"
                        class="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                        {{ c.name }}
                      </span>
                    </div>
                    <span v-else class="text-gray-400 dark:text-gray-550 text-xs">—</span>
                  </td>

                  <!-- Active -->
                  <td class="px-2.5 py-3">
                    <span
                      :class="item.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                      {{ item.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-2.5 py-3">
                    <div class="flex items-center justify-center gap-1.5">
                      <button @click="editPriceSetting(item)"
                        class="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-all duration-200 cursor-pointer shadow-sm"
                        title="Edit">
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button @click="duplicatePriceSetting(item)"
                        class="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-all duration-200 cursor-pointer shadow-sm"
                        title="Duplicate">
                        <Copy class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Scholarship Expansion Row -->
                <tr v-if="expandedDescriptions.has(item.id)"
                  class="bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100/60 dark:border-indigo-900/30">
                  <td :colspan="tableColspan" class="px-6 py-4">
                    <div class="flex flex-col gap-3">
                      <!-- Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span
                            class="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Scholarships
                            linked to {{ item.name }}</span>
                          <span
                            class="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                            {{ item.scholarships && item.scholarships.length ? item.scholarships.length : 0 }}
                          </span>
                        </div>
                        <button @click="toggleDescription(item.id)"
                          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <!-- No scholarships -->
                      <div v-if="!item.scholarships || !item.scholarships.length"
                        class="flex items-center gap-2 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
                        <Tag class="w-3.5 h-3.5" />
                        No scholarships linked to this price setting.
                      </div>

                      <!-- Scholarship cards grid -->
                      <div v-else class="flex flex-wrap gap-2">
                        <div v-for="sch in item.scholarships" :key="sch.id"
                          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 group">
                          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                          <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ sch.name }}</span>
                          <span v-if="sch.study_type || sch.type"
                            class="px-1.5 py-0.25 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 uppercase tracking-wide">
                            {{ (sch.study_type || sch.type).charAt(0).toUpperCase() + (sch.study_type ||
                              sch.type).slice(1).toLowerCase() }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

            </tbody>
          </table>
        </div>
      </div>

      <!-- Mind Map Tree View -->
      <MindMapTree v-else-if="viewMode === 'chart'" :tree-data="mindmapTree" :format-amount="formatAmount"
        :format-scholarship-name="formatScholarshipName" :type-badge-class="typeBadgeClass"
        :modifier-badge-class="modifierBadgeClass" :rule-node-class="ruleNodeClass" @edit-node="editPriceSetting" />
    </template>

    <!-- ─── Add / Edit Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
          @mousedown.self="closeModal">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all transform scale-100 animate-slide-up">
            <!-- Modal Header -->
            <div
              class="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-white dark:from-indigo-950/15 dark:to-gray-800">
              <div class="flex items-center gap-3">
                <span class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Tag class="w-5 h-5" />
                </span>
                <div>
                  <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-none">
                    {{ isEditing ? 'Edit Price Setting' : 'New Price Setting' }}
                  </h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {{ isEditing ? 'Update pricing rules and properties' : 'Configure a new pricing rule in the system'
                    }}
                  </p>
                </div>
              </div>
              <button @click="closeModal"
                class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-605 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <!-- Name -->
              <div>
                <label
                  class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Name
                  <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" placeholder="e.g. VIP Addition Tier"
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <!-- Grid: Type & Modifier -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Type
                    <span class="text-red-500">*</span></label>
                  <select v-model="form.type"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <option value="">Select type</option>
                    <option value="Payment Method">Payment Method</option>
                    <option value="Grade">Grade</option>
                    <option value="Paper">Paper</option>
                    <option value="Fees">Fees</option>
                    <option value="Sub Payment Method">Sub Payment Method</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Modifier
                    <span class="text-red-500">*</span></label>
                  <select v-model="form.modifier"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <option value="">Select modifier</option>
                    <option value="addition">Addition</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label
                  class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Description</label>
                <textarea v-model="form.description" rows="2" placeholder="Describe the usage of this pricing rule..."
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"></textarea>
              </div>

              <!-- Grid: Amount Type & Amount -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Amount
                    Type <span class="text-red-500">*</span></label>
                  <select v-model="form.amount_type"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <option value="">Select type</option>
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Amount
                    <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input v-model="form.amount" type="number" min="0" step="0.01" placeholder="0.00"
                      class="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    <span
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-550 uppercase pointer-events-none">
                      {{ form.amount_type === 'percentage' ? '%' : 'EGP' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Payment Method Deadlines (Conditional) -->
              <div v-if="form.type === 'Payment Method'"
                class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30">
                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">First
                    Deadline (Days)</label>
                  <input v-model="form.first_deadline_days" type="number" min="0" placeholder="e.g. 15"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Interval
                    (Days)</label>
                  <input v-model="form.interval_days" type="number" min="0" placeholder="e.g. 2"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                  <label
                    class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Forced
                    Start Date</label>
                  <input v-model="form.forced_start_date" type="date"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <!-- DL Count -->
              <div v-if="form.type === 'Payment Method'">
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  DL Count <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
                </label>
                <input v-model="form.dl_count" type="number" min="0" placeholder="e.g. 1"
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <!-- Parents MultiSelect -->
              <div v-if="form.type !== 'Grade'">
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Parents <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
                </label>
                <MultiSelect v-model="form.parent_ids" :options="parentOptions" placeholder="Select parent settings..."
                  label-key="name" value-key="id" />
              </div>

              <!-- Children MultiSelect -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Children <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
                </label>
                <MultiSelect v-model="form.children_ids" :options="childrenOptions"
                  placeholder="Select children settings..." label-key="name" value-key="id" />
              </div>

              <!-- Scholarships MultiSelect -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Scholarships
                </label>
                <MultiSelect v-model="form.scholarship_ids" :options="scholarshipStore.scholarships"
                  placeholder="Select scholarships..." label-key="name" value-key="id" />
              </div>

              <!-- Is Active toggle -->
              <div
                class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <button type="button" @click="form.is_active = !form.is_active"
                  :class="form.is_active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'"
                  class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer">
                  <span :class="form.is_active ? 'translate-x-6' : 'translate-x-1'"
                    class="absolute top-1 left-0 inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"></span>
                </button>
                <div>
                  <span class="text-sm font-semibold text-gray-955 dark:text-white block leading-none">
                    {{ form.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="text-xs text-gray-400 mt-1.5 block">
                    Toggle to enable or disable this pricing rule.
                  </span>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/60 flex justify-end gap-3">
              <button @click="closeModal"
                class="px-4 py-2 text-sm font-semibold text-gray-650 dark:text-gray-300 hover:text-gray-850 dark:hover:text-white rounded-xl hover:bg-gray-105 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                Cancel
              </button>
              <button @click="savePriceSetting" :disabled="saving"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/10">
                <span v-if="saving"
                  class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isEditing ? 'Update Rule' : 'Create Rule' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePriceSettingsStore } from '@/stores/priceSettingsStore'
import { useScholarshipStore } from '@/stores/scholarships'
import { ChevronRight, CornerDownRight, Pencil, X, Tag, Plus, List, GitBranch, CreditCard, Layers, GraduationCap, FileText, Receipt, Copy } from 'lucide-vue-next'
import notyf from '@/components/global/notyf'
import MultiSelect from '@/components/global/MultiSelect.vue'
import MindMapTree from '@/components/dashboard/MindMapTree.vue'

const store = usePriceSettingsStore()
const scholarshipStore = useScholarshipStore()

const viewMode = ref('table')

// ─── Tab definitions ──────────────────────────────────────
const TABS = [
  { key: 'Payment Method', label: 'Payment Method', icon: CreditCard, color: 'blue' },
  { key: 'Sub Payment Method', label: 'Sub Payment', icon: Layers, color: 'cyan' },
  { key: 'Grade', label: 'Grade', icon: GraduationCap, color: 'purple' },
  { key: 'Paper', label: 'Paper', icon: FileText, color: 'amber' },
  { key: 'Fees', label: 'Fees', icon: Receipt, color: 'emerald' },
]

const activeTab = ref('Payment Method')

const activeTabDef = computed(() => TABS.find(t => t.key === activeTab.value))

const tabItems = computed(() =>
  store.priceSettings.filter(item => item.type === activeTab.value)
)

const tabCount = (key) => store.priceSettings.filter(item => item.type === key).length

// Dynamic colspan for empty state row
const tableColspan = computed(() => {
  if (activeTab.value === 'Payment Method') return 13  // 4 base + 4 PM + parents + children + scholarships + active + actions
  if (activeTab.value === 'Grade') return 8           // 4 base + children + scholarships + active + actions
  return 8                                            // 4 base + parents + scholarships + active + actions
})

// Tab colour helpers
const tabActiveClass = (color) => {
  const map = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 shadow-sm',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm',
  }
  return map[color] ?? 'bg-indigo-50 text-indigo-700 shadow-sm'
}

const tabBadgeActiveClass = (color) => {
  const map = {
    blue: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300',
    purple: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
    amber: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
  }
  return map[color] ?? 'bg-indigo-100 text-indigo-700'
}

const tabDotClass = (color) => {
  const map = {
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }
  return map[color] ?? 'bg-indigo-500'
}

const tabEmptyIconClass = (color) => {
  const map = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-400 ring-blue-100/60 dark:ring-blue-900/40',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-400 ring-cyan-100/60 dark:ring-cyan-900/40',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-400 ring-purple-100/60 dark:ring-purple-900/40',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-400 ring-amber-100/60 dark:ring-amber-900/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-400 ring-emerald-100/60 dark:ring-emerald-900/40',
  }
  return map[color] ?? 'bg-gray-50 text-gray-400 ring-gray-100/60'
}

const mindmapTree = computed(() => {
  const root = {
    id: 'root',
    name: 'Price Settings',
    type: 'Root',
    children: []
  }

  // Root rules are price settings with no parents
  const parents = store.priceSettings.filter(item => !item.parents || item.parents.length === 0)

  root.children = parents.map(p => {
    const pNode = {
      id: `rule-${p.id}`,
      name: p.name,
      type: p.type,
      modifier: p.modifier,
      amount: p.amount,
      amount_type: p.amount_type,
      is_active: p.is_active,
      rawItem: p,
      children: []
    }

    // Add direct scholarships
    if (p.scholarships && p.scholarships.length) {
      p.scholarships.forEach(s => {
        pNode.children.push({
          id: `sch-${p.id}-${s.id}`,
          name: s.name,
          type: 'Scholarship',
          study_type: s.study_type,
          price: s.price,
          children: []
        })
      })
    }

    // Add child rules with unique parent-child concatenated IDs
    if (p.children && p.children.length) {
      p.children.forEach(c => {
        const cNode = {
          id: `rule-${p.id}-${c.id}`, // UNIQUE
          name: c.name,
          type: c.type,
          modifier: c.modifier,
          amount: c.amount,
          amount_type: c.amount_type,
          is_active: c.is_active,
          rawItem: c,
          children: []
        }

        // Add child scholarships with unique parent-child-scholarship concatenated IDs
        if (c.scholarships && c.scholarships.length) {
          c.scholarships.forEach(cs => {
            cNode.children.push({
              id: `sch-${p.id}-${c.id}-${cs.id}`, // UNIQUE
              name: cs.name,
              type: 'Scholarship',
              study_type: cs.study_type,
              price: cs.price,
              children: []
            })
          })
        }

        pNode.children.push(cNode)
      })
    }

    return pNode
  })

  return root
})

// ─── Table: expandable children rows ─────────────────────
const expandedRows = ref(new Set())

const toggleChildren = (id) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
  // Trigger reactivity on the Set
  expandedRows.value = new Set(expandedRows.value)
}

const expandedDescriptions = ref(new Set())

const toggleDescription = (id) => {
  if (expandedDescriptions.value.has(id)) {
    expandedDescriptions.value.delete(id)
  } else {
    expandedDescriptions.value.add(id)
  }
  expandedDescriptions.value = new Set(expandedDescriptions.value)
}

// ─── Badge & Formatting helpers ──────────────────────────
const typeBadgeClass = (type) => {
  switch (type) {
    case 'Payment Method':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/20'
    case 'Grade':
      return 'bg-purple-50 text-purple-700 ring-1 ring-purple-700/10 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-500/20'
    case 'Paper':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/20'
    case 'Fees':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20'
    case 'Sub Payment Method':
      return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-700/10 dark:bg-cyan-950/40 dark:text-cyan-300 dark:ring-cyan-500/20'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700/25'
  }
}

const modifierBadgeClass = (modifier) => {
  return modifier === 'addition'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20'
    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/20'
}

const formatAmount = (amount, amountType) => {
  const num = Number(amount)
  if (isNaN(num)) return amount
  const formatted = num.toFixed(2)
  return amountType === 'percentage' ? `${formatted}%` : `${formatted} EGP`
}

const formatScholarshipName = (sch) => {
  if (!sch) return ''
  const type = sch.study_type || sch.type
  if (type) {
    const capitalized = String(type).charAt(0).toUpperCase() + String(type).slice(1).toLowerCase()
    return `${sch.name} (${capitalized})`
  }
  return sch.name
}

// ─── Options (excluding current item if editing) ───────────────
const parentOptions = computed(() =>
  store.priceSettings.filter((ps) => !form.value.id || ps.id !== form.value.id)
)

const childrenOptions = computed(() =>
  store.priceSettings.filter((ps) => !form.value.id || ps.id !== form.value.id)
)

// ─── Form ─────────────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
function emptyForm() {
  return {
    name: '',
    type: '',
    description: '',
    modifier: '',
    amount_type: '',
    amount: '',
    dl_count: null,
    parent_ids: [],
    children_ids: [],
    is_active: true,
    scholarship_ids: [],
    first_deadline_days: null,
    interval_days: null,
    forced_start_date: '',
  }
}

const form = ref(emptyForm())

// ─── Modal controls ───────────────────────────────────────
const openAddModal = () => {
  isEditing.value = false
  form.value = emptyForm()
  showModal.value = true
}

const editPriceSetting = (item) => {
  isEditing.value = true
  form.value = {
    id: item.id,
    name: item.name ?? '',
    type: item.type ?? '',
    description: item.description ?? '',
    modifier: item.modifier ?? '',
    amount_type: item.amount_type ?? '',
    amount: item.amount ?? '',
    dl_count: item.dl_count ?? null,
    is_active: item.is_active ?? true,
    first_deadline_days: item.first_deadline_days ?? null,
    interval_days: item.interval_days ?? null,
    forced_start_date: item.forced_start_date ? String(item.forced_start_date).substring(0, 10) : '',
    parent_ids: Array.isArray(item.parents)
      ? item.parents.map(p => p.id)
      : Array.isArray(item.parent_ids)
        ? [...item.parent_ids]
        : [],
    children_ids: Array.isArray(item.children)
      ? item.children.map(c => c.id)
      : Array.isArray(item.children_ids)
        ? [...item.children_ids]
        : [],
    scholarship_ids: Array.isArray(item.scholarships)
      ? item.scholarships.map(s => s.id)
      : Array.isArray(item.scholarship_ids)
        ? [...item.scholarship_ids]
        : []
  }
  showModal.value = true
}

const duplicatePriceSetting = (item) => {
  isEditing.value = false // Crucial: We are creating a NEW one, not editing the old one
  form.value = {
    // No ID because it's a new item
    name: (item.name ?? '') + ' (Copy)',
    type: item.type ?? '',
    description: item.description ?? '',
    modifier: item.modifier ?? '',
    amount_type: item.amount_type ?? '',
    amount: item.amount ?? '',
    dl_count: item.dl_count ?? null,
    is_active: item.is_active ?? true,
    first_deadline_days: item.first_deadline_days ?? null,
    interval_days: item.interval_days ?? null,
    forced_start_date: item.forced_start_date ? String(item.forced_start_date).substring(0, 10) : '',
    parent_ids: Array.isArray(item.parents)
      ? item.parents.map(p => p.id)
      : Array.isArray(item.parent_ids)
        ? [...item.parent_ids]
        : [],
    children_ids: Array.isArray(item.children)
      ? item.children.map(c => c.id)
      : Array.isArray(item.children_ids)
        ? [...item.children_ids]
        : [],
    scholarship_ids: Array.isArray(item.scholarships)
      ? item.scholarships.map(s => s.id)
      : Array.isArray(item.scholarship_ids)
        ? [...item.scholarship_ids]
        : []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  saving.value = false
}

// ─── Save (create / update) ───────────────────────────────
const savePriceSetting = async () => {
  if (!form.value.name.trim()) {
    notyf.error('Please enter a name.')
    return
  }
  if (!form.value.type) {
    notyf.error('Please select a type.')
    return
  }
  if (!form.value.modifier) {
    notyf.error('Please select a modifier.')
    return
  }
  if (!form.value.amount_type) {
    notyf.error('Please select an amount type.')
    return
  }

  const payload = {
    name: form.value.name.trim(),
    type: form.value.type,
    description: form.value.description || null,
    modifier: form.value.modifier,
    amount_type: form.value.amount_type,
    amount: Number(form.value.amount),
    dl_count: form.value.type === 'Payment Method' && ((form.value.dl_count !== '' && form.value.dl_count !== null && form.value.dl_count !== undefined) ? Number(form.value.dl_count) : null),
    parent_ids: form.value.type === 'Grade' ? [] : (form.value.parent_ids && form.value.parent_ids.length ? form.value.parent_ids : []),
    children_ids: form.value.children_ids && form.value.children_ids.length ? form.value.children_ids : [],
    is_active: form.value.is_active,
    scholarship_ids: form.value.scholarship_ids && form.value.scholarship_ids.length ? form.value.scholarship_ids : [],
    first_deadline_days: form.value.type === 'Payment Method' && form.value.first_deadline_days !== '' && form.value.first_deadline_days !== null ? Number(form.value.first_deadline_days) : null,
    interval_days: form.value.type === 'Payment Method' && form.value.interval_days !== '' && form.value.interval_days !== null ? Number(form.value.interval_days) : null,
    forced_start_date: form.value.type === 'Payment Method' && form.value.forced_start_date ? form.value.forced_start_date : null,
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await store.updatePriceSetting(form.value.id, payload)
    } else {
      await store.createPriceSetting(payload)
    }
    closeModal()
    await store.fetchPriceSettings()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

// ─── Init ─────────────────────────────────────────────────
onMounted(() => {
  store.fetchPriceSettings()
  scholarshipStore.fetchScholarships()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-fade-leave-active .animate-slide-up {
  animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  to {
    transform: translateY(15px) scale(0.95);
    opacity: 0;
  }
}

/* Custom scrollbar for modal content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* Mindmap canvas dark background with dot grid pattern */
.mindmap-canvas {
  background-color: #0b0f19;
  background-image:
    radial-gradient(#1e293b 1.2px, transparent 1.2px),
    radial-gradient(#1e293b 1.2px, transparent 1.2px);
  background-size: 24px 24px;
  background-position: 0 0, 12px 12px;
}
</style>
