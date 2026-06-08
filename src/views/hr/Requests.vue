<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employee Requests</h1>
        <p class="text-gray-500 mt-1">Manage leave, overtime, and shift changes</p>
      </div>
      <div class="flex gap-2">
        <button type="button"
          class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
          :disabled="refreshingList || store.loading" title="Refresh requests" @click="handleManualRefresh">
          <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': refreshingList }" />
        </button>
        <button v-if="canAccessPendingQueue" type="button" @click="togglePendingQueueMode"
          :disabled="switchingQueueMode || store.loading"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          :class="pendingQueueMode ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600'">
          <LucideRefreshCw v-if="switchingQueueMode || store.loading" class="w-4 h-4 animate-spin" />
          {{ pendingQueueMode ? 'Show all my requests' : 'Show all pending requests' }}
        </button>
        <button v-if="showBulkSelectionColumn" type="button" :disabled="selectedRequestIds.length === 0 ||
          !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) ||
          store.loading
          " class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors" :class="selectedRequestIds.length > 0 &&
            authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) &&
            !store.loading
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
            : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            " @click="confirmBulkApprove">
          Bulk approve
        </button>
        <button v-if="showBulkSelectionColumn" type="button" :disabled="selectedRequestIds.length === 0 ||
          !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST) ||
          store.loading
          " class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors" :class="selectedRequestIds.length > 0 &&
            authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST) &&
            !store.loading
            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
            : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            " @click="confirmBulkReject">
          Bulk reject
        </button>
        <button v-if="
          authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST) ||
          authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS)
        " type="button" @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
          <span class="text-xl">+</span> New Request
        </button>
      </div>
    </div>

    <!-- My requests filters (API: GET .../employee-requests/me) -->
    <div v-if="!pendingQueueMode" class="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <!-- <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
        My requests filters
      </p> -->
      <div class="flex flex-col gap-4 xl:gap-2">
        <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end xl:flex-nowrap xl:items-end xl:gap-3">
          <div class="w-full min-w-0 xl:flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Payroll month</label>
            <input v-model="myFilterMonth" type="month"
              class="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none" />
            <p v-if="myPeriodLabel" class="text-[11px] text-gray-500 mt-1 leading-snug xl:hidden">
              {{ myPeriodLabel }}
            </p>
          </div>
          <div class="w-full min-w-0 xl:flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select v-model="myFilterStatus"
              class="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <!-- <div class="w-full shrink-0 sm:w-auto xl:w-[9.75rem] xl:shrink-0 xl:flex xl:justify-stretch">
            <button
              type="button"
              class="w-full h-10 px-4 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center"
              :disabled="store.loading"
              @click="applyMyRequestFilters"
            >
              Apply filters
            </button>
          </div> -->
        </div>
        <div class="hidden xl:flex xl:flex-row xl:flex-nowrap xl:gap-3 xl:items-start">
          <div class="flex-1 min-w-0 text-[11px] text-gray-500 leading-snug break-words">
            <template v-if="myPeriodLabel">{{ myPeriodLabel }}</template>
          </div>
          <div class="flex-1 min-w-0 text-[11px] text-gray-500 leading-snug break-words">
            <template v-if="myFilterStatus">selected status is {{ myFilterStatus }}</template>
            <template v-else>all statuses</template>
          </div>
          <div class="w-[9.75rem] shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Pending queue filters (API: GET .../employee-requests/pending) -->
    <div v-if="canAccessPendingQueue && pendingQueueMode"
      class="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <p class="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-3">
        Pending queue filters
      </p>
      <!-- xl: controls stay on one row; helper text on a second row with matching column widths -->
      <div class="flex flex-col gap-4 xl:gap-2">
        <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end xl:flex-nowrap xl:items-end xl:gap-3">
          <div class="w-full min-w-0 xl:flex-[1.05]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Payroll month</label>
            <input v-model="pendingFilterMonth" type="month"
              class="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <p v-if="pendingPeriodLabel" class="text-[11px] text-gray-500 mt-1 leading-snug xl:hidden">
              {{ pendingPeriodLabel }}
            </p>
          </div>
          <div class="w-full min-w-0 xl:flex-[0.85]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select v-model="pendingFilterStatus"
              class="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

          </div>
          <div class="w-full min-w-0 xl:flex-[1.85]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Employee</label>
            <div ref="pendingEmployeePickerRoot" class="relative">
              <button type="button"
                class="w-full h-10 flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 text-sm bg-white text-left focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="store.loading" :aria-expanded="pendingEmployeePickerOpen" aria-haspopup="listbox"
                @click.stop="togglePendingEmployeePicker">
                <span class="min-w-0 flex-1 flex items-center gap-2">
                  <template v-if="!String(pendingFilterEmployeeId ?? '').trim()">
                    <span class="truncate text-gray-800">All employees</span>
                  </template>
                  <template v-else>
                    <span class="truncate text-gray-800">
                      {{
                        selectedPendingEmployee
                          ? pendingEmployeeBaseLabel(selectedPendingEmployee)
                          : `Employee #${pendingFilterEmployeeId}`
                      }}
                    </span>
                    <span v-if="selectedPendingEmployee && pendingEmployeeCountForBadge(selectedPendingEmployee) > 0"
                      class="inline-flex shrink-0 items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 tabular-nums">
                      {{ pendingEmployeeCountForBadge(selectedPendingEmployee) }}
                    </span>
                  </template>
                </span>
                <LucideChevronDown class="w-4 h-4 shrink-0 text-gray-500 transition-transform pointer-events-none"
                  :class="{ 'rotate-180': pendingEmployeePickerOpen }" aria-hidden="true" />
              </button>
              <div v-show="pendingEmployeePickerOpen"
                class="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="listbox" @mousedown.prevent>
                <div class="px-2 pb-1.5 pt-1 border-b border-gray-100">
                  <input ref="pendingEmployeeSelectSearchInputRef" v-model="pendingEmployeeSelectSearchQuery"
                    type="search" autocomplete="off" placeholder="Search name or fingerprint..."
                    class="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    @keydown.escape.prevent="pendingEmployeePickerOpen = false" />
                </div>
                <div class="max-h-56 overflow-y-auto">
                  <button type="button" role="option"
                    class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50 cursor-pointer"
                    :class="{
                      'bg-indigo-50 text-indigo-900': !String(pendingFilterEmployeeId ?? '').trim(),
                    }" @click="selectPendingFilterEmployee('')">
                    <span>All employees</span>
                  </button>
                  <button v-for="emp in filteredEmployeesSortedForPendingSelect" :key="emp.id" type="button"
                    role="option"
                    class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer"
                    :class="{
                      'bg-indigo-50 text-indigo-900':
                        String(pendingFilterEmployeeId) === String(emp.id),
                    }" @click="selectPendingFilterEmployee(String(emp.id))">
                    <span class="min-w-0 truncate">{{ pendingEmployeeBaseLabel(emp) }}</span>
                    <span v-if="pendingEmployeeCountForBadge(emp) > 0"
                      class="inline-flex shrink-0 items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 tabular-nums">
                      {{ pendingEmployeeCountForBadge(emp) }}
                    </span>
                  </button>
                  <p v-if="filteredEmployeesSortedForPendingSelect.length === 0"
                    class="px-3 py-2 text-xs text-gray-400">
                    No employees match.
                  </p>
                </div>
              </div>
            </div>
            <p v-if="pendingEmployeeCountsHint" class="text-[11px] text-gray-500 mt-1 leading-snug xl:hidden">
              {{ pendingEmployeeCountsHint }}
            </p>
          </div>
          <div class="w-full shrink-0 sm:w-auto xl:w-[9.75rem] xl:shrink-0 xl:flex xl:justify-stretch">
            <button type="button"
              class="w-full h-10 px-4 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center"
              :disabled="store.loading" @click="applyPendingFilters">
              Apply filters
            </button>
          </div>
        </div>
        <div class="hidden xl:flex xl:flex-row xl:flex-nowrap xl:gap-3 xl:items-start">
          <div class=" flex-[1.05] min-w-0 text-[11px] text-gray-500 leading-snug break-words">
            <template v-if="pendingPeriodLabel">{{ pendingPeriodLabel }}</template>
          </div>
          <div class=" flex-[0.85] min-w-0 text-[11px] text-gray-500 leading-snug break-words">
            <template v-if="pendingFilterStatus">selected status is {{ pendingFilterStatus }}</template>
          </div>
          <div class=" flex-[1.85] min-w-0 text-[11px] text-gray-500 leading-snug break-words">
            <template v-if="pendingEmployeeCountsHint">{{ pendingEmployeeCountsHint }}</template>
          </div>
          <div class="w-[9.75rem] shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div v-if="pendingQueueMode" class="mb-4">
      <div class="relative max-w-md">
        <LucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true" />
        <input v-model="searchQuery" type="search" autocomplete="off"
          placeholder="Search by employee name or fingerprint..."
          class="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
      </div>
    </div>

    <!-- Profile Missing Error -->
    <div v-if="profileError" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6">
      <div class="flex items-center gap-3">
        <LucideAlertTriangle class="w-5 h-5 flex-shrink-0" />
        <div>
          <p class="font-bold">Personal Profile Not Found</p>
          <p class="text-sm opacity-90">To view your requests or create new ones, you must first have an employee record
            linked to your user account. Please contact your HR administrator.</p>
        </div>
      </div>
    </div>

    <!-- Pending queue: backend requires employee_id for /pending — prompt before first load -->
    <div v-if="pendingTableBlockedNoEmployee"
      class="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white px-8 py-14 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-5">
        <LucideUserRoundSearch class="w-8 h-8" aria-hidden="true" />
      </div>
      <p class="text-lg font-semibold text-gray-800 mb-2">Select an employee first</p>
      <p class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-4">
        Choose a specific employee in <strong>Pending queue filters</strong> above, then click
        <strong>Apply filters</strong> to load their requests. Request counts in the dropdown still update for the
        selected month and status.
      </p>
      <div class="inline-flex items-center gap-2 text-xs font-medium text-indigo-600">
        <LucideCircleArrowUp class="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Use the Employee field in the filter bar</span>
      </div>
    </div>

    <div v-if="showBulkSelectionColumn && pendingSelectableIds.length" class="flex flex-wrap items-center gap-2 mb-3">
      <label class="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700"
        :class="{ 'opacity-50 cursor-not-allowed': !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) && !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST) }">
        <input ref="selectAllCheckboxRef" type="checkbox"
          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" :checked="allPendingSelected"
          :disabled="!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) && !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)" @change="toggleSelectAllPending" />
        <span>Select all</span>
      </label>
      <span class="text-xs text-gray-500">({{ pendingSelectableIds.length }} pending)</span>
    </div>

    <!-- Table -->
    <HrDataTable v-if="!pendingTableBlockedNoEmployee" :headers="headers" :items="filteredRequests"
      :loading="store.loading" :emptyMessage="emptyMessage" :reset-page-on-items-change="false" :hasActions="false"
      :hasDelete="false" :hasEdit="false" @edit="null">
      <template #select="{ item }">
        <div v-if="item.status === 'pending'" class="flex justify-center">
          <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            :checked="isBulkSelected(item.id)" :disabled="!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) && !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)"
            @change="toggleBulkSelect(item.id)" />
        </div>
      </template>
      <template #employee="{ item }">
        <div class="flex flex-col items-center justify-center text-center w-full">
          <span class="text-gray-800 font-medium">{{ employeeDisplayName(item) }}</span>
          <div v-show="item.original_shift" class="flex flex-row justify-center items-center mt-1">
            <span class="text-gray-800 font-medium">{{ item.original_shift?.start_time }}</span>
            <span class="text-gray-800 font-medium mx-1"> &rarr; </span>
            <span class="text-gray-800 font-medium">{{ item.original_shift?.end_time }}</span>
          </div>
        </div>
      </template>
      <template #request_type="{ item }">
        <span class="text-gray-800 ">{{ formatRequestTypeLabel(item.request_type) }}</span>
      </template>
      <template #day="{ item }">
        <span class="text-gray-800">{{ formatDate(item.day) }}</span>
      </template>
      <template #duration="{ item }">
        <span class="text-gray-700">{{ formatDuration(item) }}</span>
      </template>
      <template #overtime_minutes="{ item }">
        <span v-if="
          ['overtime', 'overtime_before', 'overtime_after'].includes(item.request_type) &&
          item.overtime_minutes != null &&
          item.overtime_minutes !== ''
        " class="text-gray-800 font-medium tabular-nums">
          {{ Number(item.overtime_minutes) }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #is_paid="{ item }">
        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
          :class="isPaidYes(item) ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'">
          {{ isPaidYes(item) ? 'Paid' : 'Unpaid' }}
        </span>
      </template>
      <template #created_at="{ item }">
        <span class="text-gray-700">{{ formatDate(item.created_at) }}</span>
      </template>
      <template #action_by="{ item }">
        <span class="text-gray-700">{{ actionByDisplay(item) }}</span>
      </template>
      <template #status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="{
          'bg-yellow-100 text-yellow-800': item.status === 'pending',
          'bg-green-100 text-green-800': item.status === 'approved',
          'bg-red-100 text-red-800': item.status === 'rejected'
        }">
          {{ statusLabel(item.status) }}
        </span>
      </template>
      <template #actions="{ item }">
        <div class="flex flex-wrap gap-2 justify-center items-center">
          <button v-if="canShowRequestEditPencil(item)" type="button" title="Edit"
            class="text-blue-600 hover:text-blue-800 p-1 cursor-pointer transition-transform hover:scale-125"
            @click="openEditModal(item)">
            <LucidePencil class="w-6 h-6" />
          </button>
          <template v-if="item.status === 'pending'">
            <button v-if="authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)" type="button" title="Approve"
              class="text-green-600 hover:text-green-800 p-1 cursor-pointer transition-transform hover:scale-125"
              @click="confirmApprove(item.id)">
              <LucideCheckCircle class="w-6 h-6" />
            </button>
            <button v-if="authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)" type="button" title="Reject"
              class="text-red-600 hover:text-red-800 p-1 cursor-pointer transition-transform hover:scale-125"
              @click="confirmReject(item.id)">
              <LucideXCircle class="w-6 h-6" />
            </button>
          </template>
        </div>
      </template>
    </HrDataTable>

    <!-- Create / Edit Request Modal -->
    <HrModal :show="showModal" :title="isEditing ? 'Edit Request' : 'Create New Request'" :loading="store.loading"
      :save-disabled="latenessSaveBlocked" @close="closeRequestModal" @save="handleSubmit">
      <div class="space-y-4">
        <template v-if="!isEditing">
          <div v-if="showCreateTargetTabs" class="flex p-1 bg-gray-100 rounded-xl gap-1">
            <button type="button"
              class="flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer" :class="createRequestTarget === 'self'
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:bg-gray-200/50'
                " @click="setCreateTargetSelf">
              For myself
            </button>
            <button type="button"
              class="flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer" :class="createRequestTarget === 'other'
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:bg-gray-200/50'
                " @click="setCreateTargetOther">
              For another employee
            </button>
          </div>
          <p v-else-if="canCreateRequestForOthers && !canCreateEmployeeRequest" class="text-sm text-gray-600">
            Creating a request on behalf of another employee.
          </p>
        </template>

        <div v-if="!isEditing && createRequestTarget === 'other'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select v-model="forOtherEmployeeId" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="">Select employee…</option>
            <option v-for="emp in employeesListForPicker" :key="emp.id" :value="String(emp.id)">
              {{ employeePickerLabel(emp) }}
            </option>
          </select>
        </div>

        <div v-if="isEditing && authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)" class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Request status</label>
          <select v-model="form.status" :disabled="store.loading"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <p class="text-xs text-gray-500">
            Saved with the request when you click Save (PUT update).
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select v-model="form.request_type" :disabled="editingIsApproverOnly || store.loading"
            class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="lateness">Lateness</option>
            <option value="leave">Leave</option>
            <option value="overtime">Overtime (total)</option>
            <option value="overtime_before">Overtime (before shift)</option>
            <option value="overtime_after">Overtime (after shift)</option>
            <option value="vacation">Vacation</option>
            <option value="day_off_swap">Day Off Swap</option>
            <option value="work_from_home">Work From Home</option>
            <option value="shift_move">Shift Move</option>
            <option value="absence">Absence</option>
            <option value="double_paid">Double Paid</option>
          </select>
          <p v-if="latenessSaveBlocked"
            class="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" role="status">
            Lateness of {{ LATENESS_GRACE_MINUTES }} minutes or less is covered by the grace period. You cannot submit a
            lateness request for this amount.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input v-model="form.day" type="date" :disabled="editingIsApproverOnly || store.loading"
              class="w-full border border-gray-300 rounded-lg px-4 py-2" />
            <p v-if="isServerCalculatedOvertime(form.request_type)" class="mt-1 text-xs text-gray-500">
              Overtime (total or before/after shift): only the date is sent — minutes are calculated on the server from
              shift and punches.
            </p>
          </div>

          <!-- Lateness/Leave: duration_hours = ceil(min/60) for new contracts; exact minutes for `old` -->
          <div v-if="['lateness', 'leave'].includes(form.request_type)" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input v-model.number="form.duration_minutes" type="number" min="1" step="1"
              :disabled="editingIsApproverOnly || store.loading"
              class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 24" />
          </div>

          <!-- Conditional: Day Replacement (Day Off Swap) -->
          <div v-if="form.request_type === 'day_off_swap'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
            <input v-model="form.day_replacement" type="date" :disabled="editingIsApproverOnly || store.loading"
              class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <!-- Conditional: Duration Type (Vacation) -->
          <div v-if="form.request_type === 'vacation'" class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
            <select v-model="form.duration_type" :disabled="editingIsApproverOnly || store.loading"
              class="w-full border border-gray-300 rounded-lg px-4 py-2">
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>
          </div>

          <!-- From/To Time — same visibility as AttendanceRequestModal (shift_move, etc.) -->
          <template v-if="showFromToFields">
            <div class="col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">From Time</label>
              <input v-model="form.from_time" type="time" step="1" :disabled="editingIsApproverOnly || store.loading"
                class="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">To Time</label>
              <input v-model="form.to_time" type="time" step="1" :disabled="editingIsApproverOnly || store.loading"
                class="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
          </template>
        </div>
      </div>
    </HrModal>

    <!-- Confirmation Modals -->
    <SweetAlert2Modal v-if="showConfirmApprove" title="Approve Request?"
      text="Are you sure you want to approve this request?" icon="question" confirmButtonText="Yes, Approve"
      confirmButtonClass="bg-emerald-600 hover:bg-emerald-700" @confirm="handleApprove"
      @cancel="showConfirmApprove = false" />
    <SweetAlert2Modal v-if="showConfirmBulkApprove" title="Bulk approve requests?" :text="bulkApproveConfirmText"
      icon="question" confirmButtonText="Yes, approve all" confirmButtonClass="bg-emerald-600 hover:bg-emerald-700"
      @confirm="handleBulkApprove" @cancel="showConfirmBulkApprove = false" />
    <SweetAlert2Modal v-if="showConfirmBulkReject" title="Bulk reject requests?" :text="bulkRejectConfirmText"
      icon="warning" confirmButtonText="Yes, reject all" confirmButtonClass="bg-rose-600 hover:bg-rose-700"
      @confirm="handleBulkReject" @cancel="showConfirmBulkReject = false" />
    <!-- Rejection Modal -->
    <HrModal v-if="showConfirmReject" :show="showConfirmReject" title="Reject Request" :loading="store.loading"
      saveLabel="Reject" @close="showConfirmReject = false" @save="handleReject">
      <div class="space-y-4">
        <div class="mb-4 text-gray-600">
          Are you sure you want to reject this request?
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
          <textarea v-model="rejectionNote" rows="4"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Please explain why this request is being rejected..."></textarea>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useHrRequestsStore } from '@/stores/hr/requests';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrContractsStore } from '@/stores/hr/contracts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import {
  LucideCheckCircle,
  LucideXCircle,
  LucideAlertTriangle,
  LucidePencil,
  LucideSearch,
  LucideRefreshCw,
  LucideCircleArrowUp,
  LucideUserRoundSearch,
  LucideChevronDown,
} from 'lucide-vue-next';
import notyf from "@/components/global/notyf";
import formatDate from '@/components/global/FormDate';
import { HR_PERMISSION } from '@/constants/hrPermissions';
import { normalizeApiTime } from '@/utils/normalizeApiTime';
import {
  isDayOnlyOvertimeRequestTypeSlug as isServerCalculatedOvertime,
  normalizeRequestTypeSlug,
} from '@/utils/employeeRequestApi';
import { LATENESS_GRACE_MINUTES } from '@/constants/hrLateness';
import {
  activeContractTypeForEmployee,
  contractExemptsNewLatenessAttendanceRules,
  contractTypeSlugFromEmployeeRequestRow,
  contractTypeSlugFromLoggedInPayrollAuthUser,
  latenessLeaveDurationApiFieldsFromMinutes,
  parsedDurationMinutesFromRequestRow,
} from '@/utils/hrEmployeeRequestDuration';
import { defaultPayrollMonthRange, getPayrollDates } from '@/utils/payrollPeriod';

