<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 animate-fade-in">
    <div
      class="mx-auto w-full min-w-0 max-w-[1800px] px-2.5 sm:px-4 md:px-5 lg:px-6 xl:px-8"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Student requests
          </h1>
          <p v-if="apiMessage" class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-0.5 truncate">
            {{ apiMessage }}
            <span v-if="rows.length" class="text-gray-500">
              — {{ rows.length }} record(s)</span>
          </p>
          <p v-else class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
            Student requests and complaints from API.
          </p>
        </div>
        <button type="button"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#624ff6] text-white text-xs sm:text-sm font-medium shadow hover:opacity-95 disabled:opacity-50"
          :disabled="loading" @click="fetchRequests('refresh')">
          <Loader2 v-if="loading && fetchSource === 'refresh'" class="w-4 h-4 animate-spin" />
          <RefreshCw v-else class="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div
        class="mb-1.5 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/30 bg-white dark:bg-gray-800 px-2 py-2 space-y-2 shadow-sm">
        <p
          class="flex items-center gap-1 text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <SlidersHorizontal class="h-3 w-3 text-[#624ff6]" aria-hidden="true" />
          Filters
        </p>
        <div
          class="min-w-0 overflow-x-auto pb-0.5 [scrollbar-width:thin] xl:overflow-x-visible [-webkit-overflow-scrolling:touch]"
        >
          <div
            class="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2 xl:grid-cols-6 xl:gap-x-3 xl:gap-y-1.5 2xl:gap-x-4 items-end"
          >
            <div class="min-w-0">
              <label :class="filterLabelClass">From date</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input v-model="filters.from_date" type="date" :class="filterInputInnerClass" />
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">To date</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Calendar class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input v-model="filters.to_date" type="date" :class="filterInputInnerClass" />
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">Status</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <ListFilter class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <select v-model="filters.status" :class="filterSelectInnerClass">
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <!-- <div ref="employeeDropdownRootRef" class="relative min-w-0">
            <label :class="filterLabelClass">Employee</label>
            <button type="button" :class="[filterShellClass, 'p-0 cursor-pointer text-left w-full']"
              :aria-expanded="employeeDropdownOpen" aria-haspopup="listbox" @click="toggleEmployeeDropdown">
              <span :class="filterIconSlotClass">
                <UserRound class="h-4 w-4" aria-hidden="true" />
              </span>
              <span
                class="flex min-h-[2.5rem] flex-1 min-w-0 items-center justify-between gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                <span class="truncate">{{ selectedEmployeeTriggerLabel }}</span>
                <ChevronDown class="h-4 w-4 shrink-0 text-gray-500 transition-transform"
                  :class="{ 'rotate-180': employeeDropdownOpen }" />
              </span>
            </button>
            <div v-show="employeeDropdownOpen"
              class="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg"
              role="listbox" @mousedown.prevent>
              <div class="border-b border-gray-100 dark:border-gray-700 px-2 pb-1.5 pt-1">
                <input ref="employeeSelectSearchInputRef" v-model="employeeSelectSearchQuery" type="search"
                  autocomplete="off" placeholder="Search name or fingerprint..."
                  class="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#624ff6] focus:ring-1 focus:ring-[#624ff6] outline-none"
                  @keydown.escape.prevent="closeEmployeeDropdown" />
              </div>
              <ul class="max-h-48 overflow-y-auto text-sm">
                <li>
                  <button type="button" role="option"
                    class="w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer" :class="{
                      'bg-indigo-50 dark:bg-gray-700 font-medium text-indigo-800 dark:text-indigo-200':
                        filterEmployeeId === '' || filterEmployeeId == null,
                    }" @click="selectEmployeeFilter('')">
                    All employees
                  </button>
                </li>
                <li v-for="emp in filteredEmployeesForSelect" :key="emp.id">
                  <button type="button" role="option"
                    class="w-full px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer" :class="{
                      'bg-indigo-50 dark:bg-gray-700 font-medium text-indigo-800 dark:text-indigo-200':
                        String(filterEmployeeId) === String(emp.id),
                    }" @click="selectEmployeeFilter(emp.id)">
                    <span>{{ hrEmployeeDisplayName(emp) }}</span>
                    <span v-if="pickEmployeeFingerprint(emp)" class="text-xs text-gray-500 dark:text-gray-400">
                      ({{ pickEmployeeFingerprint(emp) }})
                    </span>
                  </button>
                </li>
                <li v-if="filteredEmployeesForSelect.length === 0" class="px-3 py-2 text-gray-400 text-xs">
                  No employees match.
                </li>
              </ul>
            </div>
          </div> -->
            <div class="min-w-0">
              <label :class="filterLabelClass">Type</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <Tags class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <select v-model="filters.type" :class="filterSelectInnerClass">
                  <option value="">All</option>
                  <option value="request">Request</option>
                  <option value="complain">Complain</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">Field</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <TextCursor class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <select v-model="filters.field" :class="filterSelectInnerClass">
                  <option value="">All</option>
                  <option value="Material">Material</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Information">Information</option>
                  <option value="Accreditation">Accreditation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="min-w-0">
              <label :class="filterLabelClass">Search with comman word</label>
              <div :class="filterShellClass">
                <span :class="filterIconSlotClass">
                  <SearchIcon class="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input v-model="filters.value" type="search" placeholder="Search" :class="filterInputInnerClass"
                  @keydown.enter.prevent="fetchRequests('apply')" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end pt-0.5">
          <div class="flex flex-wrap items-center gap-1.5 shrink-0">
            <button type="button"
              class="inline-flex h-8 items-center justify-center rounded-md bg-[#624ff6] px-3 text-xs sm:text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
              :disabled="loading" @click="fetchRequests('apply')">
              <Loader2 v-if="loading && fetchSource === 'apply'" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Apply filters
            </button>
            <button type="button"
              class="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              :disabled="loading" @click="clearFilters">
              Clear
            </button>
            <p v-if="employeesLoadError" class="text-xs text-amber-600 dark:text-amber-400 w-full sm:w-auto">
              Employee list failed to load.
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading && rows.length === 0"
        class="w-full flex flex-col justify-center items-center py-10 min-h-[160px] bg-white dark:bg-gray-800 rounded-lg border border-[#624ff6]/20 dark:border-[#624ff6]/35 shadow-sm fade-in"
        role="status" aria-live="polite">
        <div class="animate-spin rounded-full h-8 w-8 border-[3px] border-[#624ff6] border-t-transparent" />
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Loading requests…
        </p>
      </div>

      <div v-else-if="rows.length > 0" class="fade-in w-full space-y-2">
        <div class="flex flex-wrap justify-between items-center gap-2">
          <button type="button"
            class="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-semibold text-sm cursor-pointer select-none"
            @click="toggleSortByDate">
            Sort by date
            <span>
              <ArrowDownUp v-if="sortOrder === 'asc'" class="w-3.5 h-3.5" />
              <ArrowUpDown v-else class="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <div class="flex w-full flex-col gap-2">
          <div v-for="(row, rowIndex) in paginatedRows" :key="row.id ?? rowIndex"
            class="bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 flex flex-col w-full">
            <!-- Row 1: context left | type / field / status / actions right -->
            <div
              class="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-700/80 pb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-3"
            >
              <div
                class="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0 flex-1 text-xs sm:text-sm md:gap-x-3"
              >
                <span class="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{{
                  formatDate(row.created_at)
                }}</span>
                <span class="font-semibold text-gray-800 dark:text-gray-100 inline-flex min-w-0 max-w-full items-start gap-1">
                  <GraduationCap class="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span dir="auto" class="min-w-0 max-w-[min(100%,32rem)] break-words lg:max-w-[min(100%,42rem)]">{{
                    row.student?.name || "—"
                  }}</span>
                </span>
                <span v-if="row.student?.st_num != null && String(row.student.st_num).trim() !== ''"
                  class="text-gray-700 dark:text-gray-300 inline-flex items-center gap-1 min-w-0">
                  <IdCard class="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span dir="auto" class="truncate text-gray-700 dark:text-gray-300">{{
                    formatStudentNums(row) || "—"
                  }}</span>
                </span>
                <span v-if="row.student?.email" dir="auto"
                  class="text-gray-700 dark:text-gray-300 inline-flex items-center gap-1 min-w-0">
                  <Mail class="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span dir="auto" class="min-w-0 max-w-[min(100%,20rem)] break-words text-[11px] sm:text-xs">{{
                    row.student.email
                  }}</span>
                </span>
                <span v-if="row.employee?.name"
                  class="text-gray-700 dark:text-gray-300 inline-flex items-center gap-1 min-w-0">
                  <UserPen class="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span dir="auto" class="min-w-0 max-w-[min(100%,20rem)] break-words text-[11px] sm:text-xs">{{
                    row.comment
                  }}</span>
                </span>
              </div>
              <div
                class="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 lg:w-auto lg:max-w-[min(100%,28rem)] xl:max-w-none lg:shrink-0 lg:justify-end"
                style="direction: ltr; unicode-bidi: isolate"
              >
                <span v-if="row.field" dir="auto"
                  class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ row.field }}
                </span>
                <span v-if="row.type"
                  class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize">
                  {{ row.type }}
                </span>
                <div class="relative inline-block min-w-[6.5rem] text-center">
                  <select v-if="canChangeRequestStatus" v-model="row.status"
                    class="w-full text-center cursor-pointer px-2 py-0.5 rounded-full text-xs font-medium capitalize appearance-none pr-5 focus:outline-none focus:ring-0 border-0"
                    :class="statusSelectClass(row.status)" @change="updateRowStatus(row)">
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <!-- <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option> -->
                  </select>
                  <span v-else
                    class="inline-flex items-center justify-center w-full px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                    :class="statusSelectClass(row.status)">
                    {{ row.status || "—" }}
                  </span>
                  <div v-if="canChangeRequestStatus && loadingStatusId === row.id"
                    class="absolute top-1/2 right-1.5 -translate-y-1/2 pointer-events-none">
                    <div class="border-2 border-gray-300 border-t-green-600 rounded-full w-3.5 h-3.5 animate-spin" />
                  </div>
                </div>
                <button type="button"
                  class="inline-flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 text-green-800 dark:text-green-200 font-medium text-xs px-2 py-1 rounded-md transition"
                  @click="openFinalAcceptanceModal(row, 1)">
                  Force Pass
                  <CheckCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
                <button type="button"
                  class="inline-flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-800 dark:text-red-200 font-medium text-xs px-2 py-1 rounded-md transition"
                  @click="openFinalAcceptanceModal(row, 0)">
                  Force Fail
                  <XCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
                <button v-if="!hasEmployeeReply(row) && canEmpReply" type="button"
                  class="inline-flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-medium text-xs px-2 py-1 rounded-md transition"
                  @click="openReplyModal(row, 'emp_res')">
                  Employee Reply
                  <MessageCircleReply class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
                <button v-if="hasEmployeeReply(row) && !hasManagerReply(row) && canMngReply" type="button"
                  class="inline-flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-medium text-xs px-2 py-1 rounded-md transition"
                  @click="openReplyModal(row, 'mng_res')">
                  Manager Reply
                  <MessageCircleReply class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>

            <!-- Row 2: request body + comment + email (full width) -->
            <div class="pt-2 text-gray-800 dark:text-gray-200 text-sm leading-snug min-w-0" style="direction: ltr">
              <div class="mixed-text-container" dir="auto">
                <div v-if="expandKey(row.id, 'value') === expandedCell.key" class="mixed-text-content">
                  {{ displayCell(row.value) }}
                  <button type="button" dir="ltr"
                    class="ms-1.5 inline text-xs text-indigo-600 dark:text-indigo-400 underline align-baseline"
                    @click.stop="toggleExpand(row.id, 'value')">
                    Less
                  </button>
                </div>
                <div v-else class="mixed-text-content">
                  {{ truncateValuePreview(row.value) }}
                  <button v-if="valueNeedsExpand(row.value)" type="button" dir="ltr"
                    class="ms-1 inline text-xs text-indigo-600 dark:text-indigo-400 underline align-baseline"
                    @click.stop="toggleExpand(row.id, 'value')">
                    More
                  </button>
                </div>
              </div>
              <!-- <p v-if="row.comment"
                class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 border-t border-gray-100 dark:border-gray-600 pt-1.5">
                <span class="font-semibold text-gray-600 dark:text-gray-300">Comment:</span>
                <span dir="auto" class="inline pl-1 align-top">{{
                  row.comment
                }}</span>
              </p> -->
              <p v-if="row.student?.email" dir="ltr"
                class="mt-1 min-w-0 break-all text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                {{ row.student.email }}
              </p>
            </div>

            <!-- Row 3: threaded replies -->
            <div v-if="hasManagerReply(row) || hasEmployeeReply(row)"
              class="mt-2 space-y-2 border-t border-gray-100 dark:border-gray-700/80 pt-2 text-sm">
              <div v-if="hasManagerReply(row)"
                class="bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5 rounded border-s-[3px] border-indigo-400">
                <strong dir="ltr" class="text-indigo-600 dark:text-indigo-400 block text-xs mb-0.5">Manager
                  reply:</strong>
                <div class="mixed-text-container" dir="auto">
                  <div class="mixed-text-content">{{ row.manager_response }}</div>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span v-if="row.manager_response_at"
                    class="text-[11px] text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Clock class="w-3 h-3 shrink-0" />
                    {{ formatDate(row.manager_response_at) }}
                  </span>
                  <span v-if="row.manager?.name"
                    class="text-[11px] text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <UsersRound class="w-3 h-3 shrink-0" />
                    {{ row.manager.name }}
                  </span>
                </div>
              </div>

              <div v-if="hasEmployeeReply(row)"
                class="bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5 rounded border-s-[3px] border-blue-400">
                <strong dir="ltr" class="text-blue-600 dark:text-blue-400 block text-xs mb-0.5">Employee reply:</strong>
                <div class="mixed-text-container" dir="auto">
                  <div class="mixed-text-content">{{ row.employee_response }}</div>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span v-if="row.employee_response_at"
                    class="text-[11px] text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Clock class="w-3 h-3 shrink-0" />
                    {{ formatDate(row.employee_response_at) }}
                  </span>
                  <span v-if="row.employee?.name"
                    class="text-[11px] text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <UsersRound class="w-3 h-3 shrink-0" />
                    {{ row.employee.name }}<span v-if="employeeFingerprintLabel(row)">
                      · {{ employeeFingerprintLabel(row) }}</span>
                  </span>

                </div>
              </div>
            </div>
          </div>
        </div>

        <Pagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
          :page-numbers="pageNumbers" @update:current-page="(p) => (currentPage = p)" />
      </div>

      <div v-else-if="!loading"
        class="text-center py-8 px-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 fade-in">
        <div class="relative inline-block mb-4">
          <div class="absolute inset-0 rounded-full bg-[#624ff6]/10 dark:bg-[#624ff6]/20 blur-3xl scale-150" />
          <img src="@/assets/undraw_empty_4zx0.png" alt=""
            class="relative mx-auto w-56 sm:w-72 md:w-80 max-w-full drop-shadow-xl" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          No requests found
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          There are no student requests for the current filters, or none exist yet. Adjust your
          filters and click <span class="text-[#624ff6] font-semibold">Apply filters</span>, or
          <span class="text-[#624ff6] font-semibold">Clear</span> to reset.
        </p>
      </div>

      <ReplyRequestModal v-if="showReplyModal" v-model="showReplyModal" :field-key="replyKey"
        :loading-reply="loadingReply" @send-reply="handleReply" />

      <!-- Final Acceptance Modal -->
      <div v-if="showFinalAcceptanceModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity">
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-5 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span v-if="finalAcceptanceType === 1" class="text-green-600"><CheckCircle class="w-5 h-5"/></span>
            <span v-else class="text-red-600"><XCircle class="w-5 h-5"/></span>
            {{ finalAcceptanceType === 1 ? 'Force Pass' : 'Force Fail' }}
          </h3>
          <textarea
            v-model="finalAcceptanceNotes"
            rows="3"
            class="w-full p-5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none resize-none"
            placeholder="Type your notes here..."
          ></textarea>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              @click="showFinalAcceptanceModal = false" :disabled="loadingFinalAcceptance">
              Cancel
            </button>
            <button type="button"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none"
              :class="finalAcceptanceType === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
              @click="submitFinalAcceptance" :disabled="loadingFinalAcceptance">
              <Loader2 v-if="loadingFinalAcceptance" class="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ArrowDownUp,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Clock,
  GraduationCap,
  IdCard,
  Mail,
  ListFilter,
  Loader2,
  MessageCircleReply,
  RefreshCw,
  Search as SearchIcon,
  SlidersHorizontal,
  Tags,
  TextCursor,
  UserPen,
  UserRound,
  UsersRound,
  CheckCircle,
  XCircle,
} from "lucide-vue-next";
import apiClient from "@/api/axiosInstance";
import { GET_STUDENT_REQUEST_EMP, FINAL_ACCEPTANCE } from "@/api/Api";
import formatDate from "@/components/global/FormDate";
import Pagination from "@/components/srmDashboard/Pagination.vue";
import ReplyRequestModal from "@/components/srmDashboard/ReplyRequestModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useRequestStore } from "@/stores/srmStore/requestStore";
import notyf from "@/components/global/notyf";
import { hrEmployeeDisplayName } from "@/utils/hrEmployeePickerLabel";
import { handleError } from "@/stores/handleError";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const requestStore = useRequestStore();

