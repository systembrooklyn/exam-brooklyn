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
      <div v-if="student" class="max-w-4xl mx-auto space-y-6">
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
          </div>
        </div>

        <ShareOptions />

        <!-- Single Chart -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <StatsBarChart
            :labels="barLabels"
            :values="barValues"
            class="max-w-full"
          />
        </div>

        <!-- Student Data Sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataCard
            title="Courses"
            :items="`${student.counts.doneCourses}/${student.counts.courses}`"
            :icon="BookOpen"
            colorClass="bg-indigo-100 text-indigo-600"
              @click="goToDetails('courses')"
          />

          <DataCard
            title="Requests"
            :items="student.counts.requests"
            :icon="ClipboardList"
            colorClass="bg-emerald-100 text-emerald-600"
              @click="goToDetails('requests')"
          />

          <DataCard
            title="Complaint"
            :items="student.counts.groups"
            :icon="AlertCircle"
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

          <DataCard
            title="Documents"
            :items="student.counts.documents"
            :icon="Files"
            colorClass="bg-cyan-100 text-cyan-600"
              @click="goToDetails('documents')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* ---------------------------------- imports --------------------------------- */
import { ref, computed } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import Loader from "@/components/global/Loader.vue";
import SideBar from "@/components/srmDashboard/SideBar.vue";
import DataCard from "@/components/srmDashboard/DataCard.vue";
import ShareOptions from "@/components/srmDashboard/ShareOptions.vue";
import StatsBarChart from "@/components/srmDashboard/StatsBarChart.vue";
import {
  BookOpen,
  ClipboardList,
  AlertCircle,
  AlarmClock,
  FileText,
  Files,
  Users,
  CreditCard,
  Presentation,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();


/* ----------------------------- store & state ----------------------------- */
const studentStore = useStudentStore();
const studentId = ref("");
const student = ref(null);

const defaultImg =
  "https://st2.depositphotos.com/1531183/5770/v/950/depositphotos_57709697-stock-illustration-male-person-silhouette-profile-picture.jpg";

/* ----------------------------- search action ----------------------------- */
const searchStudent = async () => {
  await studentStore.fetchStudent(studentId.value);
  student.value = studentStore.student;
};

const goToDetails = (cardName) => {
  router.push({ name: "details", params: { cardName } });
};


/* --------------------------- chart computed data ------------------------- */
const barLabels = [
  "Courses",
  "Documents",
  "Done",
  "Groups",
  "Lectures",
  "Payments",
  "Requests",
];

const barValues = computed(() => {
  if (!student.value) return [];
  const { counts } = student.value;

  return [
    counts.courses || 0,
    counts.documents || 0,
    counts.doneCourses || 0,
    counts.groups || 0,
    counts.lectures || 0,
    Number(counts.payments?.split("/")[0] || 0),
    Number(counts.requests?.split("/")[0] || 0),
  ];
});
</script>