const REQUEST_TYPE_LABELS = {
  lateness: 'Lateness',
  leave: 'Leave',
  overtime: 'Overtime (total)',
  overtime_before: 'Overtime (before shift)',
  overtime_after: 'Overtime (after shift)',
  vacation: 'Vacation',
  day_off_swap: 'Day off swap',
  work_from_home: 'Work from home',
  shift_move: 'Shift move',
  absence: 'Absence',
  double_paid: 'Double paid',
};

const APPROVER_JOB_TITLES_NORMALIZED = new Set(['hr', 'hr manager', 'general manager']);

function pushJobTitle(out, raw) {
  if (raw == null) return;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s) out.push(s);
    return;
  }
  if (typeof raw === 'object') {
    const name = raw.title_name ?? raw.name ?? raw.title;
    if (name) out.push(String(name).trim());
  }
}

function collectJobTitleNamesFromUser(u) {
  const out = [];
  if (!u) return out;
  pushJobTitle(out, u.job_title);
  if (Array.isArray(u.job_titles)) u.job_titles.forEach((t) => pushJobTitle(out, t));
  const emp = u.employee;
  if (emp) {
    pushJobTitle(out, emp.job_title);
    if (Array.isArray(emp.job_titles)) emp.job_titles.forEach((t) => pushJobTitle(out, t));
    if (Array.isArray(emp.job_departments)) {
      emp.job_departments.forEach((jd) => {
        pushJobTitle(out, jd?.job_title);
        if (jd?.job_title && typeof jd.job_title === 'object') {
          pushJobTitle(out, jd.job_title.title_name ?? jd.job_title.name);
        }
      });
    }
  }
  return out;
}