/** Start true so first paint shows the list loader (not an empty-state flash). */
const loading = ref(true);
/** Drives which button shows a spinner: refresh | apply | initial. */
const fetchSource = ref(null);
const apiMessage = ref("");
const rows = ref([]);

const canEmpReply = computed(() => authStore.hasPermission("emp-reply"));
const canMngReply = computed(() => authStore.hasPermission("mng-reply"));
const canChangeRequestStatus = computed(() =>
  authStore.hasPermission("status-studentRequest"),
);

const showReplyModal = ref(false);
const selectedRequestId = ref(null);
const replyKey = ref("emp_res");
const loadingReply = ref(false);

const showFinalAcceptanceModal = ref(false);
const finalAcceptanceStudentId = ref(null);
const finalAcceptanceType = ref(0);
const finalAcceptanceNotes = ref("");
const loadingFinalAcceptance = ref(false);

function openFinalAcceptanceModal(row, type) {
  finalAcceptanceStudentId.value = row.student?.id ?? row.student_id;
  finalAcceptanceType.value = type;
  finalAcceptanceNotes.value = "";
  showFinalAcceptanceModal.value = true;
}

async function submitFinalAcceptance() {
  if (!finalAcceptanceStudentId.value) {
    notyf.error("Student ID is missing.");
    return;
  }
  loadingFinalAcceptance.value = true;
  try {
    const payload = {
      student_id: finalAcceptanceStudentId.value,
      is_accepted: finalAcceptanceType.value,
      notes: finalAcceptanceNotes.value
    };
    await apiClient.post(FINAL_ACCEPTANCE, payload);
    notyf.success(finalAcceptanceType.value === 1 ? "Force passed successfully" : "Force failed successfully");
    showFinalAcceptanceModal.value = false;
  } catch (error) {
    handleError(error);
  } finally {
    loadingFinalAcceptance.value = false;
  }
}

