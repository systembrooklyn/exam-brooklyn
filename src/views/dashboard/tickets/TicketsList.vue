<template>
  <div class="min-h-screen w-full bg-gray-50/50 dark:bg-gray-900/50 py-4 sm:py-6 animate-fade-in">
    <div class="mx-auto w-full min-w-0 max-w-[1200px] px-4 sm:px-6 md:px-8">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Ticket class="w-6 h-6" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tickets</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
            {{ displayedTickets.length }} tickets
          </span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
          Manage and track your support requests and issues.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <!-- Refresh Button -->
        <button
          @click="refreshData"
          :disabled="pageLoading"
          class="inline-flex items-center justify-center p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-60"
          title="Refresh Tickets"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': pageLoading }" />
        </button>

        <router-link to="/tickets/new" class="buttons">
          <button class="btn"><span></span>
            <p data-start="good luck!" data-text="ADD!" data-title="new Ticket"></p>
          </button>
        </router-link>
      </div>
    </div>

      <!-- Filters Bar -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-4 mb-4 flex flex-col gap-3">
        
        <!-- Row 1: Status Tabs & Toggle Filters -->
        <div class="flex items-center justify-between w-full flex-wrap gap-3">
          <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0">
            <button
              @click="setActiveTab('open')"
              :class="activeTab === 'open'
                ? 'bg-white dark:bg-gray-650 text-emerald-650 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
              class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <CircleDot class="w-3.5 h-3.5" />
              Open
              <span
                :class="activeTab === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'"
                class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
              >{{ openCount }}</span>
            </button>
            
            <button
              @click="setActiveTab('closed')"
              :class="activeTab === 'closed'
                ? 'bg-white dark:bg-gray-650 text-purple-650 dark:text-purple-400 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
              class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <CircleCheck class="w-3.5 h-3.5" />
              Closed
              <span
                :class="activeTab === 'closed' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'"
                class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
              >{{ closedCount }}</span>
            </button>

            <!-- Tasks Tab (Only for task-allowed users) -->
            <button
              v-if="authStore.can('view-task-tickets')"
              @click="setActiveTab('tasks')"
              :class="activeTab === 'tasks'
                ? 'bg-white dark:bg-gray-650 text-indigo-650 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
              class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <ClipboardList class="w-3.5 h-3.5 text-indigo-500" />
              Tasks
              <span
                :class="activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'"
                class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
              >{{ taskCount }}</span>
            </button>

            <!-- Insights Tab (Only for managers) -->
            <button
              v-if="authStore.can('view-others-tickets')"
              @click="setActiveTab('insights')"
              :class="activeTab === 'insights'
                ? 'bg-white dark:bg-gray-650 text-amber-655 dark:text-amber-400 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
              class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <TrendingUp class="w-3.5 h-3.5 text-amber-500" />
              Insights
            </button>
          </div>

          <!-- Filters Toggle Button -->
          <button
            @click="showFilters = !showFilters"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all cursor-pointer relative"
          >
            <SlidersHorizontal class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Filters</span>
            <span v-if="activeFiltersCount > 0" class="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
            <ChevronDown class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': showFilters }" />
          </button>
        </div>

        <!-- Row 2: Dropdowns & Date Filters (Collapsible with smooth transition) -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-y-95 opacity-0 -translate-y-2"
          enter-to-class="transform scale-y-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-y-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-y-95 opacity-0 -translate-y-2"
        >
          <div v-if="showFilters" class="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-150 dark:border-gray-700/50 origin-top">
            <select
              v-if="activeTab !== 'tasks'"
              v-model="activeFilters.type"
              @change="handleFilterChange"
              class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer w-full sm:w-32 flex-shrink-0"
            >
              <option value="">All Types</option>
              <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
            </select>

            <select
              v-model="activeFilters.category"
              @change="handleFilterChange"
              class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer w-full sm:w-32 flex-shrink-0"
            >
              <option value="">All Categories</option>
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>

            <input
              type="date"
              v-model="activeFilters.start_date"
              @change="onDateChange"
              title="Start Date"
              class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer w-full sm:w-32 flex-shrink-0"
            />
            <input
              type="date"
              v-model="activeFilters.end_date"
              @change="onDateChange"
              title="End Date"
              class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer w-full sm:w-32 flex-shrink-0"
            />

            <!-- Unread Comments Toggle (Only shown when not on Insights tab) -->
            <button
              v-if="activeTab !== 'insights'"
              @click="toggleUnreadOnly"
              class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-sm flex-shrink-0"
              :class="filters.unread_only
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'"
            >
              <MessageSquare class="w-3.5 h-3.5" :class="{ 'fill-rose-500/10': filters.unread_only }" />
              <span>Unread Comments</span>
              <span v-if="unreadCurrentCount > 0"
                class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full"
                :class="filters.unread_only
                  ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-250'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'"
              >
                {{ unreadCurrentCount }}
              </span>
            </button>

            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer flex-shrink-0"
            >
              <X class="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </transition>
      </div>

      <!-- Performance / Satisfaction Dashboard (Only for users with view-others-tickets permission, and activeTab === 'insights') -->
      <div v-if="authStore.can('view-others-tickets') && activeTab === 'insights'" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-6 mb-4 transition-all duration-300 relative overflow-hidden">
        <!-- Loading Overlay -->
        <div v-if="insightsLoading" class="absolute inset-0 bg-white/70 dark:bg-gray-800/70 z-20 flex flex-col items-center justify-center backdrop-blur-[1px] transition-all duration-200">
          <div class="flex flex-col items-center gap-3">
            <div class="relative w-10 h-10">
              <span class="absolute inset-0 border-3 border-indigo-100 dark:border-indigo-950 rounded-full"></span>
              <span class="absolute inset-0 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            </div>
            <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse tracking-wide">Recalculating metrics...</p>
          </div>
        </div>
        <!-- Card Header -->
        <div class="flex items-center gap-2.5 mb-6">
          <span class="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-450 border border-amber-100/50 dark:border-amber-900/40">
            <TrendingUp class="w-5 h-5 text-amber-500" />
          </span>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-none">Employee Satisfaction Insights</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Based on evaluations from closed tickets in the selected date range</p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- KPIs Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- KPI 1: Satisfaction Percentage -->
            <div class="bg-gradient-to-br from-indigo-50/30 to-indigo-100/5 dark:from-indigo-950/15 dark:to-indigo-950/5 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl p-4 flex items-center gap-4">
              <div class="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                <Smile class="w-6 h-6" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Satisfaction</p>
                <div class="flex items-baseline gap-1.5 mt-0.5">
                  <span class="text-2xl font-black text-gray-900 dark:text-white">{{ satisfactionStats.averagePct.toFixed(1) }}%</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full" :class="satisfactionStats.badgeClass">
                    {{ satisfactionStats.ratingLabel }}
                  </span>
                </div>
              </div>
            </div>

            <!-- KPI 2: Rated vs Auto Rated -->
            <div class="bg-gradient-to-br from-amber-50/30 to-amber-100/5 dark:from-amber-950/15 dark:to-amber-950/5 border border-amber-100/40 dark:border-amber-900/20 rounded-xl p-4 flex items-center gap-4">
              <div class="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-450 border border-amber-100/50 dark:border-amber-900/30">
                <Star class="w-6 h-6" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Ratings Breakdown</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {{ satisfactionStats.ratedCount }} <span class="text-xs font-normal text-gray-500">rated</span>
                  <span class="mx-1 text-gray-300 dark:text-gray-600">/</span>
                  {{ satisfactionStats.autoCount }} <span class="text-xs font-normal text-gray-500">auto (10/10)</span>
                </p>
              </div>
            </div>

            <!-- KPI 3: Total Closed Tickets -->
            <div class="bg-gradient-to-br from-purple-50/30 to-purple-100/5 dark:from-purple-950/15 dark:to-purple-950/5 border border-purple-100/40 dark:border-purple-900/20 rounded-xl p-4 flex items-center gap-4">
              <div class="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100/50 dark:border-purple-900/30">
                <CircleCheck class="w-6 h-6" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Closed Tickets</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{{ satisfactionStats.totalClosed }}</p>
              </div>
            </div>
          </div>

          <!-- Chart Area -->
          <div class="bg-gray-50/30 dark:bg-gray-900/10 border border-gray-150 dark:border-gray-700/45 rounded-xl p-4 relative min-h-[300px]">
            <div v-if="satisfactionStats.totalClosed === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">No closed tickets found in this date range.</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Adjust filters to display metrics.</p>
            </div>
            <div v-else class="h-[280px]">
              <Line :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Insights Tickets List Under Chart -->
      <div v-if="activeTab === 'insights' && authStore.can('view-others-tickets')" class="mt-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden animate-fade-in">
          <!-- Card Header Strip -->
          <div class="px-5 py-3.5 border-b border-gray-150 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/20 dark:bg-gray-900/10">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse"></span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">Contributing Tickets</span>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ sortedInsightsTickets.length }} closed {{ sortedInsightsTickets.length === 1 ? 'ticket' : 'tickets' }}</span>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 italic">Sorted by rating (lowest first)</div>
          </div>

          <!-- Loading State -->
          <div v-if="insightsLoading" class="px-6 py-20 flex flex-col items-center justify-center text-center">
            <div class="relative w-10 h-10 mb-3">
              <span class="absolute inset-0 border-3 border-amber-100 dark:border-amber-950 rounded-full"></span>
              <span class="absolute inset-0 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 animate-pulse font-medium">Loading contributing tickets...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="sortedInsightsTickets.length === 0" class="px-6 py-16 text-center">
            <div class="flex flex-col items-center justify-center max-w-xs mx-auto space-y-4">
              <div class="p-4 rounded-full ring-8 bg-gray-50 dark:bg-gray-700 text-gray-400 ring-gray-100/60 dark:ring-gray-700/40">
                <Ticket class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">No closed tickets found</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Adjust filter criteria to display closed tickets.</p>
              </div>
            </div>
          </div>

          <!-- Ticket Rows -->
          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
            <div
              v-for="ticket in sortedInsightsTickets"
              :key="ticket.serial"
              class="px-5 py-4 flex gap-3 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-all duration-150 cursor-pointer"
              @click="$router.push(`/tickets/${ticket.serial}`)"
            >
              <!-- Star Indicator or Check -->
              <div class="pt-0.5 flex-shrink-0">
                <Star class="w-5 h-5 text-amber-500 fill-amber-500" v-if="ticket.evaluate" />
                <CircleCheck class="w-5 h-5 text-purple-500" v-else />
              </div>

              <!-- Ticket Info -->
              <div class="flex-grow min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">
                  {{ ticket.desc ? truncate(ticket.desc, 80) : `Ticket #${ticket.serial}` }}
                </p>

                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/60">
                    #{{ ticket.serial }}
                  </span>
                  <span v-if="ticket.type" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/60">
                    {{ ticket.type }}
                  </span>
                  <span v-if="ticket.category" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/60">
                    {{ ticket.category }}
                  </span>
                  <span class="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                    created at {{ formatDate(ticket.created_at) }} by <span class="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">{{ ticket.user.name }}</span>
                  </span>
                  <span
                    @click.stop="copyEmail(ticket.user.email)"
                    class="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded-lg border border-gray-150 dark:border-gray-700/50 transition-all font-medium"
                    title="Click to copy email"
                  >
                    <Mail class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    {{ ticket.user.email }}
                  </span>
                </div>
              </div>

              <!-- Rating Evaluation Badge -->
              <div class="flex-shrink-0 flex flex-col items-end justify-center mr-1">
                <div v-if="ticket.evaluate" class="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 rounded-xl px-2.5 py-1 text-xs font-bold">
                  <Star class="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{{ ticket.evaluate }} / 10</span>
                </div>
                <div v-else class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 border border-gray-150 dark:border-gray-700/50 rounded-xl px-2.5 py-1 text-xs font-bold" title="Auto-evaluated to 10/10">
                  <Star class="w-3 h-3 text-gray-400" />
                  <span>10 / 10 <span class="text-[9px] font-normal text-gray-400 ml-0.5">(auto)</span></span>
                </div>
                <span v-if="ticket.evaluation_notes" class="text-[10px] text-gray-400 dark:text-gray-500 italic mt-1 max-w-[150px] truncate" :title="ticket.evaluation_notes">
                  "{{ ticket.evaluation_notes }}"
                </span>
              </div>

              <!-- Chevron -->
              <div class="flex-shrink-0 flex items-center text-gray-300 dark:text-gray-600">
                <ChevronRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tickets List Card -->
      <div v-if="activeTab !== 'insights'" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <!-- Card Header Strip -->
        <div class="px-5 py-3 border-b border-gray-150 dark:border-gray-700/60 flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="activeTab === 'tasks' ? 'bg-indigo-500' : (filters.is_closed ? 'bg-purple-500' : 'bg-emerald-500')"></span>
          <span class="text-sm font-bold text-gray-900 dark:text-white">{{ activeTab === 'tasks' ? 'Task' : (filters.is_closed ? 'Closed' : 'Open') }} Tickets</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ displayedTickets.length }} {{ displayedTickets.length === 1 ? 'result' : 'results' }}</span>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="pageLoading" class="p-6 space-y-4 animate-pulse">
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
              <div class="h-5 w-5 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0 mt-1"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!displayedTickets || displayedTickets.length === 0" class="px-6 py-16 text-center">
          <div class="flex flex-col items-center justify-center max-w-xs mx-auto space-y-4">
            <div class="p-4 rounded-full ring-8 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400 ring-indigo-100/60 dark:ring-indigo-900/40">
              <Ticket class="w-8 h-8" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">No tickets found</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">There aren't any tickets that match your current filters.</p>
            </div>
            <router-link
              to="/tickets/new"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              Create new ticket
            </router-link>
          </div>
        </div>

        <!-- Ticket Rows -->
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <div
            v-for="ticket in ticketsWithReaders"
            :key="ticket.serial"
            class="px-5 py-4 flex gap-3 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-150 cursor-pointer"
            @click="$router.push(`/tickets/${ticket.serial}`)"
          >
            <!-- Status Icon -->
            <div class="pt-0.5 flex-shrink-0">
              <CircleCheck v-if="ticket.status === 'closed' || ticket.is_closed" class="w-5 h-5 text-purple-500" />
              <CircleDot v-else class="w-5 h-5 text-emerald-500" :class="{ 'fill-emerald-500': !ticket.is_read }" />
            </div>

            <!-- Ticket Info -->
            <div class="flex-grow min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {{ ticket.desc ? truncate(ticket.desc, 80) : `Ticket #${ticket.serial}` }}
              </p>

              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/60">
                  #{{ ticket.serial }}
                </span>
                <span v-if="ticket.type" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/60">
                  {{ ticket.type }}
                </span>
                <span v-if="ticket.category" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/60">
                  {{ ticket.category }}
                </span>
                <span class="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  created at {{ formatDate(ticket.created_at) }} by <span class="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">{{ ticket.user.name }}</span>
                </span>
                <span
                  @click.stop="copyEmail(ticket.user.email)"
                  class="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded-lg border border-gray-150 dark:border-gray-700/50 transition-all font-medium"
                  title="Click to copy email"
                >
                  <Mail class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  {{ ticket.user.email }}
                </span>
                <span v-if="ticket.comments_count"
                  class="relative flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-lg border transition-colors"
                  :class="ticket.has_unread_comments
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/40 font-bold shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border-gray-150 dark:border-gray-700/50'"
                  :title="ticket.has_unread_comments ? 'Unread comments available' : 'Comments count'"
                >
                  <MessageSquare class="w-3 h-3" :class="{ 'fill-rose-500/10': ticket.has_unread_comments }" />
                  {{ ticket.comments_count }}

                  <!-- Red dot indicator for unread comments -->
                  <span v-if="ticket.has_unread_comments" class="absolute -top-1 -right-1 flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </span>
                <span v-if="ticket.otherReaders.length"
                  class="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded-lg border border-gray-150 dark:border-gray-700/50"
                  :title="ticket.otherReaders.map(formatReaderNameWithTime).join('\n')"
                >
                  <Eye class="w-3 h-3" />
                  Seen by: {{ ticket.otherReaders.map(formatReaderName).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Rating Badge (Only for Closed Tickets) -->
            <div v-if="ticket.status === 'closed' || ticket.is_closed" class="flex-shrink-0 flex items-center mr-1">
              <div v-if="ticket.evaluate" class="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 rounded-xl px-2.5 py-1 text-xs font-bold">
                <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{{ ticket.evaluate }} / 10</span>
              </div>
              <div v-else-if="isTicketOwner(ticket)" class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-150 dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 hover:border-indigo-150 transition-colors">
                <Star class="w-3.5 h-3.5" />
                <span>Rate Now</span>
              </div>
            </div>

            <!-- Chevron -->
            <div class="flex-shrink-0 flex items-center text-gray-300 dark:text-gray-600">
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Ticket, CircleDot, CircleCheck, ChevronRight, Plus, X, MessageSquare, Star, Mail, RefreshCw, Eye, TrendingUp, ChevronDown, Smile, ClipboardList, SlidersHorizontal } from 'lucide-vue-next';
import { useTicketsStore } from '@/stores/ticketsStore';
import { useAuthStore } from '@/stores/auth';
import notyf from '@/components/global/notyf';
import {
  getOtherReaders,
  formatReaderName,
  formatReaderNameWithTime,
} from '@/utils/ticketsHelpers';
import { Line } from 'vue-chartjs';
import apiClient from '@/api/axiosInstance';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

const router = useRouter();
const store = useTicketsStore();
const authStore = useAuthStore();

const pageLoading = ref(false);
const activeTab = ref('open');

// Independent filter and data states for the Insights tab
const insightsLoading = ref(false);
const insightsFilters = reactive({
  type: '',
  category: '',
  start_date: '',
  end_date: '',
});
const insightsClosedTickets = ref([]);

const filteredInsightsTickets = computed(() => {
  return (insightsClosedTickets.value || []).filter(t => {
    if (!t.type) return true;
    return t.type.toLowerCase().trim() !== 'task';
  });
});

const sortedInsightsTickets = computed(() => {
  const tickets = [...(filteredInsightsTickets.value || [])];
  tickets.sort((a, b) => {
    const scoreA = (a.evaluate !== null && a.evaluate !== undefined && a.evaluate !== '')
      ? Number(a.evaluate)
      : 11;
    const scoreB = (b.evaluate !== null && b.evaluate !== undefined && b.evaluate !== '')
      ? Number(b.evaluate)
      : 11;
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
  return tickets;
});

// Active filters computed wrapper
const activeFilters = computed(() => {
  return activeTab.value === 'insights' ? insightsFilters : filters;
});

const setActiveTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'open') {
    filters.is_closed = false;
    fetchData();
  } else if (tab === 'closed') {
    filters.is_closed = true;
    fetchData();
  } else if (tab === 'insights') {
    fetchInsightsData();
  } else if (tab === 'tasks') {
    // Tasks needs both open + closed fetched, reset is_closed to neutral
    filters.is_closed = false;
    fetchData();
  }
};

const fetchInsightsData = async () => {
  insightsLoading.value = true;
  try {
    const params = {
      is_closed: 1,
    };
    if (insightsFilters.type) params.type = insightsFilters.type;
    if (insightsFilters.category) params.category = insightsFilters.category;
    if (insightsFilters.start_date) params.start_date = insightsFilters.start_date;
    if (insightsFilters.end_date) params.end_date = insightsFilters.end_date;

    const response = await apiClient.get('tickets', { params });
    insightsClosedTickets.value = response.data.data || response.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    insightsLoading.value = false;
  }
};

// Computed property for satisfaction metrics statistics
const satisfactionStats = computed(() => {
  const tickets = filteredInsightsTickets.value || [];
  const totalClosed = tickets.length;
  let ratedCount = 0;
  let autoCount = 0;
  let sumScores = 0;

  tickets.forEach(t => {
    if (t.evaluate !== null && t.evaluate !== undefined && t.evaluate !== '') {
      ratedCount++;
      sumScores += Number(t.evaluate);
    } else {
      autoCount++;
      sumScores += 10;
    }
  });

  const averageScore = totalClosed > 0 ? (sumScores / totalClosed) : 10;
  const averagePct = (averageScore / 10) * 100;

  let ratingLabel = 'Excellent';
  let badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
  
  if (averagePct < 60) {
    ratingLabel = 'Poor';
    badgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30';
  } else if (averagePct < 80) {
    ratingLabel = 'Average';
    badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30';
  } else if (averagePct < 90) {
    ratingLabel = 'Good';
    badgeClass = 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-450 border border-teal-100 dark:border-teal-900/30';
  }

  return {
    totalClosed,
    ratedCount,
    autoCount,
    averagePct,
    ratingLabel,
    badgeClass
  };
});

// Helper to calculate difference in days
const getDiffInDays = (d1, d2) => {
  const diffTime = Math.abs(new Date(d2) - new Date(d1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Computed property for Chart Data
const chartData = computed(() => {
  const tickets = [...(filteredInsightsTickets.value || [])];
  if (tickets.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Sort tickets chronologically by creation date
  tickets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Determine grouping interval
  const dates = tickets.map(t => new Date(t.created_at)).filter(d => !isNaN(d));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
  
  const diffInDays = getDiffInDays(minDate, maxDate);
  const groups = {};

  tickets.forEach(ticket => {
    const dateObj = new Date(ticket.created_at);
    if (isNaN(dateObj)) return;

    let groupKey = '';
    if (diffInDays <= 31) {
      // Group by Day: e.g. "Aug 19"
      groupKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (diffInDays <= 180) {
      // Group by Week: e.g. "Wk of Aug 17"
      const day = dateObj.getDay();
      const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dateObj.setDate(diff));
      groupKey = 'Wk of ' + monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // Group by Month: e.g. "Aug 2026"
      groupKey = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    const score = (ticket.evaluate !== null && ticket.evaluate !== undefined && ticket.evaluate !== '')
      ? Number(ticket.evaluate)
      : 10;
    groups[groupKey].push(score);
  });

  const labels = Object.keys(groups);
  const data = labels.map(key => {
    const scores = groups[key];
    const avg = scores.reduce((s, val) => s + val, 0) / scores.length;
    return Math.round((avg / 10) * 100); // percentage
  });

  return {
    labels,
    datasets: [
      {
        label: 'Satisfaction Rate',
        data,
        borderColor: '#4f46e5', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      }
    ]
  };
});

// Chart Options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        padding: 10,
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Satisfaction: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          stepSize: 20
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.08)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
});

const filters = reactive({
  is_closed: false,
  type: '',
  category: '',
  start_date: '',
  end_date: '',
  unread_only: false,
});

const ticketsList = computed(() => {
  let list = filters.is_closed ? (store.closedTickets || []) : (store.openTickets || []);
  if (!filters.is_closed && authStore.can('view-task-tickets')) {
    list = list.filter(t => !t.type || t.type.toLowerCase().trim() !== 'task');
  }
  if (filters.type) {
    list = list.filter(t => t.type === filters.type);
  }
  if (filters.category) {
    list = list.filter(t => t.category === filters.category);
  }
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    list = list.filter(t => new Date(t.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.created_at) <= end);
  }
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list;
});

const openCount = computed(() => {
  let list = store.openTickets || [];
  if (authStore.can('view-task-tickets')) {
    list = list.filter(t => !t.type || t.type.toLowerCase().trim() !== 'task');
  }
  if (filters.type) {
    list = list.filter(t => t.type === filters.type);
  }
  if (filters.category) {
    list = list.filter(t => t.category === filters.category);
  }
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    list = list.filter(t => new Date(t.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.created_at) <= end);
  }
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list.length;
});

const closedCount = computed(() => {
  let list = store.closedTickets || [];
  if (filters.type) {
    list = list.filter(t => t.type === filters.type);
  }
  if (filters.category) {
    list = list.filter(t => t.category === filters.category);
  }
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    list = list.filter(t => new Date(t.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.created_at) <= end);
  }
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list.length;
});

