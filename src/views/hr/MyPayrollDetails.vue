<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div v-if="!employeeResolveDone" class="flex justify-center items-center min-h-[360px]" aria-busy="true"
      aria-label="Loading">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>

    <div v-else-if="!effectiveEmployeeId"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
      Your account is not linked to an employee record. Contact HR if you need access.
    </div>

    <div v-else class="space-y-4">
      <div class="rounded-xl border border-sky-100 bg-sky-50/40 p-4">
        <label class="block text-sm font-semibold text-gray-800 mb-1">Payroll Month</label>
        <div class="flex items-center gap-2">
          <div class="relative max-w-md w-full">
            <input v-model="filterPayrollMonth" type="month"
              class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <LucideCalendar
              class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button type="button"
            class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
            :disabled="loading" title="Refresh payroll" @click="handleManualRefresh">
            <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
        <p v-if="filterPayrollMonth" class="text-xs text-gray-500 mt-2">
          Period: {{ periodBounds.from_date }} → {{ periodBounds.to_date }}
        </p>
      </div>

      <div v-if="loading && !payrollData"
        class="flex justify-center items-center min-h-[280px] rounded-xl border border-gray-100 bg-gray-50/40">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>

      <div v-else-if="!loading && !payrollData"
        class="rounded-xl border border-gray-100 bg-gray-50/40 px-6 py-10 text-center text-sm text-gray-600">
        No payroll details found for this period.
      </div>

      <div v-else-if="payrollData" class="space-y-5 border border-indigo-100 rounded-2xl p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p class="text-xs font-bold text-orange-600 uppercase mb-0.5">Employee Name</p>
            <p class="text-base font-semibold text-gray-800">{{ getEmployeeName(payrollData) }}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p class="text-xs font-bold text-indigo-600 uppercase mb-0.5">E-Mail</p>
            <p class="text-base font-medium text-gray-800">
              {{ payrollData.employee?.email ?? payrollData.employee?.personal_info?.email ?? "-" }}
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-400 uppercase font-bold">Payroll Period</p>
            <p class="text-base font-bold text-gray-800">
              {{ payrollData.period?.payroll_month || payrollData.period?.from || payrollData.period?.to }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <PayrollStatusBadge :status="payrollData.current_status || payrollData.status" />
            <template v-if="
              canConfirmReceipt &&
              String(payrollData.current_status || payrollData.status || '').toLowerCase() === 'paid'
            ">
              <button type="button"
                class="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                title="Confirm received" @click="openStatusModal('approve')">
                Salary received
              </button>
              <button type="button"
                class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                title="Mark not received" @click="openStatusModal('reject')">
                Not received
              </button>
            </template>
          </div>
        </div>

        <PayrollContractAnnex :contract="payrollData.contract" />

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 text-center">
            <p class="text-xs font-bold text-gray-600 uppercase mb-1">Fixed Salary Paid</p>
            <p class="text-xl font-bold text-gray-800">{{ payrollData.financials?.fixed_salary_paid ?? "-" }}</p>
          </div>
          <div class="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 text-center">
            <p class="text-xs font-bold text-amber-600 uppercase mb-1">Net Salary Due</p>
            <p class="text-xl font-bold text-indigo-700">{{ formatMoney(finalNetSalaryDue) }}</p>
            <p class="text-[11px] text-indigo-500 mt-1">
              Base {{ formatMoney(baseNetSalaryDue) }} + Manual {{ formatMoney(adjustmentTotals.net) }}
            </p>
          </div>
        </div>

        <PayrollSalaryDetails
          :deduction-details="payrollData.deduction_details ?? payrollData.financials?.deductions?.details"
          :additions-details="payrollData.additions_details ?? payrollData.financials?.additions?.details"
          :deductions-total="payrollData.financials?.deductions" :additions-total="payrollData.financials?.additions" />

        <div class="space-y-3">
          <div class="bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg text-center">
            Employee Adjustments
          </div>
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

          <div v-if="adjustments.length" class="overflow-hidden border border-gray-200 rounded-xl">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="p-3 text-left font-semibold text-gray-600">Month</th>
                  <th class="p-3 text-left font-semibold text-gray-600">Bonus</th>
                  <th class="p-3 text-left font-semibold text-gray-600">Deductions</th>
                  <th class="p-3 text-left font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="adj in adjustments" :key="adj.id">
                  <td class="p-3 text-gray-700">{{ normalizeMonth(adj.month) || "-" }}</td>
                  <td class="p-3 text-green-700 font-semibold">{{ formatMoney(adj.bonus) }}</td>
                  <td class="p-3 text-red-700 font-semibold">{{ formatMoney(adj.deductions) }}</td>
                  <td class="p-3 text-gray-700 align-top leading-6">
                    <NotesWithLinks :text="adj.notes" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            No manual adjustments found for this payroll month.
          </div>
        </div>
      </div>
    </div>

    <HrModal :show="showStatusModal" :title="statusModalTitle" :loading="loading" @close="showStatusModal = false"
      @save="executeStatusUpdate">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">{{ statusModalMessage }}</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes<span v-if="statusUpdateForm.action === 'reject'" class="text-red-600"> *</span></label>
          <textarea
            v-model="statusUpdateForm.notes"
            rows="3"
            :required="statusUpdateForm.action === 'reject'"
            :class="[
              'w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none',
              statusUpdateForm.action === 'reject' && !statusUpdateForm.notes ? 'border-red-300' : 'border-gray-300'
            ]"
            placeholder="Add any comments here..."
          />
          <p
            v-if="statusUpdateForm.action === 'reject' && !statusUpdateForm.notes"
            class="text-red-600 text-xs mt-1"
          >
            Notes are required to reject payroll.
          </p>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  LucideCalendar,
  LucideRefreshCw,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useHrPayrollStore } from "@/stores/hr/payroll";