const sortOrder = ref("desc");
const currentPage = ref(1);
const pageSize = 5;
const expandedCell = ref({});
const loadingStatusId = ref(null);

const sortedRows = computed(() => {
  const list = [...rows.value];
  list.sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return sortOrder.value === "asc" ? da - db : db - da;
  });
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pageSize)),
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedRows.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  if (total <= 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

watch(
  () => rows.value.length,
  () => {
    currentPage.value = 1;
  },
);

function toggleSortByDate() {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
}

function expandKey(rowId, field) {
  return `${rowId}-${field}`;
}

function formatStudentNums(row) {
  const st =
    row?.student?.st_num != null && String(row.student.st_num).trim() !== ""
      ? String(row.student.st_num).trim()
      : "";
  if (st) return `${st}`;
  return "—";
}

function displayCell(val) {
  return val ?? "No data available";
}

function hasMeaningfulText(value) {
  const text = String(value ?? "").trim();
  if (!text) return false;
  // Treat placeholder-only content like "-" or "--" as empty.
  return !/^[-\s]+$/.test(text);
}

function hasEmployeeReply(row) {
  return (
    hasMeaningfulText(row?.employee_response) &&
    row?.employee_response_at != null
  );
}

function hasManagerReply(row) {
  return (
    hasMeaningfulText(row?.manager_response) &&
    row?.manager_response_at != null
  );
}

function employeeFingerprintLabel(row) {
  return pickEmployeeFingerprint(row?.employee);
}

/** Preview length for `row.value` before showing More/Less. */
const VALUE_PREVIEW_MAX_CHARS = 250;

function valueNeedsExpand(val) {
  return String(displayCell(val)).length > VALUE_PREVIEW_MAX_CHARS;
}

function truncateValuePreview(val) {
  const s = String(displayCell(val));
  if (s.length <= VALUE_PREVIEW_MAX_CHARS) return s;
  return `${s.slice(0, VALUE_PREVIEW_MAX_CHARS)}...`;
}

function toggleExpand(rowId, field) {
  const k = expandKey(rowId, field);
  expandedCell.value =
    expandedCell.value.key === k ? {} : { key: k, rowId, field };
}

function statusSelectClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "closed")
    return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200";
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200";
  if (s === "approved")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (s === "rejected")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
  return "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
}

