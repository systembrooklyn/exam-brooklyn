<template>
  <Transition name="drawer">
    <div v-if="show" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-black/50 transition-opacity cursor-pointer" @click="$emit('close')"></div>

      <div class="absolute right-0 top-0 h-full w-full md:w-[950px] bg-white shadow-2xl flex flex-col">
        <div
          class="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700 shrink-0">
          <div class="text-white">
            <h2 class="text-2xl font-bold">Monthly Attendance Report</h2>
            <p class="text-indigo-100 text-sm mt-1">View detailed attendance breakdown</p>
          </div>
          <button type="button" @click="$emit('close')"
            class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <AttendanceReportPanel
          ref="panelRef"
          :show-employee-select="true"
          :show-day-request-action="authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_REQUEST)"
          @request-for-day="(d) => $emit('request-for-day', d)"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import AttendanceReportPanel from "@/components/hr-dashboard/attendance/AttendanceReportPanel.vue";

const authStore = useAuthStore();

defineProps({
  show: Boolean,
});

defineEmits(["close", "request-for-day"]);

const panelRef = ref(null);

defineExpose({
  reset: () => panelRef.value?.reset(),
});
</script>