import { useHrEmployeeAdjustmentsStore } from "@/stores/hr/employeeAdjustments";
import { defaultPayrollMonthRange, getPayrollDates } from "@/utils/payrollPeriod";
import PayrollStatusBadge from "@/components/hr-dashboard/PayrollStatusBadge.vue";
import PayrollSalaryDetails from "@/components/hr-dashboard/PayrollSalaryDetails.vue";
import PayrollContractAnnex from "@/components/hr-dashboard/PayrollContractAnnex.vue";
import NotesWithLinks from "@/components/hr-dashboard/NotesWithLinks.vue";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import { HR_PERMISSION } from "@/constants/hrPermissions";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const payrollStore = useHrPayrollStore();
const adjustmentsStore = useHrEmployeeAdjustmentsStore();

const resolvedPayrollEmployeeId = ref("");
const employeeResolveDone = ref(false);
const filterPayrollMonth = ref(defaultPayrollMonthRange().payrollMonth);
const periodBounds = computed(() => getPayrollDates(filterPayrollMonth.value));

const loading = ref(false);
const payrollData = ref(null);
const adjustments = ref([]);
const showStatusModal = ref(false);
const nextStatus = ref("");
const statusUpdateForm = ref({
  employee_id: null,
  period_from: "",
  period_to: "",
  action: "",
  notes: "",
});

const effectiveEmployeeId = computed(
  () => authStore.payrollEmployeeId || resolvedPayrollEmployeeId.value || "",
);
const canConfirmReceipt = computed(() =>
  authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS),
);

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeMonth = (raw) => String(raw || "").slice(0, 7);
const formatMoney = (v) => toNumber(v).toFixed(2);

const baseNetSalaryDue = computed(() =>
  toNumber(payrollData.value?.financials?.net_salary_due),
);

const adjustmentTotals = computed(() => {
  const bonus = adjustments.value.reduce((sum, row) => sum + toNumber(row?.bonus), 0);
  const deductions = adjustments.value.reduce(
    (sum, row) => sum + toNumber(row?.deductions),
    0,
  );
  return { bonus, deductions, net: bonus - deductions };
});

const finalNetSalaryDue = computed(
  () => baseNetSalaryDue.value + adjustmentTotals.value.net,
);

const statusModalTitle = computed(() => {
  if (nextStatus.value === "approve") return "Confirm Salary Receipt";
  if (nextStatus.value === "reject") return "Mark Salary Not Received";
  return `Update Status: ${nextStatus.value}`;
});