function normalizeJobTitleKey(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

function jobTitleIsApprover(name) {
  return APPROVER_JOB_TITLES_NORMALIZED.has(normalizeJobTitleKey(name));
}

const CELL_TEXT = 'text-base text-gray-800';
const CELL_CENTER = `${CELL_TEXT} text-center whitespace-nowrap`;
const CELL_CENTER_WIDE = `${CELL_CENTER} min-w-[140px]`;

const authStore = useAuthStore();
const store = useHrRequestsStore();
const empStore = useHrEmployeesStore();
const contractStore = useHrContractsStore();
const requests = computed(() => store.requests);

const searchQuery = ref('');

const normalizedSearchQuery = computed(() =>
  String(searchQuery.value ?? '')
    .toLowerCase()
    .trim(),
);

const filteredRequests = computed(() => {
  const list = requests.value;
  const q = normalizedSearchQuery.value;
  if (!q) return list;
  return list.filter((item) => {
    const name = String(item.employee?.name ?? '')
      .toLowerCase()
      .trim();
    const fp = String(item.employee?.fingerprint ?? '').trim();
    return name.includes(q) || fp.toLowerCase().includes(q);
  });
});

const canCreateEmployeeRequest = computed(() =>
  authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST),
);
const canCreateRequestForOthers = computed(() =>
  authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS),
);
/** Both permissions: show two tabs in create modal. */
const showCreateTargetTabs = computed(
  () => canCreateEmployeeRequest.value && canCreateRequestForOthers.value,
);

