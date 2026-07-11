<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <!-- <p class="text-gray-500 mt-1">Manage employee payrolls, approvals, and payments</p> -->
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border border-indigo-200">
          <div class="flex flex-col px-2 min-w-[200px] flex-1 sm:flex-none sm:min-w-[220px] max-w-md">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="payrollSearchQuery"
              type="search"
              autocomplete="off"
              placeholder="Employee name or fingerprint..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div class="w-px h-8 bg-gray-200 hidden sm:block"></div>
          <div class="flex flex-col px-2 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
            <div class="relative">
              <input
                v-model="filterPayrollMonth"
                type="month"
                class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                @change="applyFilterMonth"
              />
              <LucideCalendar class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p v-if="filterPayrollMonth" class="text-xs text-gray-400 mt-1">
              Period: {{ getPayrollDates(filterPayrollMonth).from_date }} → {{ getPayrollDates(filterPayrollMonth).to_date }}
            </p>
          </div>
          <div class="w-px h-8 bg-gray-200"></div>
          <div class="flex flex-col px-2 min-w-[120px]">
            <label class="text-[10px] uppercase font-bold text-gray-400">Status</label>
            <select v-model="filterForm.status" class="bg-transparent border-none text-sm font-medium focus:ring-0 focus:outline-none p-0 h-5" @change="fetchPayrolls">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="hr-approved">HR Approved</option>
              <option value="hr-manager-approved">HR Manager Approved</option>
              <option value="gm-approved">GM Approved</option>
              <option value="suspended">Suspended</option>
              <option value="paid">Paid</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="w-px h-8 bg-gray-200"></div>
          <div class="flex items-center gap-2 px-2">
            <input v-model="filterForm.include_missing" type="checkbox" id="include_missing" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" @change="fetchPayrolls" />
            <label for="include_missing" class="text-xs font-medium text-gray-700 cursor-pointer whitespace-nowrap">Missing Payrolls</label>
          </div>
          <button
            @click="fetchPayrolls"
            class="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-600 bg-indigo-50 cursor-pointer"
            title="Apply Filters"
          >
            <LucideRefreshCw class="w-4 h-4" :class="{'animate-spin': store.loading}" />
          </button>
        </div>

        <div class="flex flex-col items-stretch gap-2 min-w-[180px]">
          <!-- <button
            type="button"
            @click="handleExportExcel"
            :disabled="store.loading || !filteredActionablePayrolls.length"
            class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer w-full"
            title="Export filtered table data to Excel"
          >
            <LucideDownload class="w-4 h-4" /> Export Excel
          </button> -->

          <button
            v-if="authStore.can(HR_PERMISSION.CALCULATE_PAYROLL)"
            @click="openCalcModal"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer w-full"
          >
            <LucideCalculator class="w-4 h-4" /> Calculate Payroll
          </button>
        </div>

        <!-- <div v-if="authStore.can(HR_PERMISSION.VIEW_PAYROLL) " class="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-center min-w-[180px] shrink-0">
          <p class="text-[10px] uppercase font-bold text-indigo-600 tracking-wide">Total Net Salary</p>
          <p class="text-2xl font-bold text-indigo-900 tabular-nums leading-tight">
            {{ formatMoney(filteredNetSalaryTotal) }}
          </p>
          <p class="text-[11px] text-indigo-500 mt-0.5">
            {{ filteredActionablePayrolls.length }} row{{ filteredActionablePayrolls.length === 1 ? '' : 's' }} shown
          </p>
        </div> -->
      </div>
    </div>

    <!-- Payrolls Table -->
    <PayrollsTable 
      :items="filteredActionablePayrolls" 
      :loading="store.loading" 
      :fetchingId="fetchingId"
      :manual-adjustment-net-by-employee="manualAdjustmentNetByEmployee"
      :filter-period-from="filterForm.period_from"
      :filter-period-to="filterForm.period_to"
      @view="showDetails"
      @update-status="handleUpdateStatus"
      @bulk-approve="handleBulkApprove"
    />

    <!-- Calculate Payroll Modal -->
    <HrModal
      :show="showCalcModal"
      title="Calculate Payroll"
      :loading="store.loading"
      bodyOverflowVisible
      @close="showCalcModal = false"
      @save="handleCalculate"
    >
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <div ref="employeePickerRoot" class="relative">
            <button
              type="button"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-left focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer flex justify-between items-center h-10"
              @click.stop="toggleEmployeePicker"
            >
              <span class="truncate text-gray-800">
                {{ selectedEmployeeLabel }}
              </span>
              <LucideChevronDown class="w-4 h-4 shrink-0 text-gray-500 transition-transform" :class="{ 'rotate-180': employeePickerOpen }" />
            </button>
            
            <div
              v-show="employeePickerOpen"
              class="absolute left-0 right-0 bottom-full z-50 mb-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              role="listbox"
              @mousedown.prevent
            >
              <div class="px-2 pb-1.5 pt-1 border-b border-gray-100">
                <input
                  ref="employeeSearchInputRef"
                  v-model="employeeSearchQuery"
                  type="search"
                  autocomplete="off"
                  placeholder="Search name..."
                  class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  @keydown.escape.prevent="employeePickerOpen = false"
                />
              </div>
              <div class="max-h-56 overflow-y-auto">
                <button
                  type="button"
                  role="option"
                  class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-indigo-50 text-indigo-900': !calcForm.employee_id }"
                  @click="selectEmployee('')"
                >
                  <span>Select Employee</span>
                </button>
                <button
                  v-for="emp in filteredEmployeesForPicker"
                  :key="emp.id"
                  type="button"
                  role="option"
                  class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-indigo-50 text-indigo-900': calcForm.employee_id === emp.id }"
                  @click="selectEmployee(emp.id)"
                >
                  <span class="truncate text-gray-800 font-medium">{{ emp.name }}</span>
                  <span v-if="emp.contractType" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-55 text-indigo-800 capitalize shrink-0">
                    {{ emp.contractType }}
                  </span>
                </button>
                <p v-if="filteredEmployeesForPicker.length === 0" class="px-3 py-2 text-xs text-gray-400">
                  No employees match.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isSelectedEmployeeHourly" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input v-model="calcForm.from_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input v-model="calcForm.to_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
          <input v-model="calcForm.payroll_month" type="month" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <p v-if="calcForm.payroll_month" class="text-xs text-gray-400 mt-1">
            Period: {{ getPayrollDates(calcForm.payroll_month).from_date }} → {{ getPayrollDates(calcForm.payroll_month).to_date }}
          </p>
        </div>
        <div v-if="isSelectedEmployeeHourly">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Worked Hours <span class="text-red-500">*</span>
            <span v-if="autoCalculatingHours" class="text-xs text-indigo-500 ml-2 animate-pulse">
              (Calculating from attendance logs...)
            </span>
          </label>
          <input
            v-model.number="calcForm.worked_hours"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 80"
            :disabled="autoCalculatingHours"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50"
          />
        </div>
      </div>
    </HrModal>

    <!-- Details Modal -->
    <HrModal
      :show="showDetailsModal"
      title="Payroll Details"
      :loading="store.loading"
      maxWidthClass="max-w-4xl"
      @close="showDetailsModal = false"
      cancelLabel="Close"
      :hasSave="false"
    >
      <div v-if="selectedPayroll" class="space-y-5">

        <!-- Employee Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p class="text-xs font-bold text-orange-600 uppercase mb-0.5">Employee Name</p>
            <p class="text-base font-semibold text-gray-800">{{ getEmployeeName(selectedPayroll) }}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p class="text-xs font-bold text-indigo-600 uppercase mb-0.5">E-Mail</p>
            <p class="text-base font-medium text-gray-800">{{ selectedPayroll.employee?.email ?? selectedPayroll.employee?.personal_info?.email ?? '-' }}</p>
          </div>
        </div>

        <!-- Period + Status -->
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-400 uppercase font-bold">Payroll Period</p>
            <p class="text-base font-bold text-gray-800">{{ selectedPayroll.period?.payroll_month || selectedPayroll.period?.from || selectedPayroll.period?.to }}</p>
          </div>
          <PayrollStatusBadge :status="selectedPayroll.current_status || selectedPayroll.status" />
        </div>

        <PayrollContractAnnex :contract="selectedPayroll.contract" />

        <!-- Salary Summary -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 text-center">
            <p class="text-xs font-bold text-gray-600 uppercase mb-1">Fixed Salary Paid</p>
            <p class="text-xl font-bold text-gray-800">{{ selectedPayroll.financials?.fixed_salary_paid ?? '-' }}</p>
          </div>
          <div class="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 text-center">
            <p class="text-xs font-bold text-amber-600 uppercase mb-1">Net Salary Due</p>
            <p class="text-xl font-bold text-indigo-700">{{ formatMoney(finalNetSalaryDue) }}</p>
            <p class="text-[11px] text-indigo-500 mt-1">
              Base {{ formatMoney(baseNetSalaryDue) }} + Manual {{ formatMoney(adjustmentTotals.net) }}
            </p>
          </div>
        </div>

        <!-- Salary Details (Boxes) -->
        <PayrollSalaryDetails
          :deduction-details="selectedPayroll.deduction_details ?? selectedPayroll.financials?.deductions?.details"
          :additions-details="selectedPayroll.additions_details ?? selectedPayroll.financials?.additions?.details"
          :deductions-total="selectedPayroll.financials?.deductions"
          :additions-total="selectedPayroll.financials?.additions"
        />

        <!-- Employee Adjustments -->
        <div class="space-y-3">
          <div class="bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg text-center">
            Employee Adjustments
          </div>
          <div v-if="adjustmentsLoading" class="text-sm text-gray-500 text-center py-3">
            Loading adjustments...
          </div>
          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
                <p class="text-xs font-bold text-green-600 uppercase mb-1">Total Bonus</p>
                <p class="text-xl font-bold text-green-800">{{ formatMoney(adjustmentTotals.bonus) }}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-4 border-2 border-red-200 text-center">
                <p class="text-xs font-bold text-red-600 uppercase mb-1">Total Deductions</p>
                <p class="text-xl font-bold text-red-800">{{ formatMoney(adjustmentTotals.deductions) }}</p>
              </div>
              <div class="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200 text-center">
                <p class="text-xs font-bold text-indigo-600 uppercase mb-1">Net Manual Adjustment</p>
                <p class="text-xl font-bold text-indigo-800">{{ formatMoney(adjustmentTotals.net) }}</p>
              </div>
            </div>

            <div v-if="selectedAdjustments.length" class="overflow-x-auto border border-gray-200 rounded-xl">
              <table class="w-full text-sm min-w-[760px]">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Month</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Bonus</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Deductions</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="adj in selectedAdjustments" :key="adj.id">
                    <td class="px-4 py-3 text-gray-700 align-top whitespace-nowrap min-w-[6rem]">{{ normalizeMonth(adj.month) || '-' }}</td>
                    <td class="px-4 py-3 text-green-700 font-semibold align-top whitespace-nowrap">{{ formatMoney(adj.bonus) }}</td>
                    <td class="px-4 py-3 text-red-700 font-semibold align-top whitespace-nowrap">{{ formatMoney(adj.deductions) }}</td>
                    <td class="px-4 py-3 text-gray-700 align-top leading-6">
                      <template v-if="adj.notes">
                        <template v-for="(part, i) in noteParts(adj.notes)" :key="`${adj.id}-${i}`">
                          <a
                            v-if="part.type === 'link'"
                            :href="part.value"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-indigo-600 underline break-all hover:text-indigo-700"
                          >
                            {{ part.value }}
                          </a>
                          <span v-else class="whitespace-pre-wrap break-words">{{ part.value }}</span>
                        </template>
                      </template>
                      <span v-else>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              No manual adjustments found for this payroll month.
            </div>
          </template>
        </div>

        <!-- Other Deductions (employee-deductions endpoint) -->
        <div
          v-if="selectedPayroll.other_deductions?.items?.length"
          class="space-y-3"
        >
          <div class="bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg flex items-center justify-between">
            <span>Other Deductions</span>
            <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 tabular-nums">
              {{ formatMoney(selectedPayroll.other_deductions.total) }} EGP
            </span>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded-xl">
            <table class="w-full text-sm min-w-[600px]">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Deduction Type</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Type</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Amount (EGP)</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Approved By</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(ded, index) in selectedPayroll.other_deductions.items"
                  :key="ded.id"
                  class="hover:bg-gray-50/60 transition-colors"
                >
                  <td class="px-4 py-3 text-gray-400 text-xs tabular-nums align-top"># {{ index + 1 }}</td>
                  <td class="px-4 py-3 align-top">
                    <span class="font-medium text-gray-800">{{ ded.deduction_type?.name ?? '-' }}</span>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                      :class="{
                        'bg-blue-100 text-blue-700': ded.deduction_type?.type === 'percentage',
                        'bg-emerald-100 text-emerald-700': ded.deduction_type?.type === 'fixed',
                        'bg-purple-100 text-purple-700': ded.deduction_type?.type === 'static',
                        'bg-amber-100 text-amber-700': ded.deduction_type?.type === 'daily_rate_fraction',
                        'bg-gray-100 text-gray-600': !ded.deduction_type?.type,
                      }"
                    >
                      {{ ded.deduction_type?.type ?? '-' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-red-700 font-semibold align-top whitespace-nowrap tabular-nums">
                    {{ formatMoney(ded.amount) }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 align-top whitespace-nowrap">
                    {{ ded.approved_by?.name ?? '-' }}
                  </td>
                  <td class="px-4 py-3 text-gray-500 align-top">{{ ded.notes || '-' }}</td>
                </tr>
                <!-- Total row -->
                <tr class="bg-red-50/60 border-t-2 border-red-200">
                  <td colspan="3" class="px-4 py-3 text-right text-xs font-bold text-red-600 uppercase tracking-wide">Total</td>
                  <td class="px-4 py-3 text-red-700 font-bold tabular-nums">
                    {{ formatMoney(selectedPayroll.other_deductions.total) }}
                  </td>
                  <td colspan="2" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedPayroll.notes" class="bg-blue-50 p-3 rounded-xl border border-blue-100">
          <p class="text-[10px] uppercase font-bold text-blue-400 mb-1">Notes</p>
          <p class="text-sm text-blue-800">{{ selectedPayroll.notes }}</p>
          <p class="text-[10px] text-blue-400 mt-1">Last updated by: {{ selectedPayroll.last_updated_by }}</p>
        </div>

        <!-- Status History Timeline -->
        <div v-if="selectedPayroll.statuses_history?.length">
          <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Status History</h4>
          <ul class="space-y-3">
            <li
              v-for="(entry, i) in selectedPayroll.statuses_history"
              :key="i"
              class="flex gap-3 items-start"
            >
              <div class="flex flex-col items-center">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></div>
                <div v-if="i < selectedPayroll.statuses_history.length - 1" class="w-px flex-1 bg-indigo-100 mt-1"></div>
              </div>
              <div class="flex-1 pb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <PayrollStatusBadge :status="entry.status" />
                  <span class="text-xs text-gray-400">{{ entry.action_at }}</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">
                  By <strong>{{ entry.action_by?.name }}</strong>
                  <span v-if="entry.action_by?.job_titles?.length" class="text-gray-400"> ({{ entry.action_by.job_titles.join(', ') }})</span>
                </p>
                <p v-if="entry.notes" class="text-[11px] text-gray-500 italic mt-0.5">{{ entry.notes }}</p>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </HrModal>


    <!-- Update Status Modal (Notes) -->
    <HrModal
      :show="showStatusModal"
      :title="payrollStatusModalTitle"
      :loading="store.loading"
      @close="showStatusModal = false"
      @save="executeStatusUpdate"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">{{ payrollStatusModalMessage }}</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            v-model="statusUpdateForm.notes" 
            rows="3" 
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Add any comments here..."
          ></textarea>
        </div>
      </div>
    </HrModal>

    <!-- ─── Bulk Approve Overlay ──────────────────────────────── -->
    <transition name="fade-overlay">
      <div
        v-if="bulkApprove.active"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <!-- Header -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <span
                  v-if="bulkApprove.done < bulkApprove.total"
                  class="block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
                />
                <svg v-else class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h2 class="text-lg font-bold text-gray-800">
                {{ bulkApprove.done < bulkApprove.total ? 'Processing Bulk Approve…' : 'Bulk Approve Complete' }}
              </h2>
            </div>
            <p class="text-sm text-gray-500 mt-1 pl-11">
              {{ bulkApprove.done < bulkApprove.total
                ? `Please wait while each payroll is approved. Do not close or navigate away.`
                : `All done! ${bulkApprove.success} approved, ${bulkApprove.failed} failed.`
              }}
            </p>
          </div>

          <!-- Progress -->
          <div class="px-6 py-4">
            <!-- Progress Bar -->
            <div class="flex items-center justify-between text-xs font-medium text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>{{ bulkApprove.done }} / {{ bulkApprove.total }}</span>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                :style="{ width: bulkApprove.total ? (bulkApprove.done / bulkApprove.total * 100) + '%' : '0%' }"
              />
            </div>

            <!-- Current Item Message -->
            <div class="mt-4 max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              <div
                v-for="(msg, i) in bulkApprove.log"
                :key="i"
                class="flex items-start gap-2 text-sm py-1.5 px-3 rounded-lg"
                :class="msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'"
              >
                <span class="mt-0.5 flex-shrink-0">
                  <span v-if="msg.type === 'processing'" class="block w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <svg v-else-if="msg.type === 'success'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </span>
                <span>{{ msg.text }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              v-if="bulkApprove.done >= bulkApprove.total"
              @click="closeBulkApproveOverlay"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
            <span v-else class="text-xs text-gray-400 italic">Please wait…</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useHrPayrollStore } from '@/stores/hr/payroll'
import { useHrEmployeesStore } from '@/stores/hr/employees'
import { useHrEmployeeAdjustmentsStore } from '@/stores/hr/employeeAdjustments'
import { useHrContractsStore } from '@/stores/hr/contracts'
import { activeContractTypeForEmployee } from '@/utils/hrEmployeeRequestDuration'
import HrModal from '@/components/hr-dashboard/HrModal.vue'
import PayrollsTable from '@/components/hr-dashboard/PayrollsTable.vue'
import PayrollStatusBadge from '@/components/hr-dashboard/PayrollStatusBadge.vue'
import PayrollSalaryDetails from '@/components/hr-dashboard/PayrollSalaryDetails.vue'
import PayrollContractAnnex from '@/components/hr-dashboard/PayrollContractAnnex.vue'
import { LucideCalculator, LucideRefreshCw, LucideCalendar, LucideDownload, LucideChevronDown } from 'lucide-vue-next'
import notyf from '@/components/global/notyf'
import { exportPayrollsExcel, computePayrollRowNetSalary } from '@/utils/payrollExcelExport'
import { useAuthStore } from '@/stores/auth'
import { HR_PERMISSION } from '@/constants/hrPermissions'
import apiClient from '@/api/axiosInstance'
import { PAYROLL_STATUS_UPDATE, PAYROLL_ATTENDANCE } from '@/api/Api'

// ─── Stores ──────────────────────────────────────────────
const store = useHrPayrollStore()
const employeeStore = useHrEmployeesStore()
const adjustmentsStore = useHrEmployeeAdjustmentsStore()
const contractStore = useHrContractsStore()
const authStore = useAuthStore()

// ─── Helpers ──────────────────────────────────────────────
// Given YYYY-MM, payroll cycle: day 21 of that month → day 20 of next month
const getPayrollDates = (month) => {
  if (!month) return { from_date: "", to_date: "" };

  const [year, mon] = month.split("-").map(Number);

  const fromYear = mon === 1 ? year - 1 : year;
  const fromMon = mon === 1 ? 12 : mon - 1;

  const fromDate = `${fromYear}-${String(fromMon).padStart(2, "0")}-21`;
  const toDate = `${year}-${String(mon).padStart(2, "0")}-20`;

  return { from_date: fromDate, to_date: toDate };
};

/** Match PayrollsTable period resolution: row first, then payroll_month, then screen filter. */
function resolvePayrollRowPeriodForStatus(item) {
  let from = item.period_from || item.period?.from || item.period?.period_from;
  let to = item.period_to || item.period?.to || item.period?.period_to;
  const ym = item.period?.payroll_month;
  if ((!from || !to) && ym && /^\d{4}-\d{2}$/.test(String(ym))) {
    const { from_date, to_date } = getPayrollDates(ym);
    from = from || from_date;
    to = to || to_date;
  }
  if (!from || !to) {
    from = filterForm.value.period_from;
    to = filterForm.value.period_to;
  }
  return { period_from: from || '', period_to: to || '' };
}

// Default: based on the current calendar month
const now = new Date()
const defaultMonthAnchor = new Date(now.getFullYear(), now.getMonth(), 21)
const defaultPayrollMonth = `${defaultMonthAnchor.getFullYear()}-${String(defaultMonthAnchor.getMonth() + 1).padStart(2, '0')}`
const defaultPeriod = getPayrollDates(defaultPayrollMonth)

const filterPayrollMonth = ref(defaultPayrollMonth)

// ─── Filters ──────────────────────────────────────────────
const filterForm = ref({
  period_from: defaultPeriod.from_date,
  period_to: defaultPeriod.to_date,
  status: '',
  include_missing: false
})

const getEmployeeName = (p) => {
  if (!p) return '-'
  const emp = p.employee
  if (emp?.name) return emp.name
  if (emp?.personal_info) {
    const first = emp.personal_info.first_name || ''
    const last = emp.personal_info.last_name || ''
    return (first + ' ' + last).trim() || '-'
  }
  return '-'
}

/** Lowercase haystack for client-side payroll list search (name + fingerprint + id). */
function payrollRowSearchText(p) {
  if (!p || typeof p !== 'object') return ''
  const emp = p.employee || {}
  const pi = emp.personal_info || {}
  const u = emp.user || {}
  const fp =
    emp.fingerprint ??
    emp.fingerPrint ??
    u.fingerPrint ??
    u.finger_print ??
    pi.fingerPrint ??
    pi.finger_print
  const parts = [
    getEmployeeName(p),
    emp.name,
    `${pi.first_name || ''} ${pi.last_name || ''}`.trim(),
    emp.email,
    pi.email,
    u.email,
    emp.id,
    p.employee_id,
    fp,
  ]
  return parts
    .map((v) => String(v ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ')
}

const payrollSearchQuery = ref('')

const filteredActionablePayrolls = computed(() => {
  const list = Array.isArray(store.actionablePayrolls) ? store.actionablePayrolls : []
  const q = payrollSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((item) => payrollRowSearchText(item).includes(q))
})

// ─── Calculate Payroll Modal ──────────────────────────────
const showCalcModal = ref(false)
const calcForm = ref({ employee_id: '', payroll_month: '', from_date: '', to_date: '', worked_hours: '' })

const employeePickerOpen = ref(false)
const employeeSearchQuery = ref('')
const employeePickerRoot = ref(null)
const employeeSearchInputRef = ref(null)

const toggleEmployeePicker = () => {
  employeePickerOpen.value = !employeePickerOpen.value
  if (employeePickerOpen.value) {
    nextTick(() => {
      if (employeeSearchInputRef.value) {
        employeeSearchInputRef.value.focus()
      }
    })
  }
}

const selectEmployee = (id) => {
  calcForm.value.employee_id = id
  employeePickerOpen.value = false
  employeeSearchQuery.value = ''
}

const employeesForPicker = computed(() => {
  return (employeeStore.employees || []).map(emp => {
    const first = emp.personal_info?.first_name || ''
    const last = emp.personal_info?.last_name || ''
    const name = emp.name || (first + ' ' + last).trim() || `Emp #${emp.id}`
    const contractType = activeContractTypeForEmployee(contractStore.contracts, emp.id)
    return {
      id: emp.id,
      name,
      contractType
    }
  })
})

const filteredEmployeesForPicker = computed(() => {
  const q = String(employeeSearchQuery.value || '').toLowerCase().trim()
  const list = employeesForPicker.value
  if (!q) return list
  return list.filter(emp => emp.name.toLowerCase().includes(q))
})

const selectedEmployeeLabel = computed(() => {
  const empId = calcForm.value.employee_id
  if (!empId) return 'Select Employee'
  const found = employeesForPicker.value.find(e => e.id === empId)
  if (found) {
    return found.contractType ? `${found.name} (${found.contractType})` : found.name
  }
  return `Emp #${empId}`
})

const openCalcModal = () => {
  calcForm.value = { employee_id: '', payroll_month: defaultPayrollMonth, from_date: '', to_date: '', worked_hours: '' }
  employeeSearchQuery.value = ''
  employeePickerOpen.value = false
  showCalcModal.value = true
}

const isSelectedEmployeeHourly = computed(() => {
  const empId = calcForm.value.employee_id
  if (!empId) return false
  const type = activeContractTypeForEmployee(contractStore.contracts, empId)
  return type === 'hourly'
})

const autoCalculatingHours = ref(false)

watch(
  () => [calcForm.value.employee_id, calcForm.value.payroll_month, calcForm.value.from_date, calcForm.value.to_date],
  async ([empId, month, fromDate, toDate]) => {
    if (!empId) {
      calcForm.value.worked_hours = '';
      return;
    }
    
    if (isSelectedEmployeeHourly.value) {
      if (!calcForm.value.from_date || !calcForm.value.to_date) {
        const m = calcForm.value.payroll_month || defaultPayrollMonth;
        const dates = getPayrollDates(m);
        calcForm.value.from_date = dates.from_date;
        calcForm.value.to_date = dates.to_date;
        return;
      }
    } else {
      calcForm.value.worked_hours = '';
      return;
    }
    
    autoCalculatingHours.value = true;
    try {
      const response = await apiClient.get(PAYROLL_ATTENDANCE, {
        params: {
          employee_id: empId,
          from_date: calcForm.value.from_date,
          to_date: calcForm.value.to_date,
        },
      });
      const logs = response.data?.data || [];
      
      const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = String(timeStr).split(':').map(Number);
        if (parts.length < 2) return 0;
        return (parts[0] || 0) * 60 + (parts[1] || 0);
      };
      
      let totalMinutes = 0;
      for (const log of logs) {
        if (log.check_in && log.check_out) {
          const checkInMin = timeToMinutes(log.check_in);
          const checkOutMin = timeToMinutes(log.check_out);
          let duration = checkOutMin - checkInMin;
          
          if (log.break_in && log.break_out) {
            const breakInMin = timeToMinutes(log.break_in);
            const breakOutMin = timeToMinutes(log.break_out);
            const breakDuration = breakOutMin - breakInMin;
            if (breakDuration > 0) {
              duration -= breakDuration;
            }
          }
          if (duration > 0) {
            totalMinutes += duration;
          }
        }
      }
      calcForm.value.worked_hours = Number((totalMinutes / 60).toFixed(2));
    } catch (error) {
      console.error('Failed to auto-calculate worked hours:', error);
      calcForm.value.worked_hours = '';
    } finally {
      autoCalculatingHours.value = false;
    }
  }
)

const handleCalculate = async () => {
  if (!calcForm.value.employee_id) {
    notyf.error('Please select an employee')
    return
  }
  
  let from_date = ''
  let to_date = ''
  
  if (isSelectedEmployeeHourly.value) {
    if (!calcForm.value.from_date || !calcForm.value.to_date) {
      notyf.error('Please select date range')
      return
    }
    from_date = calcForm.value.from_date
    to_date = calcForm.value.to_date
  } else {
    if (!calcForm.value.payroll_month) {
      notyf.error('Please select payroll month')
      return
    }
    const dates = getPayrollDates(calcForm.value.payroll_month)
    from_date = dates.from_date
    to_date = dates.to_date
  }
  
  if (isSelectedEmployeeHourly.value && (calcForm.value.worked_hours === '' || calcForm.value.worked_hours === null)) {
    notyf.error('Please enter worked hours')
    return
  }
  
  try {
    const payload = {
      employee_id: calcForm.value.employee_id,
      from_date,
      to_date
    }
    if (isSelectedEmployeeHourly.value) {
      payload.worked_hours = Number(calcForm.value.worked_hours)
    }
    console.log("Calculate Payroll Payload:", payload)
    const response = await store.calculatePayroll(payload)
    selectedPayroll.value = response.data?.data ?? response.data
    showCalcModal.value = false
    showDetailsModal.value = true
    fetchPayrolls()
  } catch (error) {
    console.error('Calculation failed:', error)
  }
}

// ─── Payroll Details Modal ────────────────────────────────
const showDetailsModal = ref(false)
const selectedPayroll = ref(null)
const fetchingId = ref(null)
const selectedAdjustments = ref([])
const adjustmentsLoading = ref(false)
const manualAdjustmentNetByEmployee = ref({})

function buildPayrollExportFileName() {
  const parts = ['payrolls']
  if (filterPayrollMonth.value) parts.push(filterPayrollMonth.value)
  if (filterForm.value.status) parts.push(filterForm.value.status)
  if (filterForm.value.include_missing) parts.push('with-missing')
  if (payrollSearchQuery.value.trim()) parts.push('filtered')
  parts.push(new Date().toISOString().slice(0, 10))
  return `${parts.join('-')}.xlsx`
}

const PAYROLL_STATUS_EXPORT_LABELS = {
  pending: 'Pending',
  'hr-approved': 'HR Approved',
  'hr-manager-approved': 'HR Manager Approved',
  'gm-approved': 'GM Approved',
  suspended: 'Suspended',
  paid: 'Paid',
  received: 'Received',
  rejected: 'Rejected',
}

function buildPayrollExportSubtitle(rowCount, totalNet) {
  const parts = []
  if (filterForm.value.period_from && filterForm.value.period_to) {
    parts.push(`Period: ${filterForm.value.period_from} → ${filterForm.value.period_to}`)
  }
  if (filterForm.value.status) {
    const label = PAYROLL_STATUS_EXPORT_LABELS[filterForm.value.status] || filterForm.value.status
    parts.push(`Status: ${label}`)
  }
  if (filterForm.value.include_missing) parts.push('Including missing payrolls')
  const q = payrollSearchQuery.value.trim()
  if (q) parts.push(`Search: "${q}"`)
  parts.push(`${rowCount} row${rowCount === 1 ? '' : 's'}`)
  parts.push(`Total Net: ${toNumber(totalNet).toFixed(2)}`)
  parts.push(`Generated ${new Date().toLocaleString()}`)
  return parts.join('  •  ')
}

const handleExportExcel = () => {
  const items = filteredActionablePayrolls.value
  if (!items.length) {
    notyf.error('No payroll data to export')
    return
  }
  const ok = exportPayrollsExcel(items, {
    manualAdjustmentNetByEmployee: manualAdjustmentNetByEmployee.value,
    filterPeriodFrom: filterForm.value.period_from,
    filterPeriodTo: filterForm.value.period_to,
    fileName: buildPayrollExportFileName(),
    reportTitle: 'Payroll Management Report',
    reportSubtitle: buildPayrollExportSubtitle(items.length, filteredNetSalaryTotal.value),
    totalNetSalary: filteredNetSalaryTotal.value,
  })
  if (ok) {
    notyf.success(`Exported ${items.length} payroll row${items.length === 1 ? '' : 's'} to Excel`)
  }
}

const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normalizeMonth = (raw) => String(raw || '').slice(0, 7)

const formatMoney = (v) => toNumber(v).toFixed(2)

const filteredNetSalaryTotal = computed(() =>
  filteredActionablePayrolls.value.reduce(
    (sum, item) =>
      sum + computePayrollRowNetSalary(item, manualAdjustmentNetByEmployee.value),
    0,
  ),
)

function noteParts(raw) {
  const text = String(raw ?? '')
  const re = /(https?:\/\/[^\s]+)/g
  const out = []
  let last = 0
  let m

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: text.slice(last, m.index) })
    }
    out.push({ type: 'link', value: m[0] })
    last = re.lastIndex
  }
  if (last < text.length) {
    out.push({ type: 'text', value: text.slice(last) })
  }
  return out.length ? out : [{ type: 'text', value: '-' }]
}