async function updateRowStatus(row) {
  if (!canChangeRequestStatus.value) return;
  const prev = row.status;
  if (loadingStatusId.value === row.id) return;
  loadingStatusId.value = row.id;
  try {
    const updated = await requestStore.updateRequest(row.id, {
      status: row.status,
    });
    if (!updated) {
      row.status = prev;
    } else {
      const idx = rows.value.findIndex(
        (r) => String(r.id) === String(updated.id ?? row.id),
      );
      if (idx !== -1) {
        rows.value[idx] = { ...rows.value[idx], ...updated };
      }
    }
  } catch {
    row.status = prev;
  } finally {
    loadingStatusId.value = null;
  }
}

function openReplyModal(row, key = "emp_res") {
  selectedRequestId.value = row?.id ?? null;
  replyKey.value = key;
  showReplyModal.value = true;
}

async function handleReply({ key, value }) {
  const id = selectedRequestId.value;
  if (id == null || id === "") return;
  const valueTrim = String(value ?? "").trim();
  const rowBefore = rows.value.find((r) => String(r.id) === String(id));
  const isManager = key === "mng_res";
  const hadReplyBefore = isManager
    ? String(rowBefore?.manager_response ?? "").trim().length > 0
    : String(rowBefore?.employee_response ?? "").trim().length > 0;

  loadingReply.value = true;
  try {
    const updated = await requestStore.updateRequest(
      id,
      { [key]: value },
      { suppressError: true, suppressSuccess: true },
    );
    if (updated) {
      showReplyModal.value = false;
      notyf.success("Reply saved");
      await fetchRequests("reply-sync");
      return;
    }

    await fetchRequests("reply-sync");
    const rowAfter = rows.value.find((r) => String(r.id) === String(id));
    const respAfter = isManager
      ? String(rowAfter?.manager_response ?? "").trim()
      : String(rowAfter?.employee_response ?? "").trim();
    const prefixOk =
      !valueTrim ||
      respAfter.includes(valueTrim) ||
      respAfter.includes(valueTrim.slice(0, Math.min(60, valueTrim.length)));
    const saved =
      respAfter.length > 0 && (!hadReplyBefore || prefixOk);

    if (saved) {
      showReplyModal.value = false;
      notyf.success("Reply saved");
      return;
    }

    notyf.error("The reply could not be saved. Please try again or refresh.");
  } finally {
    loadingReply.value = false;
  }
}

