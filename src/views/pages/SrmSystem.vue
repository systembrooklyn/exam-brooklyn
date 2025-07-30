<!-- src/pages/StudentProfile.vue  (أو SrmSystem.vue) -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <!-- Sidebar -->
    <div class="sticky top-0 h-screen w-[360px] shrink-0 z-10">
      <SideBar @student-selected="handleStudentSelected" />
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8 overflow-y-auto">
      <Loader :show="studentStore.loadingData" />

      <div
        v-if="!student"
        class="text-center mt-20 text-gray-600 dark:text-gray-300"
      >
        <img src="@/assets/search.png" class="w-64 mx-auto mb-6 opacity-90" />
        <p class="text-lg">
          Start by entering the student's ID above to view detailed information.
        </p>
      </div>

      <!-- Student Profile Card -->
      <div v-if="student" class="max-w-5xl mx-auto space-y-6">
        <!-- Basic Info -->
        <div
          class="bg- max-w-4xl mx-auto dark:bg-gray-800 p-3 rounded-2xl shadow-md"
        >
          <h3
            class="text-lg font-semibold mb-2 text-[#6c63ff] dark:text-gray-200 text-center"
          >
            Scholarship & Reserv Information
          </h3>
          <div
            class="grid grid-cols-3 pt-3 gap-4 text-gray-700 dark:text-gray-300"
          >
            <p v-if="student?.student?.scholarship?.name">
              <strong>Scholarship:</strong>
              {{ student.student.scholarship.name }}
            </p>

            <p v-if="student?.student?.careerType">
              <strong>Career Type:</strong> {{ student.student.careerType }}
            </p>
            <p v-if="student?.student?.scholar_status">
              <strong>Status:</strong> {{ student?.student?.scholar_status }}
            </p>
            <p v-if="student?.student?.scholarship?.study_type">
              <strong>Study Type:</strong>
              {{ student.student.scholarship.study_type }}
            </p>

            <p v-if="student?.student?.marketing_code">
              <strong>Scholarship Code:</strong>
              {{ student.student.marketing_code || "N/A" }}
            </p>

            <p v-if="reservationInfo.branch?.name">
              <strong>Branch:</strong>
              {{ reservationInfo.branch.name }}
            </p>

            <p v-if="reservationInfo.called_by?.name">
              <strong>Called By:</strong>
              {{ reservationInfo.called_by.name }}
            </p>

            <p v-if="reservationInfo.called_time">
              <strong>Called Time:</strong>
              {{ reservationInfo.called_time }}
            </p>

            <p v-if="reservationInfo.registered_by?.name">
              <strong>Registered By:</strong>
              {{ reservationInfo.registered_by.name }}
            </p>

            <p v-if="reservationInfo.registered_at">
              <strong>Registered At:</strong>
              {{ reservationInfo.registered_at }}
            </p>

            <p v-if="reservationInfo.reserved_by?.name">
              <strong>Reservation By:</strong>
              {{ reservationInfo.reserved_by.name }}
            </p>

            <p v-if="reservationInfo.reserved_time">
              <strong>Reservation Time:</strong>
              {{ reservationInfo.reserved_time }}
            </p>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="mx-auto">
          <div
            class="flex justify-around min-w-full sm:min-w-md md:min-w-4xl gap-1 mx-auto mt-6 mb-6 p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-[#6c63ff]/20 transition-all duration-300"
          >
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="selectTab(tab.name, tab.label)"
              :disabled="loading && cardName !== tab.label"
              :class="[
                'px-5 py-3 rounded-xl font-medium text-lg sm:text-base transition-all duration-200 relative flex items-center gap-1 min-w-[100px]',
                loading && cardName !== tab.label
                  ? 'opacity-50 cursor-not-allowed'
                  : cardName === tab.label
                  ? 'bg-gradient-to-r from-[#6c63ff] to-[#5a52e0] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#6c63ff] dark:hover:text-[#a39eff]',
              ]"
            >
              {{ tab.label }}
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded-full',
                  cardName === tab.label
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200',
                ]"
              >
                {{ tab.count || 0 }}
              </span>
            </button>
          </div>

          <!-- Table Section -->
          <div class="mx-auto min-w-5xl flex justify-center">
            <CardDetails
              :cardName="cardName"
              :headers="headers"
              :data="data"
              :loading="loading"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import Loader from "@/components/global/Loader.vue";
import SideBar from "@/components/srmDashboard/SideBar.vue";

import {
  ClipboardList,
  UsersRound,
  AlarmClock,
  FileText,
  ArrowLeft,
} from "lucide-vue-next";

import CardDetails from "../../components/srmDashboard/CardDetails.vue";
import { computed, watch } from "vue";

const studentStore = useStudentStore();
const student = ref(null);
const cardName = ref("");
const data = ref([]);
const loading = ref(false);
const headers = ref([]);
const tabs = ref([]);

const reservationInfo = computed(() => {
  return student.value?.reservation?.[0] || {};
});

const selectTab = async (name, label) => {
  cardName.value = label;
  loading.value = true;

  try {
    await studentStore.fetchDataStuden(name);
    data.value = studentStore.studentData || [];
    console.log("Fetched Data:", data.value);

    headers.value =
      columnMap[name]?.length > 0
        ? columnMap[name]
        : data.value.length > 0
        ? Object.keys(data.value[0])
        : [];

    console.log("Headers:", headers.value);
  } catch (error) {
    console.error("Error fetching tab data:", error);
    data.value = [];
    headers.value = [];
  } finally {
    loading.value = false;
  }
};

watch(student, (newVal) => {
  if (newVal) {
    cardName.value = "";
    data.value = [];
    headers.value = [];

    const counts = newVal?.counts || {};

    tabs.value = [
      { name: "requests", label: "Requests", count: counts.requests || 0 },
      {
        name: "complaints",
        label: "Complaints",
        count: counts.complaints || 0,
      },

      { name: "payments", label: "Deadlines", count: counts.payments || 0 },
      {
        name: "groups",
        label: "Groups",
        count: `${counts.doneCourses || 0}/${counts.groups || 0}`,
      },
      { name: "attendance", label: "Attendance", count: counts.attendance },
      { name: "invoices", label: "Invoices", count: counts.invoices },
    ];
  }
});

const handleStudentSelected = (studentData) => {
  console.log("Selected Student Data:", studentData);

  student.value = studentData;

  console.log("Received student from child:", studentData);
};

const columnMap = {
  groups: ["name", "code", "type", "start_date", "student_start", "total_lec"],
  payments: ["amount", "paid_amount", "due_date", "paid_date", "status"],
  requests: [],
  lectures: ["name", "notes", "start_time", "end_time", "status"],
  attendance: ["date", "group_name", "status"],
};
</script>