const adjustmentTotals = computed(() => {
  const bonus = selectedAdjustments.value.reduce((sum, row) => sum + toNumber(row?.bonus), 0)
  const deductions = selectedAdjustments.value.reduce((sum, row) => sum + toNumber(row?.deductions), 0)
  return {
    bonus,
    deductions,
    net: bonus - deductions,
  }
})

const buildManualAdjustmentNetMap = (rows) => {
  const map = {}
  for (const row of rows || []) {
    const employeeId = Number(row?.employee_id ?? row?.employee?.id)
    if (!Number.isFinite(employeeId) || employeeId <= 0) continue
    const net = toNumber(row?.bonus) - toNumber(row?.deductions)
    map[employeeId] = toNumber(map[employeeId]) + net
  }
  return map
}

const baseNetSalaryDue = computed(() =>
  toNumber(selectedPayroll.value?.financials?.net_salary_due),
)

const finalNetSalaryDue = computed(() =>
  baseNetSalaryDue.value + adjustmentTotals.value.net,
)

const fetchAdjustmentsForPayroll = async (employeeId, payrollMonth) => {
  const employee_id = Number(employeeId)
  const month = normalizeMonth(payrollMonth)
  if (!Number.isFinite(employee_id) || employee_id <= 0 || !month) {
    selectedAdjustments.value = []
    return
  }
  adjustmentsLoading.value = true
  try {
    const response = await adjustmentsStore.getAdjustments({ employee_id, month })
    selectedAdjustments.value = response?.data ?? adjustmentsStore.adjustments ?? []
  } catch (error) {
    console.error('Failed to fetch adjustments:', error)
    selectedAdjustments.value = []
  } finally {
    adjustmentsLoading.value = false
  }
}