const createRequestTarget = ref('self');
const forOtherEmployeeId = ref('');

const employeesListForPicker = computed(() => empStore.employees || []);

function employeePickerLabel(emp) {
  if (!emp) return '';
  const pi = emp.personal_info || {};
  const name =
    [pi.first_name, pi.last_name].filter(Boolean).join(' ').trim() ||
    (emp.name ? String(emp.name).trim() : '') ||
    `Employee #${emp.id}`;
  return name;
}

async function ensureEmployeesForPicker() {
  if (!canCreateRequestForOthers.value) return;
  if (employeesListForPicker.value.length > 0) return;
  try {
    await empStore.getEmployees();
  } catch {
    /* store already notified */
  }
}

function setCreateTargetSelf() {
  createRequestTarget.value = 'self';
  forOtherEmployeeId.value = '';
}

function setCreateTargetOther() {
  createRequestTarget.value = 'other';
  void ensureEmployeesForPicker();
}

/** Hide Actions column unless user may approve, reject, or update pending requests. */
const canShowRequestActionsColumn = computed(
  () =>
    authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) ||
    authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST),
);

const canUpdateEmployeeRequest = computed(() =>
  authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST),
);

/** Pending queue toggle + `/pending` API — requires `view-pending-requests` (admin bypasses via `can`). */
const canAccessPendingQueue = computed(() =>
  authStore.can(HR_PERMISSION.VIEW_PENDING_REQUESTS),
);

const pendingQueueMode = ref(false);

const myFilterMonth = ref(defaultPayrollMonthRange().payrollMonth);
/** Use `''` in the select for “All statuses” (omits `status` on `/me`). */
const myFilterStatus = ref('pending');

const myPeriodBounds = computed(() => getPayrollDates(myFilterMonth.value));

const myPeriodLabel = computed(() => {
  const { from_date, to_date } = myPeriodBounds.value;
  if (!from_date || !to_date) return '';
  return `Period: ${from_date} → ${to_date}`;
});

function buildMyRequestsFiltersPayload() {
  const { from_date, to_date } = myPeriodBounds.value;
  const payload = {
    from: from_date,
    to: to_date,
  };
  const st = String(myFilterStatus.value ?? '').trim();
  if (st) payload.status = st;
  return payload;
}

function applyMyRequestFilters() {
  void fetchData();
}

const pendingFilterMonth = ref(defaultPayrollMonthRange().payrollMonth);
const pendingFilterStatus = ref('pending');
const pendingFilterEmployeeId = ref('');
const pendingEmployeePickerOpen = ref(false);
const pendingEmployeePickerRoot = ref(null);
const pendingEmployeeSelectSearchQuery = ref('');
const pendingEmployeeSelectSearchInputRef = ref(null);

/** `/pending` API requires `employee_id` — show guidance instead of the table until one is chosen. */
const pendingTableBlockedNoEmployee = computed(
  () =>
    canAccessPendingQueue.value &&
    pendingQueueMode.value &&
    !String(pendingFilterEmployeeId.value ?? '').trim(),
);

const pendingPeriodBounds = computed(() => getPayrollDates(pendingFilterMonth.value));

const pendingPeriodLabel = computed(() => {
  const { from_date, to_date } = pendingPeriodBounds.value;
  if (!from_date || !to_date) return '';
  return `Period: ${from_date} → ${to_date}`;
});

function buildPendingFiltersPayload() {
  const { from_date, to_date } = pendingPeriodBounds.value;
  const payload = {
    from: from_date,
    to: to_date,
  };
  const st = String(pendingFilterStatus.value ?? '').trim();
  if (st) payload.status = st;
  const eid = String(pendingFilterEmployeeId.value ?? '').trim();
  if (eid) payload.employee_id = eid;
  return payload;
}

function applyPendingFilters() {
  void fetchData();
}

