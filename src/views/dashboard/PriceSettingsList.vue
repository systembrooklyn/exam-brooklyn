<template>
  <div class="min-h-screen w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-4 bg-gray-50/50 dark:bg-gray-900/50 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Tag class="w-6 h-6" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Price Settings</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-300">
            {{ store.priceSettings.length }} categories
          </span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
          Configure payment methods, exam papers, and grade adjustments modifiers.
        </p>
      </div>

      <div class="flex items-center gap-3.5 self-start sm:self-auto">
        <!-- View mode switcher -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-850 p-1 rounded-xl shadow-inner border border-gray-200/40 dark:border-gray-700/40">
          <button 
            @click="viewMode = 'table'"
            :class="viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-650 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <List class="w-3.5 h-3.5" />
            Table
          </button>
          <button 
            @click="viewMode = 'chart'"
            :class="viewMode === 'chart' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-650 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
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
    <div v-if="store.loading" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-6 space-y-4 animate-pulse">
      <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4 mb-6"></div>
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="grid grid-cols-8 gap-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
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
      <!-- Table Card -->
      <div v-if="viewMode === 'table'" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[800px] border-collapse text-center">
          <thead class="bg-slate-50/75 dark:bg-slate-900/40 border-b border-gray-150 dark:border-gray-700/60">
            <tr>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Name</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Type</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Modifier</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Amount Type</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Amount</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">DL Count</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Scholarships</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Active</th>
              <th class="px-2 py-4 text-center font-bold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
            <template v-if="store.priceSettings.length === 0">
              <tr>
                <td colspan="9" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
                    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-600 ring-8 ring-gray-100/50 dark:ring-gray-800/50">
                      <Tag class="w-8 h-8" />
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">No Price Settings Yet</h3>
                      <p class="text-xs text-gray-550 dark:text-gray-400 mt-1.5 leading-relaxed">
                        Create your first payment method, paper fee, or grade modifier to start configuring pricing rules.
                      </p>
                    </div>
                    <button
                      @click="openAddModal"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <Plus class="w-4 h-4" />
                      Create Setting
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <template v-for="item in store.priceSettings" :key="item.id">
              <!-- Parent row -->
              <tr class="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-150 group">
                <td class="px-6 py-4.5 text-left">
                  <div class="flex items-center gap-3">
                    <button
                      v-if="item.children && item.children.length"
                      @click="toggleChildren(item.id)"
                      class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-all duration-205 cursor-pointer"
                      :title="expandedRows.has(item.id) ? 'Collapse' : 'Expand'"
                    >
                      <ChevronRight
                        class="w-4 h-4 transition-transform duration-200"
                        :class="{ 'rotate-90 text-indigo-600 dark:text-indigo-400': expandedRows.has(item.id) }"
                      />
                    </button>
                    <span v-else class="w-6 h-6 inline-block"></span>
                    <div class="flex flex-col items-start">
                      <div class="flex items-center gap-1.5">
                        <span
                          :class="item.description ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors' : ''"
                          @click="item.description && toggleDescription(item.id)"
                          class="font-bold text-gray-950 dark:text-white text-sm"
                        >
                          {{ item.name }}
                        </span>
                        <span v-if="item.children && item.children.length" class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 text-purple-655 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30 uppercase tracking-wider scale-95 origin-left">
                          Parent Rule
                        </span>
                      </div>
                      <div v-if="item.parents && item.parents.length" class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span class="text-[9px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">child to:</span>
                        <div class="flex flex-wrap gap-1">
                          <span v-for="p in item.parents" :key="p.id" class="px-1.5 py-0.5 rounded-md bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-semibold border border-indigo-100/60 dark:border-indigo-900/30">
                            {{ p.name }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4.5">
                  <span :class="typeBadgeClass(item.type)" class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                    {{ item.type }}
                  </span>
                </td>
                <td class="px-6 py-4.5">
                  <span :class="modifierBadgeClass(item.modifier)" class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                    {{ item.modifier }}
                  </span>
                </td>
                <td class="px-6 py-4.5 text-gray-600 dark:text-gray-300 capitalize font-medium">{{ item.amount_type }}</td>
                <td class="px-6 py-4.5 text-gray-900 dark:text-gray-100 font-bold font-mono">
                  {{ formatAmount(item.amount, item.amount_type) }}
                </td>
                <td class="px-6 py-4.5 text-gray-500 dark:text-gray-400 font-medium font-mono">{{ item.dl_count ?? '—' }}</td>
                <td class="px-6 py-4.5">
                  <div v-if="item.scholarships && item.scholarships.length" class="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                    <span v-for="sch in item.scholarships" :key="sch.id" class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-150/40">
                      {{ formatScholarshipName(sch) }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400 dark:text-gray-500 text-xs">—</span>
                </td>
                <td class="px-6 py-4.5">
                  <span
                    :class="item.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-550 dark:bg-gray-800 dark:text-gray-450'"
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide"
                  >
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4.5">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editPriceSetting(item)"
                      class="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 transition-all duration-200 cursor-pointer shadow-sm"
                      title="Edit"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Parent description row -->
              <tr v-if="expandedDescriptions.has(item.id) && item.description" class="bg-indigo-50/5 dark:bg-indigo-950/5">
                <td colspan="9" class="px-8 py-3.5 text-left border-b border-gray-100 dark:border-gray-700/50">
                  <div class="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium pl-14 leading-relaxed animate-fade-in">
                    <span class="text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">Description:</span>
                    <span class="whitespace-pre-wrap font-normal text-gray-700 dark:text-gray-300">{{ item.description }}</span>
                  </div>
                </td>
              </tr>

              <!-- Child rows (indented) -->
              <template v-if="item.children && item.children.length && expandedRows.has(item.id)">
                <template v-for="child in item.children" :key="child.id">
                  <tr class="bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-150">
                    <td class="px-6 py-3.5 pl-12 text-gray-650 dark:text-gray-300 text-sm font-medium border-l-4 border-indigo-500/70 text-left">
                      <div class="flex items-center gap-2">
                        <CornerDownRight class="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <div class="flex flex-col items-start">
                          <div class="flex items-center gap-1.5">
                            <span
                              :class="child.description ? 'cursor-pointer hover:text-indigo-650 dark:hover:text-indigo-455 transition-colors' : ''"
                              @click="child.description && toggleDescription(child.id)"
                              class="text-[13px] font-medium text-gray-700 dark:text-gray-200"
                            >
                              {{ child.name }}
                            </span>
                            <span class="inline-flex items-center px-1.5 py-0.25 rounded text-[8.5px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 uppercase tracking-wide scale-95 origin-left">
                              Sub-rule
                            </span>
                          </div>
                          <div v-if="child.parents && child.parents.length" class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span class="text-[9px] font-bold text-gray-455 dark:text-gray-500 uppercase tracking-wider">Parents:</span>
                            <div class="flex flex-wrap gap-1">
                              <span v-for="p in child.parents" :key="p.id" class="px-1.5 py-0.5 rounded-md bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-semibold border border-indigo-100/60 dark:border-indigo-900/30">
                                {{ p.name }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-3.5">
                      <span :class="typeBadgeClass(child.type)" class="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide opacity-90">
                        {{ child.type }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5">
                      <span :class="modifierBadgeClass(child.modifier)" class="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide opacity-90">
                        {{ child.modifier }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 text-gray-500 dark:text-gray-400 capitalize text-[11px] font-medium">{{ child.amount_type }}</td>
                    <td class="px-6 py-3.5 text-gray-800 dark:text-gray-250 font-bold font-mono text-xs">
                      {{ formatAmount(child.amount, child.amount_type) }}
                    </td>
                    <td class="px-6 py-3.5 text-gray-550 dark:text-gray-450 font-mono text-[11px]">{{ child.dl_count ?? '—' }}</td>
                    <td class="px-6 py-3.5 scale-95 origin-center">
                      <div v-if="child.scholarships && child.scholarships.length" class="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                        <span v-for="sch in child.scholarships" :key="sch.id" class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-150/40">
                          {{ formatScholarshipName(sch) }}
                        </span>
                      </div>
                      <span v-else class="text-gray-400 dark:text-gray-500 text-xs">—</span>
                    </td>
                    <td class="px-6 py-3.5">
                      <span
                        :class="child.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-550 dark:bg-gray-800 dark:text-gray-455'"
                        class="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide opacity-90"
                      >
                        {{ child.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5">
                      <div class="flex items-center gap-2 justify-center">
                        <button
                          @click="editPriceSetting(child)"
                          class="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 transition-all duration-200 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil class="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Child description row -->
                  <tr v-if="expandedDescriptions.has(child.id) && child.description" class="bg-indigo-50/5 dark:bg-indigo-950/5">
                    <td colspan="9" class="px-8 py-2.5 text-left border-b border-gray-100 dark:border-gray-700/50 pl-20">
                      <div class="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed animate-fade-in">
                        <span class="text-indigo-500 font-semibold shrink-0">Description:</span>
                        <span class="whitespace-pre-wrap font-normal text-gray-650 dark:text-gray-350">{{ child.description }}</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mind Map Tree View -->
    <MindMapTree
      v-else-if="viewMode === 'chart'"
      :tree-data="mindmapTree"
      :format-amount="formatAmount"
      :format-scholarship-name="formatScholarshipName"
      :type-badge-class="typeBadgeClass"
      :modifier-badge-class="modifierBadgeClass"
      :rule-node-class="ruleNodeClass"
      @edit-node="editPriceSetting"
    />
    </template>

    <!-- ─── Add / Edit Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal-fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
        @mousedown.self="closeModal"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all transform scale-100 animate-slide-up">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-white dark:from-indigo-950/15 dark:to-gray-800">
            <div class="flex items-center gap-3">
              <span class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Tag class="w-5 h-5" />
              </span>
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-none">
                  {{ isEditing ? 'Edit Price Setting' : 'New Price Setting' }}
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {{ isEditing ? 'Update pricing rules and properties' : 'Configure a new pricing rule in the system' }}
                </p>
              </div>
            </div>
            <button @click="closeModal" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-605 dark:hover:text-gray-300 transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Name -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Name <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. VIP Addition Tier"
                class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <!-- Grid: Type & Modifier -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Type <span class="text-red-500">*</span></label>
                <select
                  v-model="form.type"
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="Payment Method">Payment Method</option>
                  <option value="Grade">Grade</option>
                  <option value="Paper">Paper</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Modifier <span class="text-red-500">*</span></label>
                <select
                  v-model="form.modifier"
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Select modifier</option>
                  <option value="addition">Addition</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Describe the usage of this pricing rule..."
                class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
              ></textarea>
            </div>

            <!-- Grid: Amount Type & Amount -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Amount Type <span class="text-red-500">*</span></label>
                <select
                  v-model="form.amount_type"
                  class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Amount <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input
                    v-model="form.amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-550 uppercase pointer-events-none">
                    {{ form.amount_type === 'percentage' ? '%' : 'EGP' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- DL Count -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                DL Count <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
              </label>
              <input
                v-model="form.dl_count"
                type="number"
                min="0"
                placeholder="e.g. 1"
                class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <!-- Parents MultiSelect -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Parents <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
              </label>
              <MultiSelect
                v-model="form.parent_ids"
                :options="parentOptions"
                placeholder="Select parent settings..."
                label-key="name"
                value-key="id"
              />
            </div>

            <!-- Children MultiSelect -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Children <span class="text-[10px] text-gray-400 lowercase italic">(nullable)</span>
              </label>
              <MultiSelect
                v-model="form.children_ids"
                :options="childrenOptions"
                placeholder="Select children settings..."
                label-key="name"
                value-key="id"
              />
            </div>

            <!-- Scholarships MultiSelect -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Scholarships
              </label>
              <MultiSelect
                v-model="form.scholarship_ids"
                :options="scholarshipStore.scholarships"
                placeholder="Select scholarships..."
                label-key="name"
                value-key="id"
              />
            </div>

            <!-- Is Active toggle -->
            <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <button
                type="button"
                @click="form.is_active = !form.is_active"
                :class="form.is_active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
              >
                <span
                  :class="form.is_active ? 'translate-x-6' : 'translate-x-1'"
                  class="absolute top-1 left-0 inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                ></span>
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
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/60 flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-semibold text-gray-650 dark:text-gray-300 hover:text-gray-850 dark:hover:text-white rounded-xl hover:bg-gray-105 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="savePriceSetting"
              :disabled="saving"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/10"
            >
              <span v-if="saving" class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
import { ChevronRight, CornerDownRight, Pencil, X, Tag, Plus, List, GitBranch } from 'lucide-vue-next'
import notyf from '@/components/global/notyf'
import MultiSelect from '@/components/global/MultiSelect.vue'
import MindMapTree from '@/components/dashboard/MindMapTree.vue'

const store = usePriceSettingsStore()
const scholarshipStore = useScholarshipStore()

const viewMode = ref('table')

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
const showModal  = ref(false)
const isEditing  = ref(false)
const saving     = ref(false)
function emptyForm() {
  return {
    name:            '',
    type:            '',
    description:     '',
    modifier:        '',
    amount_type:     '',
    amount:          '',
    dl_count:        null,
    parent_ids:      [],
    children_ids:    [],
    is_active:       true,
    scholarship_ids: [],
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
    id:              item.id,
    name:            item.name              ?? '',
    type:            item.type              ?? '',
    description:     item.description       ?? '',
    modifier:        item.modifier          ?? '',
    amount_type:     item.amount_type       ?? '',
    amount:          item.amount            ?? '',
    dl_count:        item.dl_count          ?? null,
    is_active:       item.is_active         ?? true,
    parent_ids:      Array.isArray(item.parents)
      ? item.parents.map(p => p.id)
      : Array.isArray(item.parent_ids)
        ? [...item.parent_ids]
        : [],
    children_ids:    Array.isArray(item.children)
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
  saving.value    = false
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
    name:            form.value.name.trim(),
    type:            form.value.type,
    description:     form.value.description || null,
    modifier:        form.value.modifier,
    amount_type:     form.value.amount_type,
    amount:          Number(form.value.amount),
    dl_count:        (form.value.dl_count !== '' && form.value.dl_count !== null && form.value.dl_count !== undefined) ? Number(form.value.dl_count) : null,
    parent_ids:      form.value.parent_ids && form.value.parent_ids.length ? form.value.parent_ids : [],
    children_ids:    form.value.children_ids && form.value.children_ids.length ? form.value.children_ids : [],
    is_active:       form.value.is_active,
    scholarship_ids: form.value.scholarship_ids && form.value.scholarship_ids.length ? form.value.scholarship_ids : [],
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
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
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
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(0) scale(1); opacity: 1; }
  to { transform: translateY(15px) scale(0.95); opacity: 0; }
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