const filterLabelClass =
  "block text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-0.5";
const filterShellClass =
  "flex min-h-[2.25rem] rounded-md border border-[#624ff6]/25 dark:border-[#624ff6]/35 bg-white dark:bg-gray-900 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-[#624ff6]/25 focus-within:border-[#624ff6]/45";
const filterIconSlotClass =
  "flex w-8 shrink-0 items-center justify-center self-stretch border-r border-[#624ff6]/15 dark:border-[#624ff6]/25 bg-[#624ff6]/[0.07] dark:bg-[#624ff6]/12 text-[#624ff6]";
const filterInputInnerClass =
  "min-h-[2.25rem] min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none";
const filterSelectInnerClass =
  "min-h-[2.25rem] min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none";

/** Filter fields — sent only when set (server rejects null). */
const filters = ref({
  from_date: "",
  to_date: "",
  status: "",
  type: "",
  field: "",
  value: "",
});

const filterEmployeeId = ref("");
const employeeDropdownOpen = ref(false);
const employeeSelectSearchQuery = ref("");
const employeeSelectSearchInputRef = ref(null);
const employeeDropdownRootRef = ref(null);
const employeesLoadError = ref(false);

function pickEmployeeFingerprint(emp) {
  if (!emp) return "";
  const raw = emp.fingerprint ?? emp.personal_info?.fingerprint;
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  return s || "";
}