const showDetails = async (item) => {
  if (!authStore.can(HR_PERMISSION.VIEW_PAYROLL)) return
  fetchingId.value = item.payroll_id
  selectedAdjustments.value = []
  adjustmentsLoading.value = true
  try {
    const empId = item.employee?.id || item.employee_id
    const periodMonth = item.period?.payroll_month || item.period_from
    const response = await store.getPayrollDetails(empId, periodMonth)
    selectedPayroll.value = response.data?.data ?? response.data
    const detailsMonth = selectedPayroll.value?.period?.payroll_month || periodMonth
    await fetchAdjustmentsForPayroll(empId, detailsMonth)
    showDetailsModal.value = true
  } catch (error) {
    console.error('Failed to fetch payroll details:', error)
    selectedPayroll.value = item
    await fetchAdjustmentsForPayroll(item.employee?.id || item.employee_id, item.period?.payroll_month || item.period_from)
    showDetailsModal.value = true
  } finally {
    adjustmentsLoading.value = false
    fetchingId.value = null
  }
}

// ─── Update Status Modal ──────────────────────────────────
const showStatusModal = ref(false)
const nextStatus = ref('')
const statusUpdateForm = ref({
  employee_id: null,
  period_from: '',
  period_to: '',
  action: '',
  notes: ''
})