/** Backend may use requests_count, request_count, or camelCase. */
function pendingRowRequestsCount(row) {
  if (!row || typeof row !== 'object') return 0;
  const raw =
    row.requests_count ??
    row.request_count ??
    row.requestsCount ??
    row.count ??
    row.total;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function pendingRowEmployeeId(row) {
  if (!row || typeof row !== 'object') return null;
  const id = row.id ?? row.employee_id ?? row.employee?.id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const pendingRequestCountByEmployeeId = computed(() => {
  const m = new Map();
  for (const row of store.employeesWithRequests || []) {
    const id = pendingRowEmployeeId(row);
    if (id == null) continue;
    const n = pendingRowRequestsCount(row);
    m.set(id, n);
  }
  return m;
});

/** Employees with requests (API order) first, then the rest sorted by name. */
const employeesSortedForPendingSelect = computed(() => {
  const list = employeesListForPicker.value || [];
  const byId = new Map(list.map((e) => [Number(e.id), e]));
  const apiRows = [...(store.employeesWithRequests || [])].sort(
    (a, b) => pendingRowRequestsCount(b) - pendingRowRequestsCount(a),
  );
  const ordered = [];
  const seen = new Set();
  for (const row of apiRows) {
    const id = pendingRowEmployeeId(row);
    if (id == null) continue;
    const count = pendingRowRequestsCount(row);
    const baseEmp =
      byId.get(id) ||
      ({
        id,
        name: row.name,
        fingerprint: row.fingerprint,
        personal_info: null,
      });
    ordered.push({
      ...baseEmp,
      pendingQueueRequestCount: count,
    });
    seen.add(id);
  }
  const rest = list
    .filter((e) => !seen.has(Number(e.id)))
    .sort((a, b) =>
      employeePickerLabel(a).localeCompare(employeePickerLabel(b), undefined, {
        sensitivity: 'base',
      }),
    );
  return [...ordered, ...rest];
});

function pickEmployeeFingerprint(emp) {
  if (!emp) return '';
  const raw = emp.fingerprint ?? emp.personal_info?.fingerprint;
  if (raw == null || raw === '') return '';
  return String(raw).trim();
}

const filteredEmployeesSortedForPendingSelect = computed(() => {
  const list = employeesSortedForPendingSelect.value;
  const q = String(pendingEmployeeSelectSearchQuery.value ?? '')
    .toLowerCase()
    .trim();
  if (!q) return list;
  return list.filter((emp) => {
    const label = pendingEmployeeBaseLabel(emp).toLowerCase();
    const name = employeePickerLabel(emp).toLowerCase();
    const fp = pickEmployeeFingerprint(emp).toLowerCase();
    const id = String(emp.id ?? '');
    return (
      label.includes(q) ||
      name.includes(q) ||
      fp.includes(q) ||
      id.includes(q)
    );
  });
});

const selectedPendingEmployee = computed(() => {
  const id = String(pendingFilterEmployeeId.value ?? '').trim();
  if (!id) return null;
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return employeesSortedForPendingSelect.value.find((e) => Number(e.id) === n) ?? null;
});

function pendingEmployeeBaseLabel(emp) {
  if (!emp) return '';
  return `${employeePickerLabel(emp)} (#${emp.id})`;
}

function pendingEmployeeCountForBadge(emp) {
  if (!emp) return 0;
  return (
    emp.pendingQueueRequestCount ??
    pendingRequestCountByEmployeeId.value.get(Number(emp.id)) ??
    0
  );
}

function togglePendingEmployeePicker() {
  pendingEmployeePickerOpen.value = !pendingEmployeePickerOpen.value;
  if (pendingEmployeePickerOpen.value) {
    pendingEmployeeSelectSearchQuery.value = '';
    nextTick(() => {
      pendingEmployeeSelectSearchInputRef.value?.focus();
    });
  }
}

function selectPendingFilterEmployee(id) {
  pendingFilterEmployeeId.value = id;
  pendingEmployeeSelectSearchQuery.value = '';
  pendingEmployeePickerOpen.value = false;
}

function closePendingEmployeePickerOnDocClick(e) {
  const root = pendingEmployeePickerRoot.value;
  if (pendingEmployeePickerOpen.value && root && !root.contains(e.target)) {
    pendingEmployeePickerOpen.value = false;
  }
}

const pendingEmployeeCountsHint = computed(() => {
  const rows = store.employeesWithRequests || [];
  if (!rows.length) return '';
  const total = rows.reduce((s, r) => s + pendingRowRequestsCount(r), 0);
  if (total <= 0) return '';
  return `${rows.length} employee(s) with matching requests (${total} total in this period).`;
});

/** Same visibility as pending toggle: bulk checkboxes + button only in pending list view. */
const showBulkSelectionColumn = computed(
  () => canAccessPendingQueue.value && pendingQueueMode.value,
);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const profileError = ref(false);

const showConfirmApprove = ref(false);
const showConfirmBulkApprove = ref(false);
const showConfirmBulkReject = ref(false);
const showConfirmReject = ref(false);
const targetId = ref(null);
const rejectionNote = ref('');
/** Pending-queue bulk selection (numeric ids). */
const selectedRequestIds = ref([]);
const selectAllCheckboxRef = ref(null);

const emptyMessage = computed(() => {
  const hasRows = requests.value.length > 0;
  if (normalizedSearchQuery.value && hasRows && filteredRequests.value.length === 0) {
    return 'No requests match your search.';
  }
  if (canAccessPendingQueue.value && pendingQueueMode.value) {
    return 'No requests for the selected filters.';
  }
  if (!pendingQueueMode.value) {
    return 'No requests for the selected period or filters.';
  }
  return 'You have no requests yet.';
});

const form = ref({
  request_type: 'leave',
  day: '',
  duration_minutes: null,
  from_time: '',
  to_time: '',
  day_replacement: '',
  duration_type: 'full',
  status: 'pending',
});
const initialFormValues = ref(null);

/** Matches AttendanceRequestModal: From/To only for types that need a time range (e.g. shift_move). */
function requestModalUsesFromToTime(rawType) {
  const t = normalizeRequestTypeSlug(rawType);
  if (!t || t === 'absence') return false;
  if (isServerCalculatedOvertime(t)) return false;
  if (['lateness', 'leave', 'vacation', 'day_off_swap', 'work_from_home', 'double_paid'].includes(t)) return false;
  return true;
}

const showFromToFields = computed(() => requestModalUsesFromToTime(form.value.request_type));

/** Pencil: pending + `update-employee-request`; approved/rejected + `approve-employee-request`. */
function canShowRequestEditPencil(item) {
  const st = item?.status;
  if (st === 'pending') {
    return authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST);
  }
  if (st === 'approved' || st === 'rejected') {
    return authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST);
  }
  return false;
}

/** Employee the lateness/leave row belongs to (self, other, or edited row). */
function resolveEmployeeIdForLatenessLeavePayload() {
  if (isEditing.value && editingId.value != null) {
    const idNum = normalizeRequestId(editingId.value);
    const row = requests.value.find((r) => normalizeRequestId(r.id) === idNum);
    const eid = row?.employee_id ?? row?.employee?.id;
    const n = Number(eid);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (createRequestTarget.value === 'other') {
    return normalizeRequestId(forOtherEmployeeId.value);
  }
  const p = authStore.payrollEmployeeId;
  if (p != null && String(p).trim() !== '') {
    const n = Number(String(p).trim());
    if (Number.isFinite(n) && n > 0) return n;
  }
  const u = authStore.user;
  if (u && typeof u === 'object') {
    const empId = Number(
      String(u.employee?.id ?? u.Employee?.id ?? '').trim(),
    );
    if (Number.isFinite(empId) && empId > 0) return empId;
  }
  return null;
}

function requestRowEmployeeIdForDisplay(item) {
  const raw = item?.employee?.id ?? item?.employee_id;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Pending queue: infer from row + contracts API when permitted.
 * `/me`: fall back to `GET /api/user` embedded contracts (no `view-contract`).
 */
function resolveContractTypeSlugForRequestItem(item) {
  const fromRow = contractTypeSlugFromEmployeeRequestRow(item);
  if (fromRow) return fromRow;
  if (!pendingQueueMode.value) {
    const linked = contractTypeSlugFromLoggedInPayrollAuthUser(authStore.user);
    if (linked) return linked;
  }
  if (authStore.can(HR_PERMISSION.VIEW_CONTRACT)) {
    const eid = requestRowEmployeeIdForDisplay(item);
    if (eid != null) return activeContractTypeForEmployee(contractStore.contracts, eid);
  }
  return '';
}

const resolveContractTypeSlugForModalSubject = computed(() => {
  if (isEditing.value && editingId.value != null) {
    const idNum = normalizeRequestId(editingId.value);
    const row = requests.value.find((r) => normalizeRequestId(r.id) === idNum);
    if (row) return resolveContractTypeSlugForRequestItem(row);
  }
  if (createRequestTarget.value === 'other') {
    const oeid = normalizeRequestId(forOtherEmployeeId.value);
    if (
      oeid != null &&
      authStore.can(HR_PERMISSION.VIEW_CONTRACT)
    ) {
      return activeContractTypeForEmployee(contractStore.contracts, oeid);
    }
    return '';
  }
  return contractTypeSlugFromLoggedInPayrollAuthUser(authStore.user);
});

/** Edit modal opened by approver without update permission — only status should change. */
const editingIsApproverOnly = computed(
  () =>
    isEditing.value &&
    authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) &&
    !authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST),
);