const statusModalMessage = computed(() => {
  if (nextStatus.value === "approve") {
    return "Confirm that you have received the payroll amount from accounting.";
  }
  if (nextStatus.value === "reject") {
    return "Confirm that the payroll amount has not been received yet.";
  }
  return `Are you sure you want to update the status to ${nextStatus.value}?`;
});

const getEmployeeName = (p) => {
  const emp = p?.employee;
  if (emp?.name) return emp.name;
  const first = emp?.personal_info?.first_name || "";
  const last = emp?.personal_info?.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || "-";
};

async function resolvePayrollEmployeeFromDirectory() {
  resolvedPayrollEmployeeId.value = "";
  if (authStore.payrollEmployeeId) return;

  try {
    await employeeStore.getEmployees();
    const u = authStore.user;
    if (!u) return;
    const uid = u.id;
    const email = String(u.email || "").trim().toLowerCase();

    const match = (employeeStore.employees || []).find((emp) => {
      const linkedUserId = emp.user?.id ?? emp.user_id;
      if (uid != null && linkedUserId != null && String(linkedUserId) === String(uid)) {
        return true;
      }
      const empEmail = String(
        emp.user?.email || emp.email || emp.personal_info?.email || "",
      )
        .trim()
        .toLowerCase();
      return email && empEmail === email;
    });

    if (match?.id != null) {
      resolvedPayrollEmployeeId.value = String(match.id).trim();
    }
  } catch (e) {
    console.warn("MyPayrollDetails: could not resolve employee from directory", e);
  }
}

const payrollMonthForDetails = computed(() => periodBounds.value.to_date);
const adjustmentsMonth = computed(() => normalizeMonth(filterPayrollMonth.value));

async function fetchMyPayrollDetails() {
  if (!effectiveEmployeeId.value) return;
  if (!payrollMonthForDetails.value || !adjustmentsMonth.value) return;

  loading.value = true;
  try {
    const employeeId = Number(String(effectiveEmployeeId.value).trim());
    const [payrollRes, adjustmentsRes] = await Promise.all([
      payrollStore.getPayrollDetails(employeeId, payrollMonthForDetails.value),
      adjustmentsStore.getAdjustments({
        employee_id: employeeId,
        month: adjustmentsMonth.value,
      }),
    ]);

    payrollData.value = payrollRes?.data ?? null;
    adjustments.value = adjustmentsRes?.data ?? [];
  } catch (error) {
    payrollData.value = null;
    adjustments.value = [];
    console.error("Failed to fetch my payroll details:", error);
  } finally {
    loading.value = false;
  }
}

function openStatusModal(status) {
  if (!canConfirmReceipt.value) return;
  if (!payrollData.value) return;
  const current = String(
    payrollData.value.current_status || payrollData.value.status || "",
  ).toLowerCase();
  if (current !== "paid") return;

  nextStatus.value = status;
  statusUpdateForm.value = {
    employee_id: Number(String(effectiveEmployeeId.value).trim()),
    period_from: periodBounds.value.from_date,
    period_to: periodBounds.value.to_date,
    action: status,
    notes: "",
  };
  showStatusModal.value = true;
}

async function executeStatusUpdate() {
  if (!canConfirmReceipt.value) return;
  try {
    loading.value = true;
    await payrollStore.updatePayrollStatus(statusUpdateForm.value);
    showStatusModal.value = false;
    await fetchMyPayrollDetails();
  } catch (error) {
    console.error("Status update failed:", error);
  } finally {
    loading.value = false;
  }
}

async function handleManualRefresh() {
  if (loading.value) return;
  await fetchMyPayrollDetails();
}

watch(
  [filterPayrollMonth, effectiveEmployeeId, employeeResolveDone],
  () => {
    if (!employeeResolveDone.value) return;
    void fetchMyPayrollDetails();
  },
  { immediate: true },
);

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.getUserByToken();
  }
  try {
    await resolvePayrollEmployeeFromDirectory();
  } finally {
    employeeResolveDone.value = true;
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
