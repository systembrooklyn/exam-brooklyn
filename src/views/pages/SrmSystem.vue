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
            class="flex min-w-4xl gap-4 mx-auto border shadow shadow-[#6c63ff] rounded-2xl border-blue-400 justify-center font-bold text-lg dark:border-gray-600 mb-6"
          >
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="selectTab(tab.name, tab.label)"
              :class="[
                'px-4 py-2 font-semibold',
                cardName === tab.label
                  ? 'border-b-2 border-[#6c63ff] text-[#6c63ff]'
                  : 'text-gray-500 hover:text-[#6c63ff]',
              ]"
            >
              {{ tab.label }}
              <span class="text-primary">({{ tab.count || 0 }})</span>
            </button>
          </div>

          <!-- Table Section -->
          <div class="mx-auto main-w-5xl">
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
        count: `${counts.doneCourses|| 0}/${counts.groups || 0}`,
      },
      { name: "invoices", label: "Invoices", count: counts.invoices || 0 },
      // { name: "documents", label: "Documents", count: counts.documents || 0 },
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
};
</script>