const taskTicketsList = computed(() => {
  const allTickets = store.openTickets || [];
  let list = allTickets.filter(t => t.type && t.type.toLowerCase().trim() === 'task');
  
  if (filters.category) {
    list = list.filter(t => t.category === filters.category);
  }
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    list = list.filter(t => new Date(t.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.created_at) <= end);
  }
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list;
});

const taskCount = computed(() => {
  return taskTicketsList.value.length;
});

const displayedTickets = computed(() => {
  return activeTab.value === 'tasks' ? taskTicketsList.value : ticketsList.value;
});

const ticketsWithReaders = computed(() => {
  return (displayedTickets.value || []).map((ticket) => ({
    ...ticket,
    otherReaders: getOtherReaders(ticket.readers, ticket.user, authStore.user),
  }));
});

const hasActiveFilters = computed(() =>
  filters.type || filters.category || filters.start_date || filters.end_date || filters.unread_only
);

const showFilters = ref(false);

const activeFiltersCount = computed(() => {
  let count = 0;
  const active = activeFilters.value;
  if (active.type) count++;
  if (active.category) count++;
  if (active.start_date) count++;
  if (active.end_date) count++;
  if (activeTab.value !== 'insights' && filters.unread_only) count++;
  return count;
});

const buildParams = () => {
  // Open tickets → no is_closed param at all
  // Closed tickets → is_closed=1
  const params = {};

  if (filters.is_closed) {
    params.is_closed = 1;
  }
  // Always add the other filters if set
  if (filters.type) params.type = filters.type;
  if (filters.category) params.category = filters.category;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;

  return params;
};

