<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <SideBar
      :img="student?.ppUrl || defaultImg"
      :name="student?.name || 'Ms. John Doe'"
      :num="String(student?.st_num || '123335')"
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
            class="flex-1 p-4 rounded-xl shadow-md border border-gray-300 focus:ring-2 focus:outline-none transition"
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
            class="grid grid-cols-2 border-b-1 pb-3 border-gray-400 gap-4 text-gray-700 dark:text-gray-300"
          >
            <p><strong>Name:</strong> {{ student.name }}</p>
            <p><strong>Email:</strong> {{ student.email }}</p>
            <p><strong>Phones:</strong> {{ student.phones }}</p>
            <p><strong>ID Number:</strong> {{ student.ID_number }}</p>
            <p><strong>Student Number:</strong> {{ student.st_num }}</p>
            <p><strong>Birth Date:</strong> {{ student.birth_date }}</p>

            <p><strong>Grade:</strong> {{ student.grade }}</p>
            <p>
              <strong>Company:</strong> {{ student.company || "No Avilabole" }}
            </p>
            <p>
              <strong>Faculity:</strong>
              {{ student.faculity || "No Avilabole" }}
            </p>
            <p><strong>Major:</strong> {{ student.major || "No Avilabole" }}</p>
          </div>
          <div
            class="grid grid-cols-2 pt-3 gap-4 text-gray-700 dark:text-gray-300"
          >
            <p>
              <strong>Scholarship:</strong>
              {{ student.scholarship?.name || "N/A" }}
            </p>

            <p><strong>Career Type:</strong> {{ student.careerType }}</p>
            <p><strong>Marketing Code:</strong> {{ student.marketing_code }}</p>
          </div>
        </div>

        <ShareOptions />

        <!-- Chart Section -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <div class="flex items-center justify-between">
            <PaymentsChart :payments="student.payments" />
            <TrainingProgressChart
              :completedCount="student.groups?.length || 0"
              :totalCount="12"
            />
          </div>
        </div>

        <!-- Student Data Sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataCard
            title="Requests"
            :items="student.requests"
            :img="ClipboardList"
          />
          <DataCard title="Complaint" :items="[]" :img="FileWarning" />
          <DataCard title="Deadlines" :items="[]" :img="AlarmClock" />
          <DataCard title="Papers" :items="[]" :img="FileText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import Loader from "@/components/global/Loader.vue";
import SideBar from "@/components/srmDashboard/SideBar.vue";
import DataCard from "@/components/srmDashboard/DataCard.vue";
import PaymentsChart from "../../components/srmDashboard/PaymentsChart.vue";
import TrainingProgressChart from "../../components/srmDashboard/TrainingProgressChart.vue";
import {
  FileText,
  AlarmClock,
  FileWarning,
  ClipboardList,
} from "lucide-vue-next";
import ShareOptions from "../../components/srmDashboard/ShareOptions.vue";

const studentStore = useStudentStore();
const studentId = ref("");
const student = ref(null);
const defaultImg =
  "https://st2.depositphotos.com/1531183/5770/v/950/depositphotos_57709697-stock-illustration-male-person-silhouette-profile-picture.jpg";

const searchStudent = async () => {
  await studentStore.fetchStudent(studentId.value);
  student.value = studentStore.student;
  console.log(student.value);
};
</script>
