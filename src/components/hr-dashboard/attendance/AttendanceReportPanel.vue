<template>
  <div class="flex-1 overflow-y-auto p-6 space-y-6">
    <template v-if="!hideControls">
      <div class="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-xl"
        :class="showEmployeeSelect ? 'md:grid-cols-3' : 'md:grid-cols-2'">
        <div v-if="showEmployeeSelect">
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select v-model="reportForm.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
              {{
                emp.name ||
                (emp.personal_info
                  ? emp.personal_info.first_name + " " + emp.personal_info.last_name
                  : "Emp #" + emp.id)
              }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input v-model="reportForm.from_date" type="date"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input v-model="reportForm.to_date" type="date"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
        </div>
      </div>

      <div class="flex gap-2">
        <button type="button" @click="handleReport" :disabled="store.loading"
          class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span v-if="store.loading"
            class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ store.loading ? "Generating..." : "Generate Report" }}
        </button>
      </div>
    </template>

    <div
      v-if="hideControls && !reportData && store.loading"
      class="flex justify-center items-center min-h-[280px] rounded-xl border border-gray-100 bg-gray-50/40"
      aria-busy="true"
      aria-label="Loading report"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>

    <div
      v-else-if="hideControls && !reportData && !store.loading && reportRequested"
      class="rounded-xl border border-gray-100 bg-gray-50/40 px-6 py-10 text-center text-sm text-gray-600"
    >
      Could not load report data for this period. Try another month or refresh the page.
    </div>

    <div v-if="reportData" id="printable-report" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-gray-900">
            {{ reportData.employee?.name || "—" }}
            <span v-if="reportData.employee?.fingerprint != null && reportData.employee?.fingerprint !== ''">
              (FP: {{ reportData.employee.fingerprint }})
            </span>
          </h3>
          <p class="text-sm text-gray-500">
            {{ reportData.period?.from }} - {{ reportData.period?.to }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 report-summary-grid">
        <div class="p-3 rounded-xl border summary-card emerald-card flex items-center gap-3">
          <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <CheckCircle class="w-4 h-4" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-400">Present</p>
            <p class="text-sm font-bold">{{ reportData.summary?.present_days }}</p>
          </div>
        </div>
        <div class="p-3 rounded-xl border summary-card rose-card flex items-center gap-3">
          <div class="p-2 bg-rose-100 rounded-lg text-rose-600">
            <XCircle class="w-4 h-4" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-400">Absent</p>
            <p class="text-sm font-bold">{{ reportData.summary?.absent_days }}</p>
          </div>
        </div>
        <div class="p-3 rounded-xl border summary-card amber-card flex items-center gap-3">
          <div class="p-2 bg-amber-100 rounded-lg text-amber-600">
            <Palmtree class="w-4 h-4" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-400">Vacation</p>
            <p class="text-sm font-bold">{{ reportData.summary?.vacation?.taken_days }}d</p>
            <p class="text-[9px] text-amber-700">
              {{ reportData.summary?.vacation?.remaining_days }} left
            </p>
          </div>
        </div>
        <div v-if="reportData.monthly_hours"
          class="p-3 rounded-xl border summary-card sky-card flex items-center gap-3">
          <div class="p-2 bg-sky-100 rounded-lg text-sky-600">
            <CalendarClock class="w-4 h-4" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-400">Monthly Hours</p>
            <p class="text-sm font-bold">
              {{ reportData.monthly_hours.taken }}/{{ reportData.monthly_hours.limit }}
            </p>
            <p class="text-[9px] text-sky-700">{{ reportData.monthly_hours.remaining }} remaining</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="p-2 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center gap-2">
          <Clock class="w-4 h-4 text-red-600" />
          <div class="text-left">
            <span class="text-[10px] font-bold text-red-600 uppercase block">Lateness</span>
            <p class="text-sm font-bold text-red-700">{{ reportData.summary?.total_lateness || 0 }}m</p>
          </div>
        </div>
        <div class="p-2 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-center gap-2">
          <LogOut class="w-4 h-4 text-orange-600" />
          <div class="text-left">
            <span class="text-[10px] font-bold text-orange-600 uppercase block">Early Leave</span>
            <p class="text-sm font-bold text-orange-700">{{ getTotalEarlyLeave(reportData) }}m</p>
          </div>
        </div>
        <div class="p-2 bg-green-50 rounded-lg border border-green-100 flex items-center justify-center gap-2">
          <Zap class="w-4 h-4 text-green-600" />
          <div class="text-left">
            <span class="text-[10px] font-bold text-green-600 uppercase block">Overtime</span>
            <p class="text-sm font-bold text-green-700">{{ reportData.summary?.total_overtime || 0 }}m</p>
          </div>
        </div>
      </div>

      <div class="overflow-hidden border border-gray-300 rounded-xl">
        <table class="w-full text-center text-sm border border-gray-200">
          <thead class="bg-gray-50/80 border-b border-gray-200">
            <tr class="divide-x divide-gray-200">
              <th class="p-4 font-extrabold text-center text-gray-700">Date</th>
              <th class="p-4 font-extrabold text-center text-gray-700">Main Shift</th>
              <th class="p-4 font-extrabold text-center text-gray-700">Attendance</th>
              <th class="p-4 font-extrabold text-center text-red-600">Lateness</th>
              <th class="p-4 font-extrabold text-center text-orange-600">Early Leave</th>
              <th class="p-4 font-extrabold text-center text-green-600">Overtime</th>
              <th
                v-if="showDayRequestAction"
                class="p-4 font-extrabold text-center no-print text-gray-700"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-[11px]">
            <tr v-for="day in paginatedDays" :key="day.date"
              class="divide-x divide-gray-200 hover:bg-gray-50/30 transition-colors"
              :class="{ 'bg-amber-50/80': day.status === 'day_off' }">
              <td class="p-3 font-bold text-center text-xs">{{ formatDate(day.date) }}</td>
              <td class="p-3 text-center">
                <div v-if="day.main_shift" class="flex items-center justify-center gap-2">
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] uppercase font-bold text-gray-400">In</span>
                    <span
                      class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-bold text-[10px]">
                      {{ formatTime(getShiftIn(day), true) }}
                    </span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] uppercase font-bold text-gray-400">Out</span>
                    <span class="px-2 py-1 bg-sky-50 text-sky-700 rounded border border-sky-100 font-bold text-[10px]">
                      {{ formatTime(getShiftOut(day), true) }}
                    </span>
                  </div>
                </div>
                <span v-else class="text-gray-300">--</span>
              </td>
              <td class="p-3 text-center">
                <template v-if="day.attendance?.check_in">
                  <div class="flex items-center justify-center gap-2">
                    <div class="flex flex-col items-center">
                      <span class="text-[8px] uppercase font-bold text-gray-400">In</span>
                      <span class="px-2 py-1 rounded border font-bold text-[10px]" :class="getLatenessValue(day) > 0
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-indigo-50/30 text-indigo-700 border-indigo-100/50'
                        ">
                        {{ formatTime(day.attendance.check_in, true) }}
                      </span>
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-[8px] uppercase font-bold text-gray-400">Out</span>
                      <span
                        class="px-2 py-1 bg-sky-50/30 text-sky-700 rounded border border-sky-100/50 font-bold text-[10px]">
                        {{ formatTime(day.attendance.check_out, true) }}
                      </span>
                    </div>
                  </div>
                </template>
                <span v-else class="text-gray-300">--</span>
              </td>
              <td class="p-3 text-center">
                <span v-if="getLatenessValue(day) > 0"
                  class="inline-block px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-[10px]">
                  {{ getLatenessValue(day) }}m
                </span>
                <span v-else class="text-gray-300">-</span>
              </td>
              <td class="p-3 text-center">
                <span v-if="getEarlyLeaveValue(day) > 0"
                  class="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded font-bold text-[10px]">
                  {{ getEarlyLeaveValue(day) }}m
                </span>
                <span v-else class="text-gray-300">-</span>
              </td>
              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] uppercase font-bold text-gray-400">Before</span>
                    <span class="px-2 py-1 rounded border font-bold text-[10px]" :class="getOvertimeBefore(day) > 0
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                      ">
                      {{ getOvertimeBefore(day) }}m
                    </span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] uppercase font-bold text-gray-400">After</span>
                    <span class="px-2 py-1 rounded border font-bold text-[10px]" :class="getOvertimeAfter(day) > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                      ">
                      {{ getOvertimeAfter(day) }}m
                    </span>
                  </div>
                </div>
                <div v-if="getOvertimeValue(day) > 0" class="text-[10px] font-bold text-green-700 mt-1">
                  Total: {{ getOvertimeValue(day) }}m
                </div>
              </td>
              <td v-if="showDayRequestAction" class="p-3 text-center no-print">
                <button type="button" @click="$emit('request-for-day', day.date)"
                  class="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium px-2 py-1 rounded transition-colors shadow-sm cursor-pointer">
                  Request
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl no-print">
        <div class="text-xs text-gray-500 font-medium">
          Showing
          <span class="text-indigo-600 font-bold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          -
          <span class="text-indigo-600 font-bold">{{
            Math.min(currentPage * itemsPerPage, reportData.days.length)
          }}</span>
          of
          <span class="text-gray-800 font-bold">{{ reportData.days.length }}</span>
          days
        </div>
        <div class="flex items-center gap-1">
          <button type="button" @click="currentPage--" :disabled="currentPage === 1"
            class="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-gray-600 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-1 px-2">
            <button v-for="page in totalPages" :key="page" type="button" @click="currentPage = page"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border cursor-pointer"
              :class="currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                ">
              {{ page }}
            </button>
          </div>
          <button type="button" @click="currentPage++" :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-gray-600 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useHrAttendanceStore } from "@/stores/hr/attendance";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import {
  CheckCircle,
  XCircle,
  Palmtree,
  CalendarClock,
  Clock,
  LogOut,
  Zap,
} from "lucide-vue-next";
import notyf from "@/components/global/notyf";

