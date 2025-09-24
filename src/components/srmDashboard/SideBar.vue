<template>
  <div class="flex min-h-screen bg-gray-100">
    <aside
      class="w-110 bg-white shadow-lg shadow-blue-300 flex flex-col overflow-y-auto overflow-x-hidden h-screen"
    >
      <div class="max-w-3xl mx-auto mb-5">
        <div class="relative mt-3">
          <input
            v-model="studentId"
            @keyup.enter="handleSearch"
            type="text"
            :placeholder="
              searchByOther
                ? 'Enter Phone / Email / National ID...'
                : 'Enter Student ID...'
            "
            class="input-field pl-10 shadow-sm"
          />

          <button
            @click="handleSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6c63ff] transition"
          >
            <Search
              v-if="!isLoading"
              class="w-5 h-5 font-bold cursor-pointer hover:w-6"
            />
            <div v-if="isLoading" class="flex justify-center items-center">
              <div
                class="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </button>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <label class="flex items-center cursor-pointer">
            <!-- Hidden Checkbox -->
            <input type="checkbox" v-model="searchByOther" class="sr-only" />

            <!-- Background -->
            <div
              class="relative w-12 h-6 bg-gray-300 rounded-full transition-colors duration-300"
              :class="{ 'bg-indigo-500': searchByOther }"
            >
              <!-- Circle with Dynamic Position -->
              <div
                class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                :class="searchByOther ? 'left-6' : 'left-0.5'"
              ></div>
            </div>

            <span class="ml-3 text-sm text-gray-700">
              Search by
              <span class="font-semibold text-indigo-500"
                >Phone / Email / ID</span
              >
            </span>
          </label>
        </div>
      </div>

      <div class="flex flex-col pb-3 items-center border-b px-4 text-center">
        <p
          v-if="student?.scholar_status === 'canceled'"
          class="mb-2 text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block"
        >
          ❌ This student has been canceled
        </p>

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
          <span
            v-if="student?.careerType"
            class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
          >
            {{ student?.careerType }}
          </span>
        </div>
        <div
          v-show="student?.name && student?.st_num && student?.ID_number"
          class="text-center"
        >
          <h2 class="mt-2 text-xl font-bold text-gray-800">
            {{ student?.name || "John Doe" }}
          </h2>
          <p class="text-sm text-gray-600">
            <strong>Student No:</strong> {{ student?.st_num || "343455" }}
          </p>
          <p class="text-sm text-gray-600">
            <strong>Scholarship:</strong>
            {{ studentAllData?.student?.scholarship?.name }}
          </p>
          <p class="text-sm text-gray-600">
            <strong>Scholarship Code:</strong>
            {{ studentAllData?.student?.marketing_code }}
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

    <StudentPickerModal
      v-model:visible="showPicker"
      :students="studentsList"
      @confirm="handlePickStudent"
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
import StudentPickerModal from "./StudentPickerModal.vue";

const emit = defineEmits(["student-selected"]);

const studentStore = useStudentStore();
const searchByOther = ref(false);
const showPicker = ref(false);
const studentsList = ref([]);
const showModal = ref(false);
const modalType = ref("email");
const isLoading = ref(false);

const searchStudent = async () => {
  try {
    await studentStore.fetchStudent(studentId.value);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;
    emit("student-selected", studentAllData.value);
  } catch (error) {
    student.value = {};
    studentAllData.value = null;
    emit("student-selected", studentAllData.value);
    console.error("Error fetching student:", error);
  }
};


const searchStudentByOther = async () => {
  try {
    isLoading.value = true; 
    await studentStore.fetchStudentByOther(studentId.value);

    studentsList.value = studentStore.studentsList;

    if (studentsList.value.length > 0) {
      showPicker.value = true;
    } else {
      console.warn("No students found");
    }
  } catch (error) {
    console.error("Error fetching student by other:", error);
  } finally {
    isLoading.value = false; 
  }
};

const handlePickStudent = (picked) => {
  if (picked?.st_num) {
    studentId.value = picked.st_num;
    searchStudent();
  }
};

const handleSearch = () => {
  if (searchByOther.value) {
    searchStudentByOther();
  } else {
    searchStudent();
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