const filteredEmployeesForSelect = computed(() => {
  const list = employeeStore.employees || [];
  const q = String(employeeSelectSearchQuery.value ?? "")
    .toLowerCase()
    .trim();
  if (!q)
    return [...list].sort((a, b) =>
      hrEmployeeDisplayName(a).localeCompare(
        hrEmployeeDisplayName(b),
        undefined,
        { sensitivity: "base" },
      ),
    );
  return list
    .filter((emp) => {
      const label = hrEmployeeDisplayName(emp).toLowerCase();
      const fp = pickEmployeeFingerprint(emp).toLowerCase();
      return label.includes(q) || fp.includes(q);
    })
    .sort((a, b) =>
      hrEmployeeDisplayName(a).localeCompare(
        hrEmployeeDisplayName(b),
        undefined,
        { sensitivity: "base" },
      ),
    );
});

const selectedEmployeeTriggerLabel = computed(() => {
  const id = filterEmployeeId.value;
  if (id === "" || id == null) return "All employees";
  const list = employeeStore.employees || [];
  const emp = list.find((e) => String(e.id) === String(id));
  return emp ? hrEmployeeDisplayName(emp) : "All employees";
});

function closeEmployeeDropdown() {
  employeeDropdownOpen.value = false;
}

function toggleEmployeeDropdown() {
  employeeDropdownOpen.value = !employeeDropdownOpen.value;
  if (employeeDropdownOpen.value) {
    employeeSelectSearchQuery.value = "";
    nextTick(() => {
      employeeSelectSearchInputRef.value?.focus();
    });
  }
}