const typeOptions = computed(() => {
  const meta = store.metaOptions;
  const rawTypes = meta?.type || meta?.types || [];
  if (activeTab.value === 'open' && authStore.can('view-task-tickets')) {
    return rawTypes.filter(t => t.toLowerCase().trim() !== 'task');
  }
  return rawTypes;
});

const categoryOptions = computed(() => {
  const meta = store.metaOptions;
  return meta?.category || meta?.categories || [];
});

const toggleUnreadOnly = () => {
  filters.unread_only = !filters.unread_only;
};

const unreadCurrentCount = computed(() => {
  let list = [];
  if (activeTab.value === 'tasks') {
    const allOpenTasks = (store.openTickets || []).filter(t => t.type && t.type.toLowerCase().trim() === 'task');
    list = allOpenTasks;
  } else if (activeTab.value === 'closed') {
    list = store.closedTickets || [];
  } else {
    let openList = store.openTickets || [];
    if (authStore.can('view-task-tickets')) {
      openList = openList.filter(t => !t.type || t.type.toLowerCase().trim() !== 'task');
    }
    list = openList;
  }

  // Apply Category filter
  if (filters.category) {
    list = list.filter(t => t.category === filters.category);
  }
  // Apply Date filters
  if (filters.start_date) {
    const start = new Date(filters.start_date);
    list = list.filter(t => new Date(t.created_at) >= start);
  }
  if (filters.end_date) {
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.created_at) <= end);
  }

  return list.filter(t => t.has_unread_comments).length;
});

