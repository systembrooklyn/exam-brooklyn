<!-- src/pages/StudentProfile.vue  (أو SrmSystem.vue) -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <SideBar
      :img="student?.student.ppUrl || defaultImg"
      :name="student?.student.name || 'Ms. John Doe'"
      :num="String(student?.student.st_num || '123335')"
    />

    <!-- Main Content -->
    <div class="flex-1 p-8 overflow-y-auto">
      <Loader :show="studentStore.loading" />

      <!-- Search -->
      <div class="max-w-3xl mx-auto mb-10">
        <div class="flex gap-4 items-center">
          <input
            v-model="studentId"
            @keyup.enter="searchStudent"
            type="text"
            placeholder="Enter Student ID..."
            class="flex-1 p-3 rounded-xl shadow-md border border-gray-300 focus:ring-2 focus:outline-none transition"
          />
          <button
            @click="searchStudent"
            class="px-6 py-3 bg-[#6c63ff] text-white rounded-xl hover:bg-blue-800 transition font-semibold shadow-md"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Placeholder Before Search -->
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
      <div v-if="student && !cardName" class="max-w-5xl mx-auto space-y-6">
        <!-- Basic Info -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2
            class="text-2xl font-bold mb-10 text-[#6c63ff] text-center dark:text-gray-200"
          >
            General & Personal Information
          </h2>

          <div
            class="grid grid-cols-2 border-b pb-3 border-gray-400 gap-4 text-gray-700 dark:text-gray-300"
          >
            <p><strong>Name:</strong> {{ student.student.name }}</p>
            <p><strong>Email:</strong> {{ student.student.email }}</p>
            <p><strong>Phones:</strong> {{ student.student.phones }}</p>
            <p><strong>ID Number:</strong> {{ student.student.ID_number }}</p>
            <p><strong>Student Number:</strong> {{ student.student.st_num }}</p>
            <p><strong>Birth Date:</strong> {{ student.student.birth_date }}</p>
            <p><strong>Grade:</strong> {{ student.student.grade }}</p>
            <p>
              <strong>Company:</strong>
              {{ student.student.company || "No Available" }}
            </p>
            <p>
              <strong>Faculty:</strong>
              {{ student.student.faculity || "No Available" }}
            </p>
            <p>
              <strong>Major:</strong>
              {{ student.student.major || "No Available" }}
            </p>
          </div>
          <h3
            class="text-lg font-semibold mb-2 text-[#6c63ff] dark:text-gray-200 mt-3 text-center"
          >
            Scholarship & Reserv Information
          </h3>
          <div
            class="grid grid-cols-2 pt-3 gap-4 text-gray-700 dark:text-gray-300"
          >
            <p>
              <strong>Scholarship:</strong>
              {{ student.student.scholarship?.name || "N/A" }}
            </p>

            <p>
              <strong>Career Type:</strong> {{ student.student.careerType }}
            </p>
            <p>
              <strong>Marketing Code:</strong>
              {{ student.student.marketing_code }}
            </p>
            <p>
              <strong>Branch:</strong>
              {{ reservationInfo.branch?.name || "No Available" }}
            </p>
            <p>
              <strong>Called By:</strong>
              {{ reservationInfo.called_by?.name || "No Available" }}
            </p>
            <p>
              <strong>Called Time:</strong>
              {{ reservationInfo.called_time || "No Available" }}
            </p>
            <p>
              <strong>Registered By:</strong>
              {{ reservationInfo.registered_by?.name || "No Available" }}
            </p>
            <p>
              <strong>Registered At:</strong>
              {{ reservationInfo.registered_at || "No Available" }}
            </p>

            <p>
              <strong>Reservation By:</strong>
              {{ reservationInfo.reserved_by?.name || "No Available" }}
            </p>
            <p>
              <strong>Reservation Time:</strong>
              {{ reservationInfo.reserved_time || "No Available" }}
            </p>
          </div>
        </div>

        <ShareOptions />

        <!-- Student Data Sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataCard
            title="Requests"
            :items="student.counts.requests"
            :icon="ClipboardList"
            colorClass="bg-emerald-100 text-emerald-600"
            @click="goToDetails('requests')"
          />

          <DataCard
            title="Groups"
            :items="student.counts.groups"
            :icon="UsersRound "
            colorClass="bg-rose-100 text-rose-600"
            @click="goToDetails('groups')"
          />

          <DataCard
            title="Deadlines"
            :items="student.counts.payments"
            :icon="AlarmClock"
            colorClass="bg-amber-100 text-amber-600"
            @click="goToDetails('payments')"
          />

          <DataCard
            title="Papers"
            :items="student.counts.lectures"
            :icon="FileText"
            colorClass="bg-sky-100 text-sky-600"
            @click="goToDetails('lectures')"
          />

          <!-- <DataCard title="Documents" :items="student.counts.documents" :icon="Files"
            colorClass="bg-cyan-100 text-cyan-600" @click="goToDetails('documents')" /> -->
        </div>
      </div>

      <div v-if="cardName" class="f">
        <button
          @click="goBack"
          class="flex font-bold ms-8 items-center text-gray-700 dark:text-gray-300 hover:text-[#6c63ff] transition mb-6"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        <CardDetails
          v-if="cardName"
          :cardName="cardName"
          :headers="headers"
          :data="data"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import Loader from "@/components/global/Loader.vue";
import SideBar from "@/components/srmDashboard/SideBar.vue";
import DataCard from "@/components/srmDashboard/DataCard.vue";
import ShareOptions from "@/components/srmDashboard/ShareOptions.vue";

import {
  BookOpen,
  ClipboardList,
  UsersRound,
  AlarmClock,
  FileText,
  Files,
  ArrowLeft,
} from "lucide-vue-next";

import CardDetails from "./CardDetails.vue";
import { computed } from "vue";

const reservationInfo = computed(() => {
  return student.value?.reservation?.[0] || {};
});



function goBack() {
  cardName.value = "";
}

const studentStore = useStudentStore();
const studentId = ref("");
const student = ref(null);
const cardName = ref("");
const data = ref([]);
const loading = ref(false);
const headers = ref([]);

const columnMap = {
  groups: ["name", "code", "type", "start_date", "student_start", "total_lec"],
  payments: ["amount","paid_amount", "due_date", "paid_date" ,"status"],
  requests: [],
  lectures: ["name", "notes", "start_time", "end_time" ,"status"],
};


 watch(
  () => studentId.value,
  (newVal, oldVal) => {
    cardName.value = "";
  })
const goToDetails = async (name) => {
  cardName.value = name;
  loading.value = true;
  await studentStore.fetchDataStuden(name);
  data.value = studentStore.studentData || [];

  headers.value = columnMap[name] || Object.keys(data.value[0] || {});
  loading.value = false;
};

const defaultImg =
  "https://st2.depositphotos.com/1531183/5770/v/950/depositphotos_57709697-stock-illustration-male-person-silhouette-profile-picture.jpg";

const searchStudent = async () => {
  await studentStore.fetchStudent(studentId.value);
  student.value = studentStore.student;
};
</script>
