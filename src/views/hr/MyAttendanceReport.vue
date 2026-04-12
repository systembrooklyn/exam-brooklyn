<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">My attendance</h1>
      <p class="text-gray-500 mt-1">Monthly report and day requests</p>
    </div>

    <div
      v-if="!effectiveEmployeeId"
      class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm"
    >
      Your account is not linked to an employee record. Contact HR if you need access.
    </div>

    <div v-else class="border border-indigo-100 rounded-2xl overflow-hidden">
      <div
        class="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-b border-indigo-500/30"
      >
        <h2 class="text-xl font-bold">Monthly Attendance Report</h2>
        <p class="text-indigo-100 text-sm mt-0.5">View your attendance and submit requests by day</p>
      </div>
      <AttendanceReportPanel
        ref="panelRef"
        :show-employee-select="false"
        :locked-employee-id="effectiveEmployeeId"
        :initial-from="period.from_date"
        :initial-to="period.to_date"
        @request-for-day="openRequestForDay"
      />
    </div>

    <AttendanceRequestModal
      :show="showRequestModal"
      :loading="requestLoading"
      :initialForm="requestForm"
      @close="showRequestModal = false"
      @save="handleRequestSubmit"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import AttendanceReportPanel from "@/components/hr-dashboard/attendance/AttendanceReportPanel.vue";
import AttendanceRequestModal from "@/components/hr-dashboard/attendance/AttendanceRequestModal.vue";
import { defaultPayrollMonthRange } from "@/utils/payrollPeriod";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();

const resolvedPayrollEmployeeId = ref("");
const panelRef = ref(null);

const period = ref(defaultPayrollMonthRange());

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

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.getUserByToken();
  }
  await resolvePayrollEmployeeFromDirectory();
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