const refreshData = async () => {
  pageLoading.value = true;
  try {
    if (activeTab.value === 'insights') {
      await Promise.all([
        fetchInsightsData(),
        store.fetchMetaOptions()
      ]);
    } else if (filters.type || filters.category || filters.start_date || filters.end_date) {
      const params = buildParams();
      const openParams = { ...params };
      delete openParams.is_closed;
      const closedParams = { ...params, is_closed: 1 };
      
      await Promise.all([
        store.fetchTickets(openParams),
        store.fetchTickets(closedParams),
        store.fetchMetaOptions()
      ]);
    } else {
      const params = buildParams();
      await store.fetchTickets(params);
      await store.fetchMetaOptions();
    }
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
};

const fetchData = async () => {
  const params = buildParams();
  const paramsStr = JSON.stringify(params);

  pageLoading.value = true;
  try {
    if (filters.type || filters.category || filters.start_date || filters.end_date) {
      const openParams = { ...params };
      delete openParams.is_closed;
      const closedParams = { ...params, is_closed: 1 };
      
      await Promise.all([
        store.fetchTickets(openParams),
        store.fetchTickets(closedParams)
      ]);
    } else {
      if (filters.is_closed) {
        if (store.lastClosedFilters !== paramsStr) {
          await store.fetchTickets(params);
        }
      } else {
        if (store.lastOpenFilters !== paramsStr) {
          await store.fetchTickets(params);
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
};

const handleFilterChange = () => {
  if (activeTab.value === 'insights') {
    fetchInsightsData();
  } else {
    fetchData();
  }
};

const onDateChange = () => {
  const start = activeFilters.value.start_date;
  const end = activeFilters.value.end_date;
  if ((start && end) || (!start && !end)) {
    handleFilterChange();
  }
};

const clearFilters = () => {
  if (activeTab.value === 'insights') {
    insightsFilters.type = '';
    insightsFilters.category = '';
    insightsFilters.start_date = '';
    insightsFilters.end_date = '';
    fetchInsightsData();
  } else {
    filters.type = '';
    filters.category = '';
    filters.start_date = '';
    filters.end_date = '';
    filters.unread_only = false;
    fetchData();
  }
};

onMounted(async () => {
  pageLoading.value = true;
  try {
    await store.fetchMetaOptions();
    const promises = [
      store.fetchTickets({}), // Open
      store.fetchTickets({ is_closed: 1 }) // Closed
    ];
    if (authStore.can('view-others-tickets')) {
      promises.push(fetchInsightsData());
    }
    await Promise.all(promises);
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
});

const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const truncate = (text, length) => {
  if (!text) return '';
  const cleanText = stripHtml(text);
  return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
};

const formatDate = (dateString) => {
  if (!dateString) return 'recently';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const copyEmail = (email) => {
  if (!email) return;
  navigator.clipboard.writeText(email);
  notyf.success('Email copied to clipboard!');
};

const isTicketOwner = (ticket) => {
  const currentUser = authStore.user;
  if (!currentUser || !ticket?.user) return false;
  return currentUser.id === ticket.user.id || currentUser.email === ticket.user.email;
};
</script>
