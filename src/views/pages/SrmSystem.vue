<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="sticky top-0 h-screen w-[370px] shrink-0 z-10 bg-white dark:bg-gray-800 shadow-lg">
      <SideBar @student-selected="handleStudentSelected" />
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
      <Loader :show="studentStore.loadingData" />

      <div v-if="!student" class="text-center mt-20 text-gray-600 dark:text-gray-300">
        <img src="@/assets/search.png" class="w-64 mx-auto mb-6 opacity-90" />
        <p class="text-lg">
          Start by entering the student's ID above to view detailed information.
        </p>
      </div>

      <div v-if="student" class="max-w-6xl mx-auto space-y-6">
    
        <div class="min-w-0">
          <div class="max-w-6xl mx-auto">
            <div
              class="flex justify-around gap-1 mb-6 p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-[#6c63ff]/20">
              <button 
                v-for="tab in filteredTabs" 
                :key="tab.name" 
                @click="selectTab(tab.name, tab.label)"
                :disabled="loading && cardName !== tab.label" 
                :class="[
                  'px-5 py-3  rounded-xl font-medium text-lg sm:text-base transition-all duration-200 relative flex items-center gap-1 min-w-[120px] justify-center',
                  loading && cardName !== tab.label
                    ? 'opacity-50 cursor-not-allowed'
                    : cardName === tab.label
                    ? 'bg-gradient-to-r from-[#6c63ff] to-[#5a52e0] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#6c63ff] dark:hover:text-[#a39eff]',
                ]">
                {{ tab.label }}
                <span :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    cardName === tab.label
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200',
                  ]">
                  {{ tab.count || 0 }}
                </span>
              </button>
            </div>

            <CardDetails :cardName="cardName" :headers="headers" :data="data" :loading="loading" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onUnmounted } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import { useAuthStore } from "@/stores/auth";
import Loader from "@/components/global/Loader.vue";
import SideBar from "@/components/srmDashboard/SideBar.vue";
import {
  ClipboardList,
  UsersRound,
  AlarmClock,
  FileText,
  ArrowLeft
} from "lucide-vue-next";
import CardDetails from "../../components/srmDashboard/CardDetails.vue";

const emitter = inject("emitter", null);

const studentStore = useStudentStore();
const authStore = useAuthStore();
const student = ref(null);
const cardName = ref("");
const data = ref([]);
const loading = ref(false);
const headers = ref([]);
const tabs = ref([]);

const studentInfo = computed(() => student.value?.student || {});
const reservationInfo = computed(() => student.value?.reservation?.[0] || {});


const tabPermissions = {
  requests: '',
  complaints: '', 
  payments: 'view-payments',
  groups: 'view-groups',
  attendance: '',
  invoices: ''
};


const filteredTabs = computed(() => {
  return tabs.value.filter(tab => {
    const permission = tabPermissions[tab.name];
    return permission ? authStore.hasPermission(permission) : true;
  });
});

const selectTab = async (name, label) => {

  const permission = tabPermissions[name];
  if (permission && !authStore.hasPermission(permission)) {
    console.warn(`User does not have permission: ${permission}`);
    return;
  }

  cardName.value = label;
  loading.value = true;

  try {
    await studentStore.fetchDataStuden(name);
    const fetchedData = studentStore.studentData;
    data.value = Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []);

    headers.value =
      columnMap[name]?.length > 0
        ? columnMap[name]
        : data.value.length > 0
        ? Object.keys(data.value[0])
        : [];
  } catch (error) {
    console.error("Error fetching tab data:", error);
    data.value = [];
    headers.value = [];
  } finally {
    loading.value = false;
  }
};

if (emitter) {
  emitter.on("refresh", () => {
    const currentTab = filteredTabs.value.find((t) => t.label === cardName.value);
    if (currentTab) {
      selectTab(currentTab.name, currentTab.label);
    }
  });
}

watch(student, (newVal) => {
  if (newVal) {
    cardName.value = "";
    data.value = [];
    headers.value = [];

    const counts = newVal?.counts || {};

    tabs.value = [
      { name: "requests", label: "Requests", count: counts.requests || 0 },
      { name: "complaints", label: "Complains", count: counts.complaints || 0 },
      { name: "payments", label: "Deadlines", count: counts.payments || 0 },
      {
        name: "groups",
        label: "Groups",
        count: `${counts.doneCourses || 0}/${counts.groups || 0}`,
      },
      { name: "attendance", label: "Attendance" , count: counts.doneCourses || 0 },
      { name: "invoices", label: "Invoices", count: counts.invoices },
      { name: "documents", label: "Papers", count: counts.documents || 0 },
    ];
  }
});

const handleStudentSelected = (studentData) => {
  student.value = studentData;
};

const columnMap = {
  groups: ["name", "code", "type", "start_date", "student_start", "total_lec"],
  payments: ["amount", "paid_amount", "due_date", "paid_date", "status"],
  requests: [],
  lectures: ["name", "notes", "start_time", "end_time", "status"],
  attendance: ["date", "group_name", "status"],
};

onUnmounted(() => {
  if (emitter && emitter.off) {
    emitter.all?.delete?.("refresh");
  }
});
</script>