/** Grace for ≤15m still applies for self and when editing; create-for-others can file lateness for another employee inside grace. Not for `old` payroll contracts. */
const shouldEnforceLatenessGraceInModal = computed(() => {
  if (
    contractExemptsNewLatenessAttendanceRules(
      resolveContractTypeSlugForModalSubject.value,
    )
  ) {
    return false;
  }
  if (isEditing.value) return true;
  if (
    createRequestTarget.value === 'other' &&
    authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS)
  ) {
    return false;
  }
  return true;
});

const latenessSaveBlocked = computed(() => {
  if (!shouldEnforceLatenessGraceInModal.value) return false;
  if (form.value.request_type !== 'lateness') return false;
  const m = Number(form.value.duration_minutes);
  if (!Number.isFinite(m) || m <= 0) return false;
  return m <= LATENESS_GRACE_MINUTES;
});

function formatRequestTypeLabel(type) {
  const t = normalizeRequestTypeSlug(type);
  if (!t) return '—';
  return REQUEST_TYPE_LABELS[t] ?? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(item) {
  const t = item.request_type;
  if (t === 'overtime_before' || t === 'overtime_after') {
    return '—';
  }
  if (t === 'overtime') {
    return '—';
  }
  if (t === 'double_paid') {
    return '—';
  }
  if ((t === 'vacation' || t === 'work_from_home') && item.duration_type) {
    return item.duration_type === 'full' ? 'Full day' : 'Half day';
  }
  if (['lateness', 'leave'].includes(t)) {
    const contractType = resolveContractTypeSlugForRequestItem(item);
    if (contractType === 'old') {
      const mins = parsedDurationMinutesFromRequestRow(item);
      if (mins != null) return `${mins} min`;
      if (item.duration_hours != null && item.duration_hours !== '') {
        const stored = Number(item.duration_hours);
        if (!Number.isNaN(stored) && stored > 0) return `${stored} min`;
      }
      return '—';
    }
    if (item.duration_hours != null && item.duration_hours !== '') {
      const h = Number(item.duration_hours);
      if (!Number.isNaN(h)) return `${h}h`;
    }
    return '—';
  }
  if (t === 'day_off_swap' && item.day_replacement) {
    return `Swap → ${formatDate(item.day_replacement)}`;
  }
  if (item.from_time && item.to_time) {
    return `${item.from_time} – ${item.to_time}`;
  }
  if (item.from_time || item.to_time) {
    return String(item.from_time || item.to_time);
  }
  return '—';
}

function isPaidYes(item) {
  const v = item.is_paid;
  return v === 1 || v === true || v === '1';
}

function employeeDisplayName(item) {
  const n = item.employee?.name;
  const name = n == null || String(n).trim() === '' ? '—' : String(n).trim();
  const fp = item.employee?.fingerprint;
  if (fp == null || fp === '') return name;
  const fpStr = String(fp).trim();
  if (!fpStr) return name;
  return `${name} (${fpStr})`;
}

function actionByDisplay(item) {
  const n = item.action_by?.name;
  if (n == null || String(n).trim() === '') return '—';
  return String(n).trim();
}

function statusLabel(status) {
  const map = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return map[status] ?? (status ? String(status).replace(/_/g, ' ') : '—');
}

const headers = computed(() => {
  const baseHeaders = [];

  if (showBulkSelectionColumn.value) {
    baseHeaders.push({
      label: '',
      key: 'select',
      class: `${CELL_CENTER} w-12`,
    });
  }

  baseHeaders.push(
    { label: 'Employee', key: 'employee', class: CELL_CENTER_WIDE },
    { label: 'Type', key: 'request_type', class: CELL_CENTER },
    { label: 'Date', key: 'day', class: CELL_CENTER },
    { label: 'Duration', key: 'duration', class: CELL_CENTER },
    { label: 'OT (min)', key: 'overtime_minutes', class: CELL_CENTER },
    { label: 'Paid', key: 'is_paid', class: CELL_CENTER },
    { label: 'Submitted', key: 'created_at', class: CELL_CENTER },
    { label: 'Reviewed by', key: 'action_by', class: CELL_CENTER_WIDE },
    { label: 'Status', key: 'status', class: CELL_CENTER },
  );

  if (
    (canShowRequestActionsColumn.value || canUpdateEmployeeRequest.value) &&
    (pendingQueueMode.value || requests.value.some((r) => r.status === 'pending'))
  ) {
    baseHeaders.push({ label: 'Actions', key: 'actions', class: `${CELL_CENTER} min-w-[8rem]` });
  }

  return baseHeaders;
});

const bulkApproveConfirmText = computed(() => {
  const n = selectedRequestIds.value.length;
  if (n === 0) return 'No requests selected.';
  return `Approve ${n} selected request${n === 1 ? '' : 's'}?`;
});

const bulkRejectConfirmText = computed(() => {
  const n = selectedRequestIds.value.length;
  if (n === 0) return 'No requests selected.';
  return `Reject ${n} selected request${n === 1 ? '' : 's'}?`;
});

function clearBulkSelection() {
  selectedRequestIds.value = [];
}

function normalizeRequestId(raw) {
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function isBulkSelected(rawId) {
  const id = normalizeRequestId(rawId);
  if (id == null) return false;
  return selectedRequestIds.value.includes(id);
}

function toggleBulkSelect(rawId) {
  if (
    !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) &&
    !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)
  ) return;
  const id = normalizeRequestId(rawId);
  if (id == null) return;
  const idx = selectedRequestIds.value.indexOf(id);
  if (idx >= 0) selectedRequestIds.value.splice(idx, 1);
  else selectedRequestIds.value.push(id);
}

/** Pending rows in the current list (bulk targets). */
const pendingSelectableIds = computed(() => {
  const out = [];
  for (const r of filteredRequests.value) {
    if (r.status !== 'pending') continue;
    const id = normalizeRequestId(r.id);
    if (id != null) out.push(id);
  }
  return out;
});

const allPendingSelected = computed(() => {
  const ids = pendingSelectableIds.value;
  if (!ids.length) return false;
  return ids.every((id) => selectedRequestIds.value.includes(id));
});

const somePendingSelected = computed(() => {
  const ids = pendingSelectableIds.value;
  if (!ids.length) return false;
  const n = ids.filter((id) => selectedRequestIds.value.includes(id)).length;
  return n > 0 && n < ids.length;
});

function toggleSelectAllPending() {
  if (
    !authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST) &&
    !authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)
  ) return;
  const ids = pendingSelectableIds.value;
  if (!ids.length) return;
  if (allPendingSelected.value) {
    const remove = new Set(ids);
    selectedRequestIds.value = selectedRequestIds.value.filter((id) => !remove.has(id));
  } else {
    selectedRequestIds.value = [...new Set([...selectedRequestIds.value, ...ids])];
  }
}

async function syncSelectAllIndeterminate() {
  await nextTick();
  const el = selectAllCheckboxRef.value;
  if (el && 'indeterminate' in el) {
    el.indeterminate = somePendingSelected.value;
  }
}

watch([somePendingSelected, allPendingSelected, pendingSelectableIds], syncSelectAllIndeterminate, {
  flush: 'post',
});