const payrollStatusModalTitle = computed(() => {
  const s = String(nextStatus.value || '').toLowerCase()
  if (s === 'suspend') return 'Stop salary (suspend)'
  return `Update Status: ${nextStatus.value}`
})

const payrollStatusModalMessage = computed(() => {
  const s = String(nextStatus.value || '').toLowerCase()
  if (s === 'suspend') {
    return 'Suspend payroll for this employee and period? Add an optional note below.'
  }
  return `Are you sure you want to update the status of this payroll to ${nextStatus.value}?`
})

const handleUpdateStatus = ({ item, status }) => {
  if (!authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)) return
  const { period_from, period_to } = resolvePayrollRowPeriodForStatus(item)
  statusUpdateForm.value = {
    employee_id: item.employee_id || item.employee?.id,
    period_from,
    period_to,
    action: status,
    notes: ''
  }
  nextStatus.value = status
  showStatusModal.value = true
}

const executeStatusUpdate = async () => {
  if (!authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)) return
  try {
    await store.updatePayrollStatus(statusUpdateForm.value)
    showStatusModal.value = false
    fetchPayrolls()
  } catch (error) {
    console.error('Status update failed:', error)
  }
}

// ─── Bulk Approve ─────────────────────────────────────────
const bulkApprove = ref({
  active: false,
  total: 0,
  done: 0,
  success: 0,
  failed: 0,
  log: []
})

