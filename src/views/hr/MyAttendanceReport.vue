<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div
      v-if="!employeeResolveDone"
      class="flex justify-center items-center min-h-[360px]"
      aria-busy="true"
      aria-label="Loading"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>

    <div
      v-else-if="!effectiveEmployeeId"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm"
    >
      Your account is not linked to an employee record. Contact HR if you need access.
    </div>

    <div v-else class="space-y-4">
      <div class="rounded-xl border border-sky-100 bg-sky-50/40 p-4">
        <label class="block text-sm font-semibold text-gray-800 mb-1">Payroll Month</label>
        <div class="relative max-w-md">
          <input v-model="filterPayrollMonth" type="month"
            class="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <LucideCalendar class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <p v-if="filterPayrollMonth" class="text-xs text-gray-500 mt-2">
          Period: {{ periodBounds.from_date }} → {{ periodBounds.to_date }}
        </p>
      </div>

      <div class="border border-indigo-100 rounded-2xl overflow-hidden">
        <AttendanceReportPanel
          ref="panelRef"
          :show-employee-select="false"
          :locked-employee-id="effectiveEmployeeId"
          :initial-from="periodBounds.from_date"
          :initial-to="periodBounds.to_date"
          :hide-controls="true"
          :suppress-success-notyf="true"
          :show-day-request-action="authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)"
          @request-for-day="openRequestForDay"
        />
      </div>
    </div>

    <AttendanceRequestModal :show="showRequestModal" :loading="requestLoading" :initialForm="requestForm"
      @close="showRequestModal = false" @save="handleRequestSubmit" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { LucideCalendar } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import AttendanceReportPanel from "@/components/hr-dashboard/attendance/AttendanceReportPanel.vue";
import AttendanceRequestModal from "@/components/hr-dashboard/attendance/AttendanceRequestModal.vue";
import { getPayrollDates, defaultPayrollMonthRange } from "@/utils/payrollPeriod";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();

const resolvedPayrollEmployeeId = ref("");
const panelRef = ref(null);
/** After directory resolve finishes — avoids showing "not linked" while still resolving. */
const employeeResolveDone = ref(false);

const filterPayrollMonth = ref(defaultPayrollMonthRange().payrollMonth);
const periodBounds = computed(() => getPayrollDates(filterPayrollMonth.value));

const effectiveEmployeeId = computed(
  () => authStore.payrollEmployeeId || resolvedPayrollEmployeeId.value || "",
);

async function resolvePayrollEmployeeFromDirectory() {
  resolvedPayrollEmployeeId.value = "";
  if (authStore.payrollEmployeeId) return;

  try {
    await employeeStore.getEmployees();
    const u = authStore.user;
    if (!u) return;

    const uid = u.id;
    const email = String(u.email || "").trim().toLowerCase();
    const list = employeeStore.employees || [];

    const match = list.find((emp) => {
      const linkedUserId = emp.user?.id ?? emp.user_id;
      if (uid != null && linkedUserId != null && String(linkedUserId) === String(uid)) {
        return true;
      }
      const empEmail = String(
        emp.user?.email || emp.email || emp.personal_info?.email || "",
      )
        .trim()
        .toLowerCase();
      return email.length > 0 && empEmail === email;
    });

    if (match?.id != null) {
      resolvedPayrollEmployeeId.value = String(match.id).trim();
    }
  } catch (e) {
    console.warn("MyAttendanceReport: could not resolve employee from directory", e);
  }
}

async function triggerReportIfReady() {
  if (!effectiveEmployeeId.value) return;
  const { from_date, to_date } = periodBounds.value;
  if (!from_date || !to_date) return;
  await nextTick();
  try {
    await panelRef.value?.generateReport?.();
  } catch {
    /* errors handled in store / panel */
  }
}

watch(
  [filterPayrollMonth, effectiveEmployeeId, employeeResolveDone],
  () => {
    if (!employeeResolveDone.value) return;
    triggerReportIfReady();
  },
  { immediate: true, flush: "post" },
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

const showRequestModal = ref(false);
const requestLoading = ref(false);
const requestForm = ref({
  request_type: "leave",
  day: "",
  duration_hours: null,
  from_time: "",
  to_time: "",
  day_replacement: "",
  duration_type: "full",
});

const openRequestForDay = (date) => {
  if (!authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)) {
    notyf.error("You do not have permission to create employee requests.");
    return;
  }
  requestForm.value = {
    request_type: "leave",
    day: date,
    duration_hours: null,
    from_time: "",
    to_time: "",
    day_replacement: "",
    duration_type: "full",
  };
  showRequestModal.value = true;
};

const handleRequestSubmit = async (payload) => {
  if (!authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)) {
    notyf.error("You do not have permission to create employee requests.");
    return;
  }
  if (!payload.day) {
    notyf.error("Please select a date");
    return;
  }

  if (["lateness", "leave"].includes(payload.request_type) && !payload.duration_hours) {
    notyf.error("Duration hours is required for this request type");
    return;
  }
  if (payload.request_type === "day_off_swap" && !payload.day_replacement) {
    notyf.error("Replacement date is required for day off swap");
    return;
  }

  requestLoading.value = true;
  try {
    const { useHrRequestsStore } = await import("@/stores/hr/requests");
    const requestsStore = useHrRequestsStore();
    await requestsStore.createRequest(payload);
    showRequestModal.value = false;
    notyf.success("Request created successfully");
  } catch (e) {
    console.error("Request submission failed:", e);
  } finally {
    requestLoading.value = false;
  }
};
</script>