const fetchData = async () => {
  clearBulkSelection();
  profileError.value = false;
  try {
    if (canAccessPendingQueue.value && pendingQueueMode.value) {
      store.setListSource("pending");
      await store.getPendingRequests(buildPendingFiltersPayload());
    } else {
      store.setListSource("me");
      await store.getMyRequests(buildMyRequestsFiltersPayload());
    }
  } catch (e) {
    if (e.response?.status === 404 && e.response?.data?.message?.includes('profile')) {
      profileError.value = true;
    }
  }
};

const refreshingList = ref(false);
const switchingQueueMode = ref(false);

const togglePendingQueueMode = async () => {
  if (switchingQueueMode.value || store.loading) return;
  switchingQueueMode.value = true;
  pendingQueueMode.value = !pendingQueueMode.value;
  try {
    if (
      pendingQueueMode.value &&
      canAccessPendingQueue.value &&
      employeesListForPicker.value.length === 0
    ) {
      await empStore.getEmployees();
    }
    await fetchData();
  } finally {
    switchingQueueMode.value = false;
  }
};

const handleManualRefresh = async () => {
  if (refreshingList.value || store.loading) return;
  refreshingList.value = true;
  try {
    await fetchData();
  } finally {
    refreshingList.value = false;
  }
};

onMounted(() => {
  const extras = [];
  if (authStore.can(HR_PERMISSION.VIEW_CONTRACT)) {
    extras.push(contractStore.getContracts().catch(() => { }));
  }
  void Promise.all([fetchData(), ...extras]);
  document.addEventListener('click', closePendingEmployeePickerOnDocClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closePendingEmployeePickerOnDocClick);
});

watch(canAccessPendingQueue, (ok) => {
  if (!ok && pendingQueueMode.value) {
    pendingQueueMode.value = false;
    fetchData();
  }
});

watch(pendingQueueMode, (active) => {
  if (!active) pendingEmployeePickerOpen.value = false;
  if (active && canAccessPendingQueue.value && employeesListForPicker.value.length === 0) {
    void empStore.getEmployees();
  }
});

/** Reload table (and pending counts) whenever my-requests filters change. */
watch(
  [myFilterMonth, myFilterStatus],
  () => {
    if (pendingQueueMode.value) return;
    void fetchData();
  },
  { flush: 'post' },
);

/** Reload whenever pending-queue filters change (`getPendingRequests` also refreshes employees-with-requests). */
watch(
  [pendingFilterMonth, pendingFilterStatus, pendingFilterEmployeeId],
  () => {
    if (!pendingQueueMode.value || !canAccessPendingQueue.value) return;
    void fetchData();
  },
  { flush: 'post' },
);

watch(requests, (list) => {
  const valid = new Set(
    list.map((r) => normalizeRequestId(r.id)).filter((id) => id != null),
  );
  selectedRequestIds.value = selectedRequestIds.value.filter((id) => valid.has(id));
});

watch(
  () => form.value.request_type,
  (t) => {
    if (t === 'absence') {
      form.value.from_time = '';
      form.value.to_time = '';
    }
    if (isServerCalculatedOvertime(t)) {
      form.value.from_time = '';
      form.value.to_time = '';
    }
    if (
      ['lateness', 'leave', 'vacation', 'day_off_swap', 'work_from_home', 'double_paid'].includes(t)
    ) {
      form.value.from_time = '';
      form.value.to_time = '';
    }
  },
);

function toDateInputValue(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function closeRequestModal() {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
  createRequestTarget.value = 'self';
  forOtherEmployeeId.value = '';
}

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  forOtherEmployeeId.value = '';
  if (canCreateEmployeeRequest.value) {
    createRequestTarget.value = 'self';
  } else if (canCreateRequestForOthers.value) {
    createRequestTarget.value = 'other';
    void ensureEmployeesForPicker();
  } else {
    createRequestTarget.value = 'self';
  }
  form.value = {
    request_type: 'leave',
    day: '',
    duration_minutes: null,
    from_time: '',
    to_time: '',
    day_replacement: '',
    duration_type: 'full',
    status: 'pending',
  };
  initialFormValues.value = null;
  showModal.value = true;
};

const openEditModal = (item) => {
  const st = item?.status;
  const canUpdate = authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST);
  const canApprove = authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST);
  if (st === 'pending') {
    if (!canUpdate) return;
  } else if (st === 'approved' || st === 'rejected') {
    if (!canApprove) return;
  } else {
    return;
  }
  const id = normalizeRequestId(item.id);
  if (id == null) return;
  isEditing.value = true;
  editingId.value = id;
  const dh =
    item.duration_hours != null && item.duration_hours !== ''
      ? Number(item.duration_hours)
      : null;
  const apiMins = parsedDurationMinutesFromRequestRow(item);
  const rowContract = resolveContractTypeSlugForRequestItem(item);
  let durationMinutesForForm = null;
  if (apiMins != null) {
    durationMinutesForForm = apiMins;
  } else if (dh != null && Number.isFinite(dh) && dh > 0) {
    durationMinutesForForm =
      rowContract === 'old' ? Math.round(dh) : Math.round(dh * 60);
  }
  const rawStatus = String(item.status ?? 'pending').toLowerCase();
  const statusNorm =
    rawStatus === 'approved' || rawStatus === 'rejected' || rawStatus === 'pending'
      ? rawStatus
      : 'pending';
  form.value = {
    request_type: item.request_type || 'leave',
    day: toDateInputValue(item.day),
    duration_minutes: durationMinutesForForm,
    from_time: item.from_time ? normalizeApiTime(item.from_time) || '' : '',
    to_time: item.to_time ? normalizeApiTime(item.to_time) || '' : '',
    day_replacement: toDateInputValue(item.day_replacement),
    duration_type: item.duration_type === 'half' ? 'half' : 'full',
    status: statusNorm,
  };
  initialFormValues.value = { ...form.value };
  showModal.value = true;
};

/** When creating for another employee, require `employee_id` on the payload. */
function attachEmployeeIdIfCreatingForOther(payload) {
  if (isEditing.value) return payload;
  if (createRequestTarget.value !== 'other') return payload;
  if (!authStore.can(HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS)) return payload;
  const eid = normalizeRequestId(forOtherEmployeeId.value);
  if (eid == null) {
    notyf.error('Please select an employee.');
    return null;
  }
  return { ...payload, employee_id: eid };
}

/** On PUT edit, include request status when approver changes it in the modal. */
function attachEditStatusToPayload(payload) {
  if (!payload) return null;
  if (
    isEditing.value &&
    authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)
  ) {
    const s = String(form.value.status ?? '').trim().toLowerCase();
    if (s === 'pending' || s === 'approved' || s === 'rejected') {
      return { ...payload, status: s };
    }
  }
  return payload;
}

function finalizeRequestPayload(payload) {
  const withEmployee = attachEmployeeIdIfCreatingForOther(payload);
  if (!withEmployee) return null;
  return attachEditStatusToPayload(withEmployee);
}

/**
 * Same shape as POST create — used for both create and PUT update.
 * @returns {object|null}
 */