const props = defineProps({
  showEmployeeSelect: { type: Boolean, default: true },
  lockedEmployeeId: { type: [String, Number], default: null },
  initialFrom: { type: String, default: "" },
  initialTo: { type: String, default: "" },
  hideControls: { type: Boolean, default: false },
  suppressSuccessNotyf: { type: Boolean, default: false },
  showDayRequestAction: { type: Boolean, default: true },
});

defineEmits(["request-for-day"]);

const store = useHrAttendanceStore();
const employeeStore = useHrEmployeesStore();

const reportForm = ref({
  employee_id: null,
  from_date: "",
  to_date: "",
});

const reportData = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(15);
/** True after a successful validation path attempted generate (for hidden-controls empty/error UI). */
const reportRequested = ref(false);

const paginatedDays = computed(() => {
  if (!reportData.value || !reportData.value.days) return [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return reportData.value.days.slice(start, end);
});

const totalPages = computed(() => {
  if (!reportData.value || !reportData.value.days) return 0;
  return Math.ceil(reportData.value.days.length / itemsPerPage.value);
});

function syncFormFromProps() {
  reportForm.value.from_date = props.initialFrom || "";
  reportForm.value.to_date = props.initialTo || "";
  if (!props.showEmployeeSelect && props.lockedEmployeeId != null && String(props.lockedEmployeeId).trim() !== "") {
    const n = Number(props.lockedEmployeeId);
    reportForm.value.employee_id = Number.isFinite(n) && n > 0 ? n : props.lockedEmployeeId;
  }
}

watch(
  () => [props.initialFrom, props.initialTo, props.lockedEmployeeId, props.showEmployeeSelect],
  () => {
    syncFormFromProps();
  },
  { immediate: true },
);

onMounted(async () => {
  if (props.showEmployeeSelect) {
    try {
      await employeeStore.getEmployees();
    } catch {
      /* handleError in store */
    }
  }
  syncFormFromProps();
});

const effectiveEmployeeId = computed(() => {
  if (props.showEmployeeSelect) return reportForm.value.employee_id;
  const lid = props.lockedEmployeeId;
  if (lid == null || String(lid).trim() === "") return null;
  const n = Number(lid);
  return Number.isFinite(n) && n > 0 ? n : lid;
});

const handleReport = async () => {
  const eid = effectiveEmployeeId.value;
  if (!eid || !reportForm.value.from_date || !reportForm.value.to_date) {
    notyf.error("Please fill in all criteria");
    return;
  }
  reportRequested.value = true;
  try {
    const payload = {
      employee_id: parseInt(String(eid), 10),
      from_date: reportForm.value.from_date,
      to_date: reportForm.value.to_date,
    };
    const data = await store.generateMonthlyReport(payload);
    reportData.value = data.data;
    currentPage.value = 1;
    if (!props.suppressSuccessNotyf) {
      notyf.success("Report generated");
    }
  } catch (e) {
    console.error("Report Generation Failed:", e);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatTime = (time, isShort = false) => {
  if (!time) return "-";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes} ${period}`;
};

const getLatenessValue = (day) => {
  if (!day.lateness) return 0;
  if (typeof day.lateness === "object") return Math.round(Number(day.lateness.minutes) || 0);
  return Math.round(Number(day.lateness) || 0);
};

const getOvertimeValue = (day) => {
  if (!day.overtime) return 0;
  if (typeof day.overtime === "object") return Math.round(Number(day.overtime.total) || 0);
  return Math.round(Number(day.overtime) || 0);
};

const getOvertimeBefore = (day) => {
  if (!day.overtime || typeof day.overtime !== "object") return 0;
  return Math.round(Number(day.overtime.before) || 0);
};

const getOvertimeAfter = (day) => {
  if (!day.overtime || typeof day.overtime !== "object") return 0;
  return Math.round(Number(day.overtime.after) || 0);
};

const getShiftIn = (day) => {
  if (!day.main_shift) return null;
  return day.main_shift.in || day.main_shift.from;
};

const getShiftOut = (day) => {
  if (!day.main_shift) return null;
  return day.main_shift.out || day.main_shift.to;
};

const getEarlyLeaveValue = (day) => {
  if (!day.early_leave) return 0;
  if (typeof day.early_leave === "object") return Math.round(Number(day.early_leave.minutes) || 0);
  return Math.round(Number(day.early_leave) || 0);
};

const getTotalEarlyLeave = (report) => {
  if (!report || !report.days) return 0;
  return report.days.reduce((total, day) => total + getEarlyLeaveValue(day), 0);
};

defineExpose({
  generateReport: handleReport,
  reset: () => {
    reportForm.value = { employee_id: null, from_date: "", to_date: "" };
    reportData.value = null;
    currentPage.value = 1;
    reportRequested.value = false;
    syncFormFromProps();
  },
});
</script>