// ── beforeunload guard: warn the user if they try to refresh/close during processing
const _beforeUnloadHandler = (e) => {
  if (bulkApprove.value.active && bulkApprove.value.done < bulkApprove.value.total) {
    e.preventDefault()
    // Chrome requires returnValue to be set
    e.returnValue = 'Bulk approval is still in progress. If you leave now, some payrolls may not be approved. Are you sure?'
    return e.returnValue
  }
}
window.addEventListener('beforeunload', _beforeUnloadHandler)
onBeforeUnmount(() => window.removeEventListener('beforeunload', _beforeUnloadHandler))

const closeBulkApproveOverlay = () => {
  bulkApprove.value.active = false
  fetchPayrolls()
}

const handleBulkApprove = async (selectedItems) => {
  if (!authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS)) return
  if (!selectedItems.length) return

  // Reset state and show overlay
  bulkApprove.value = {
    active: true,
    total: selectedItems.length,
    done: 0,
    success: 0,
    failed: 0,
    log: []
  }

  for (const item of selectedItems) {
    const name = item.employee?.name || `Employee #${item.employee_id || item.employee?.id}`
    const { period_from, period_to } = resolvePayrollRowPeriodForStatus(item)

    // Add a "processing" log entry
    bulkApprove.value.log.push({ type: 'processing', text: `Approving ${name}…` })
    const logIdx = bulkApprove.value.log.length - 1

    try {
      // ⚡ Call the API directly (silent) — bypasses store's per-item notyf.success
      // and handleError toasts, which would be very spammy in bulk mode.
      // We manage all user feedback ourselves through the overlay log.
      await apiClient.post(PAYROLL_STATUS_UPDATE, {
        employee_id: item.employee_id || item.employee?.id,
        period_from,
        period_to,
        action: 'approve',
        notes: ''
      })
      bulkApprove.value.log[logIdx] = { type: 'success', text: `✓ ${name} approved` }
      bulkApprove.value.success++
    } catch (err) {
      // Extract the clearest message available from the error response
      const errMsg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors[0]?.message
          : null) ||
        err?.message ||
        'Network error'
      bulkApprove.value.log[logIdx] = { type: 'error', text: `✗ ${name} — ${errMsg}` }
      bulkApprove.value.failed++
    } finally {
      bulkApprove.value.done++
    }
  }

  // One single summary notyf when everything is done
  if (bulkApprove.value.failed === 0) {
    notyf.success(`All ${bulkApprove.value.success} payrolls approved successfully!`)
  } else if (bulkApprove.value.success === 0) {
    notyf.error(`Bulk approve failed — all ${bulkApprove.value.failed} requests failed.`)
  } else {
    notyf.error(`${bulkApprove.value.success} approved, ${bulkApprove.value.failed} failed — see the log above.`)
  }
}

