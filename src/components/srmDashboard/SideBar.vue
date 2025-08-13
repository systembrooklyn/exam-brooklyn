<template>
   <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
       <aside class="w-110 bg-white shadow-lg shadow-blue-300 flex flex-col overflow-y-auto overflow-x-hidden h-screen">
      <div class="max-w-3xl mx-auto mb-5">
        <div class="relative mt-3">
          <input
            v-model="studentId"
            @keyup.enter="searchStudent"
            type="text"
            placeholder="Enter Student ID..."
            class="input-field pl-10 shadow-sm focus:"
          />

          <button
            @click="searchStudent"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6c63ff] transition"
          >
            <Search class="w-5 h-5 font-bold cursor-pointer hover:w-6" />
          </button>
        </div>
      </div>

      <!-- Profile -->
      <div class="flex flex-col pb-3 items-center border-b px-4 text-center">
        <p
          v-if="student?.scholar_status === 'canceled'"
          class="mb-2 text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block"
        >
          ❌ This student has been canceled
        </p>
        <!-- <img
          :src="
            student?.ppUrl ||
            'https://st2.depositphotos.com/1531183/5770/v/950/depositphotos_57709697-stock-illustration-male-person-silhouette-profile-picture.jpg'
          "
          class="w-24 h-24 rounded-full shadow-md"
        /> -->

        <div class="flex justify-center gap-2">
          <span
            v-if="student?.scholarship?.study_type"
            class="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700"
          >
            {{ student?.scholarship?.study_type }}
          </span>
          <span
            v-if="student?.scholar_status"
            class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
          >
            {{ student?.scholar_status }}
          </span>
        </div>
        <div
          v-show="student.name && student.st_num && student.ID_number"
          class="text-center"
        >
          <h2 class="mt-2 text-xl font-bold text-gray-800">
            {{ student?.name || "John Doe" }}
          </h2>
          <p class="text-sm text-gray-600">
            <strong>Student No:</strong> {{ student?.st_num || "343455" }}
          </p>
          <p class="text-sm text-gray-600">
            <strong> ID:</strong> {{ student?.ID_number || "N/A" }}
          </p>
        </div>
        <div class="flex gap-3 mt-4">
          <div class="flex items-center space-x-2 relative group">
            <Share2 color="red" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Share
            </div>
          </div>
          <div class="flex items-center space-x-2 relative group">
            <QrCode color="green" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              QR
            </div>
          </div>
          <div class="flex items-center space-x-2 relative group">
            <AppWindow color="blue" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              App
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="studentAllData?.student?.scholarship || reservationInfo"
        class="p-4 bg-white dark:bg-gray-800"
      >
        <h3 class="text-lg font-semibold mb-4 text-[#6c63ff] text-center">
          Scholarship & Reservation Information
        </h3>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 dark:text-gray-300"
        >
          <p v-if="studentAllData?.student?.scholarship?.name">
            <strong>Scholarship:</strong>
            {{ studentAllData.student.scholarship.name }}
          </p>

          <p v-if="studentAllData?.student?.careerType">
            <strong>Career Type:</strong>
            {{ studentAllData.student.careerType }}
          </p>

          <p v-if="studentAllData?.student?.scholar_status">
            <strong>Status:</strong> {{ studentAllData.student.scholar_status }}
          </p>

          <p v-if="studentAllData?.student?.scholarship?.study_type">
            <strong>Study Type:</strong>
            {{ studentAllData.student.scholarship.study_type }}
          </p>

          <p v-if="studentAllData?.student?.marketing_code">
            <strong>Scholarship Code:</strong>
            {{ studentAllData.student.marketing_code || "N/A" }}
          </p>

          <p v-if="reservationInfo?.branch?.name">
            <strong>Branch:</strong>
            {{ reservationInfo.branch.name }}
          </p>

          <p v-if="reservationInfo?.called_by?.name">
            <strong>Called By:</strong>
            {{ reservationInfo.called_by.name }}
          </p>

          <p v-if="reservationInfo?.called_time">
            <strong>Called Time:</strong>
            {{ reservationInfo.called_time }}
          </p>

          <p v-if="reservationInfo?.registered_by?.name">
            <strong>Registered By:</strong>
            {{ reservationInfo.registered_by.name }}
          </p>

          <p v-if="reservationInfo?.registered_at">
            <strong>Registered At:</strong>
            {{ reservationInfo.registered_at }}
          </p>

          <p v-if="reservationInfo?.reserved_by?.name">
            <strong>Reservation By:</strong>
            {{ reservationInfo.reserved_by.name }}
          </p>

          <p v-if="reservationInfo?.reserved_time">
            <strong>Reservation Time:</strong>
            {{ reservationInfo.reserved_time }}
          </p>
        </div>
      </div>

      <div
        class="p-4"
        v-if="
          student &&
          (student.email ||
            student.phones?.length ||
            student.major ||
            student.company ||
            student.grade ||
            student.faculity)
        "
      >
        <h3 class="font-bold text-center mb-2 text-indigo-400">
          General & Personal Information
        </h3>
        <div class="flex items-center space-x-2">
          <strong>Phones:</strong>
          <span>{{ student?.phones?.join(" / ") }}</span>
          <div class="relative group">
            <MessageSquareText
              class="w-5 h-5 transition text-green-500 cursor-not-allowed hover:text-green-800"
            />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Send SMS
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2 mt-1">
          <strong>Email:</strong>
          <span>{{ student?.email }}</span>
          <div class="relative group">
            <Mail
              class="w-5 h-5 transition cursor-not-allowed text-[#6c63ff] hover:text-blue-800"
            />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Send Email
            </div>
          </div>
        </div>

        <div class="space-y-2 mt-2">
          <p>
            <strong>Company:</strong>
            {{ student?.company || "No Available" }}
          </p>
          <p><strong>Major:</strong> {{ student?.major || "No Available" }}</p>
          <p><strong>Grade:</strong> {{ student?.grade }}</p>
          <p>
            <strong>Faculty:</strong>
            {{ student?.faculity || "No Available" }}
          </p>
        </div>
      </div>

      <!-- Scholarship & Reservation Information -->

      <!-- <nav class="flex-1 px-4 pt-6 space-y-2">
        <NavItem
          v-for="item in navItems"
          class="text-red"
          :key="item.label"
          v-bind="item"
        />
      </nav> -->
    </aside>

    <!-- Message Modal -->
    <MessageModal
      v-if="student"
      :type="modalType"
      :recipient="
        modalType === 'share'
          ? student.email
          : modalType === 'email'
          ? student.email
          : student.phones?.join(' / ')
      "
      :visible="showModal"
      @update:visible="showModal = $event"
      @send="handleSend"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import MessageModal from "./MessageModal.vue";