function buildRequestPayloadFromForm() {
  if (!form.value.day) {
    notyf.error('Please select a date');
    return null;
  }

  const otRt = normalizeRequestTypeSlug(form.value.request_type);
  if (isServerCalculatedOvertime(otRt)) {
    const payload = {
      request_type: otRt,
      day: form.value.day,
    };
    const finalPayload = finalizeRequestPayload(payload);
    if (!finalPayload) return null;

    if (isEditing.value && initialFormValues.value) {
      const dirty = {};
      const init = initialFormValues.value;
      if (form.value.request_type !== init.request_type) {
        dirty.request_type = form.value.request_type;
      }
      if (form.value.day !== init.day) {
        dirty.day = form.value.day;
      }
      if (finalPayload.status !== undefined && finalPayload.status !== init.status) {
        dirty.status = finalPayload.status;
      }
      return dirty;
    }
    return finalPayload;
  }

  if (form.value.request_type === 'absence') {
    const payload = {
      request_type: 'absence',
      day: form.value.day,
    };
    const finalPayload = finalizeRequestPayload(payload);
    if (!finalPayload) return null;

    if (isEditing.value && initialFormValues.value) {
      const dirty = {};
      const init = initialFormValues.value;
      if (form.value.request_type !== init.request_type) {
        dirty.request_type = form.value.request_type;
      }
      if (form.value.day !== init.day) {
        dirty.day = form.value.day;
      }
      if (finalPayload.status !== undefined && finalPayload.status !== init.status) {
        dirty.status = finalPayload.status;
      }
      return dirty;
    }
    return finalPayload;
  }

  const usesFromTo = requestModalUsesFromToTime(form.value.request_type);
  let normalizedFromTime = '';
  let normalizedToTime = '';
  if (usesFromTo) {
    normalizedFromTime = normalizeApiTime(form.value.from_time);
    normalizedToTime = normalizeApiTime(form.value.to_time);
    if (form.value.from_time && !normalizedFromTime) {
      notyf.error('From time format is invalid.');
      return null;
    }
    if (form.value.to_time && !normalizedToTime) {
      notyf.error('To time format is invalid.');
      return null;
    }
  }

  const payload = {
    request_type: form.value.request_type,
    day: form.value.day,
    from_time: usesFromTo ? normalizedFromTime : '',
    to_time: usesFromTo ? normalizedToTime : '',
  };

  if (['lateness', 'leave'].includes(form.value.request_type)) {
    const mins = Number(form.value.duration_minutes);
    if (!Number.isFinite(mins) || mins <= 0) {
      notyf.error('Duration (minutes) is required for this request type');
      return null;
    }
    if (form.value.request_type === 'lateness') {
      if (
        shouldEnforceLatenessGraceInModal.value &&
        mins > 0 &&
        mins <= LATENESS_GRACE_MINUTES
      ) {
        notyf.error(
          `Lateness of ${LATENESS_GRACE_MINUTES} minutes or less is covered by the grace period. A request is not allowed.`,
        );
        return null;
      }
    }
    const contractType = resolveContractTypeSlugForModalSubject.value;
    const durFields = latenessLeaveDurationApiFieldsFromMinutes(mins, contractType);
    if (!durFields) {
      notyf.error('Duration (minutes) is required for this request type');
      return null;
    }
    Object.assign(payload, durFields);
  }

  if (form.value.request_type === 'day_off_swap') {
    if (!form.value.day_replacement) {
      notyf.error('Replacement date is required for day off swap');
      return null;
    }
    payload.day_replacement = form.value.day_replacement;
  }

  if (form.value.request_type === 'vacation') {
    payload.duration_type = form.value.duration_type;
  }

  const finalPayload = finalizeRequestPayload(payload);
  if (!finalPayload) return null;

  if (isEditing.value && initialFormValues.value) {
    const dirty = {};
    const init = initialFormValues.value;

    if (form.value.request_type !== init.request_type) {
      dirty.request_type = form.value.request_type;
    }
    if (form.value.day !== init.day) {
      dirty.day = form.value.day;
    }
    if (form.value.from_time !== init.from_time) {
      dirty.from_time = finalPayload.from_time;
    }
    if (form.value.to_time !== init.to_time) {
      dirty.to_time = finalPayload.to_time;
    }
    if (form.value.duration_minutes !== init.duration_minutes) {
      if (finalPayload.duration_hours !== undefined) {
        dirty.duration_hours = finalPayload.duration_hours;
      }
      if (finalPayload.duration_minutes !== undefined) {
        dirty.duration_minutes = finalPayload.duration_minutes;
      }
    }
    if (form.value.day_replacement !== init.day_replacement) {
      dirty.day_replacement = finalPayload.day_replacement;
    }
    if (form.value.duration_type !== init.duration_type) {
      dirty.duration_type = finalPayload.duration_type;
    }
    if (finalPayload.status !== undefined && finalPayload.status !== init.status) {
      dirty.status = finalPayload.status;
    }

    return dirty;
  }

  return finalPayload;
}

const handleSubmit = async () => {
  if (isEditing.value) {
    if (editingId.value == null) return;
    const canUpd = authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_REQUEST);
    const canAppr = authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST);
    if (!canUpd && !canAppr) return;
  } else {
    if (createRequestTarget.value === 'self') {
      if (!canCreateEmployeeRequest.value) return;
    } else {
      if (!canCreateRequestForOthers.value) return;
    }
  }

  if (latenessSaveBlocked.value) return;

  const payload = buildRequestPayloadFromForm();
  if (!payload) return;

  try {
    if (isEditing.value) {
      await store.updateRequest(editingId.value, payload);
    } else {
      await store.createRequest(payload);
      await fetchData();
    }
    closeRequestModal();
  } catch (e) {
    console.error('Submission failed:', e);
  }
};

const confirmApprove = (id) => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  targetId.value = id;
  showConfirmApprove.value = true;
};

const handleApprove = async () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) {
    showConfirmApprove.value = false;
    return;
  }
  try {
    await store.approveRequest(targetId.value);
    const tid = normalizeRequestId(targetId.value);
    if (tid != null) {
      const i = selectedRequestIds.value.indexOf(tid);
      if (i >= 0) selectedRequestIds.value.splice(i, 1);
    }
  } catch (e) {
    console.error("Approval failed:", e);
  } finally {
    showConfirmApprove.value = false;
  }
};

const confirmBulkApprove = () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) return;
  if (selectedRequestIds.value.length === 0) return;
  showConfirmBulkApprove.value = true;
};

const handleBulkApprove = async () => {
  if (!authStore.can(HR_PERMISSION.APPROVE_EMPLOYEE_REQUEST)) {
    showConfirmBulkApprove.value = false;
    return;
  }
  if (selectedRequestIds.value.length === 0) {
    showConfirmBulkApprove.value = false;
    return;
  }
  try {
    await store.bulkApproveRequests([...selectedRequestIds.value]);
    clearBulkSelection();
  } catch (e) {
    console.error("Bulk approval failed:", e);
  } finally {
    showConfirmBulkApprove.value = false;
  }
};

const confirmBulkReject = () => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) return;
  if (selectedRequestIds.value.length === 0) return;
  showConfirmBulkReject.value = true;
};

const handleBulkReject = async () => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) {
    showConfirmBulkReject.value = false;
    return;
  }
  if (selectedRequestIds.value.length === 0) {
    showConfirmBulkReject.value = false;
    return;
  }
  try {
    await store.bulkRejectRequests([...selectedRequestIds.value]);
    clearBulkSelection();
  } catch (e) {
    console.error("Bulk rejection failed:", e);
  } finally {
    showConfirmBulkReject.value = false;
  }
};

const confirmReject = (id) => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) return;
  targetId.value = id;
  rejectionNote.value = '';
  showConfirmReject.value = true;
};

const handleReject = async () => {
  if (!authStore.can(HR_PERMISSION.REJECT_EMPLOYEE_REQUEST)) {
    showConfirmReject.value = false;
    return;
  }
  try {
    await store.rejectRequest(targetId.value, rejectionNote.value);
    showConfirmReject.value = false;
  } catch (e) {
    console.error("Rejection failed:", e);
  }
};
</script>