function selectEmployeeFilter(rawId) {
  filterEmployeeId.value =
    rawId === "" || rawId == null ? "" : String(rawId);
  employeeSelectSearchQuery.value = "";
  closeEmployeeDropdown();
}

function clearFilters() {
  filters.value = {
    from_date: "",
    to_date: "",
    status: "",
    type: "",
    field: "",
    value: "",
  };
  filterEmployeeId.value = "";
  fetchRequests("apply");
}

function onDocumentMousedownEmployeeDropdown(e) {
  if (!employeeDropdownOpen.value) return;
  const root = employeeDropdownRootRef.value;
  if (root && !root.contains(e.target)) {
    closeEmployeeDropdown();
  }
}

function buildFilterBody() {
  const f = filters.value;
  const body = {};
  if (f.from_date) body.from_date = f.from_date;
  if (f.to_date) body.to_date = f.to_date;
  if (f.status?.trim()) body.status = f.status.trim();
  if (f.type?.trim()) body.type = f.type.trim();
  if (f.field?.trim()) body.field = f.field.trim();
  if (f.value?.trim()) body.value = f.value.trim();
  if (filterEmployeeId.value) {
    const emp = employeeStore.employees.find(
      (e) => String(e.id) === String(filterEmployeeId.value),
    );
    if (emp) {
      const name = hrEmployeeDisplayName(emp).trim();
      if (name) body.emp_res = name;
    }
  }
  return body;
}

/**
 * @param {'refresh' | 'apply' | 'initial' | 'reply-sync'} source
 * `initial`: first page load (same UX as apply).
 * `reply-sync`: refetch after reply without full-page loading or button spinners.
 */
async function fetchRequests(source = "apply") {
  const silent = source === "reply-sync";
  fetchSource.value = silent ? null : source;
  if (!silent) loading.value = true;
  try {
    const { data } = await apiClient.post(
      GET_STUDENT_REQUEST_EMP,
      buildFilterBody(),
    );
    apiMessage.value = data?.message || "";
    const raw = data?.data;
    rows.value = Array.isArray(raw) ? raw : [];
  } catch (e) {
    handleError(e);
    if (!silent) {
      rows.value = [];
      apiMessage.value = "";
    }
  } finally {
    if (!silent) loading.value = false;
    fetchSource.value = null;
  }
}

onMounted(async () => {
  document.addEventListener("mousedown", onDocumentMousedownEmployeeDropdown);
  employeesLoadError.value = false;
  // Do not block requests on employees: list API does not need the HR list unless a filter is set.
  await Promise.all([
    fetchRequests("initial"),
    employeeStore.getEmployees().catch(() => {
      employeesLoadError.value = true;
    }),
  ]);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onDocumentMousedownEmployeeDropdown);
});
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
/* Mixed Arabic / English: use dir="auto" on .mixed-text-container in markup.
   unicode-bidi: plaintext keeps order natural for mixed scripts. */
.mixed-text-container {
  width: 100%;
  margin: 0.1rem 0;
}

.mixed-text-content {
  text-align: start;
  unicode-bidi: plaintext;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: normal;
  line-height: 1.45;
  padding: 0.1rem 0;
}

@media (max-width: 640px) {
  .mixed-text-content {
    font-size: 0.875rem;
    line-height: 1.35rem;
  }
}
</style>