import {
  LayoutDashboard,
  Mail,
  Phone,
  Share2,
  QrCode,
  AppWindow,
  Search,
  MessageSquareText,
} from "lucide-vue-next";
import NavItem from "./NavItem.vue";

const studentId = ref("");
const student = ref({});
const studentAllData = ref(null);
import { useStudentStore } from "@/stores/SearchStudent";

const emit = defineEmits(["student-selected"]);

const studentStore = useStudentStore();
// Define the navigation items
const navItems = ref([
  { icon: LayoutDashboard, label: "Student Dashboard", to: "/srm" },
  // { icon: GraduationCap, label: 'Students', to: '/students' },
  // { icon: Users, label: 'Teachers', to: '/teachers' },
]);

const showModal = ref(false);
const modalType = ref("email");

const searchStudent = async () => {
  try {
    await studentStore.fetchStudent(studentId.value);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;

    console.log("Selected Student:", student.value);
    console.log("Student ID:", studentId.value);

    emit("student-selected", studentAllData.value);
  } catch (error) {
    student.value = {};
    studentAllData.value = null;
    emit("student-selected", studentAllData.value);
    console.error("Error fetching student:", error);
  }
};

const openModal = (type) => {
  modalType.value = type;
  showModal.value = true;
};

const handleSend = (message) => {
  const recipient =
    modalType.value === "email" || modalType.value === "share"
      ? student.value.email
      : student.value.phones?.join(", ");

  alert(
    `${
      modalType.value === "email" ? "Email" : "SMS"
    } sent to ${recipient}:\n${message}`
  );
};
</script>