// ─── Fetch Payrolls ───────────────────────────────────────
const fetchPayrolls = async () => {
  try {
    const params = {}
    if (filterForm.value.period_from) params.period_from = filterForm.value.period_from
    if (filterForm.value.period_to) params.period_to = filterForm.value.period_to
    if (filterForm.value.status) params.status = filterForm.value.status
    if (filterForm.value.include_missing) params.include_missing = 1

    const month = normalizeMonth(filterPayrollMonth.value)
    if (month) {
      const adjustmentRes = await adjustmentsStore.getAdjustments({ month })
      const rows = adjustmentRes?.data ?? adjustmentsStore.adjustments ?? []
      manualAdjustmentNetByEmployee.value = buildManualAdjustmentNetMap(rows)
    } else {
      manualAdjustmentNetByEmployee.value = {}
    }

    await store.getActionablePayrolls(params)
  } catch (error) {
    console.error('Failed to fetch payrolls:', error)
    manualAdjustmentNetByEmployee.value = {}
  }
}

const applyFilterMonth = () => {
  if (!filterPayrollMonth.value) return
  const { from_date, to_date } = getPayrollDates(filterPayrollMonth.value)
  filterForm.value.period_from = from_date
  filterForm.value.period_to = to_date
  fetchPayrolls()
}

const handleClickOutsidePicker = (e) => {
  if (employeePickerRoot.value && !employeePickerRoot.value.contains(e.target)) {
    employeePickerOpen.value = false
  }
}

onMounted(async () => {
  window.addEventListener('click', handleClickOutsidePicker)
  await Promise.all([
    fetchPayrolls(),
    employeeStore.getEmployees(),
    contractStore.getContracts().catch(() => {})
  ])
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutsidePicker)
})
</script>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
