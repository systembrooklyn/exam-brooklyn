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
            <input type="checkbox" v-model="searchByOther" class="sr-only" />
            <div
              class="relative w-12 h-6 bg-gray-300 rounded-full transition-colors duration-300"
              :class="{ 'bg-indigo-500': searchByOther }"
            >
              <div
                class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                :class="searchByOther ? 'left-6' : 'left-0.5'"
              ></div>
            </div>
            <span class="ml-3 text-sm text-gray-700">
              Search by
              <span class="font-semibold text-indigo-500">
                Phone / Email / ID
              </span>
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
            <QrCode
              color="green"
              class="cursor-pointer hover:scale-110 transition"
              @click="showConfirmModal = true"
            />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Send QR
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
              class="w-5 h-5 transition text-green-500 cursor-pointer hover:text-green-800"
              @click="showSmsModal = true"
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
              class="w-5 h-5 transition cursor-pointer text-[#6c63ff] hover:text-blue-800"
              @click="showEmailModal = true"
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

    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white p-6 rounded-lg shadow-xl border border-indigo-500 text-center max-w-md"
      >
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          Are you sure you want to send the QR code?
        </h3>
        <p class="text-gray-600 mb-4">
          The QR code will be sent via email to {{ student?.email }}
        </p>
        <div class="flex justify-center gap-3 mt-3">
          <button
            @click="sendQrEmail"
            class="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            yes
          </button>
          <button
            @click="showConfirmModal = false"
            class="bg-gray-300 hover:bg-gray-400 cursor-pointer text-gray-800 px-4 py-2 rounded-lg"
          >
            No
          </button>
        </div>
      </div>
    </div>

<SendMessageModal
  v-if="showEmailModal"
  :visible="showEmailModal"
  type="email"
  :recipient="student?.email"
  :loading="messageStore.loading"
  @send="handleEmailSend"
  @close="showEmailModal = false"
/>

<SendMessageModal
  v-if="showSmsModal"
  :visible="showSmsModal"
  type="sms"
  :recipient="student?.phones?.join(' / ')"
  :loading="messageStore.loading"
  @send="handleSmsSend"
  @close="showSmsModal = false"
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
import StudentPickerModal from "./StudentPickerModal.vue";
import { useStudentStore } from "@/stores/SearchStudent";

import {
  Mail,
  Share2,
  QrCode,
  AppWindow,
  Search,
  MessageSquareText,
} from "lucide-vue-next";
import { useStudentMessageStore } from "../../stores/srmStore/studentMessageStore";
import notyf from "@/components/global/notyf";
import SendMessageModal from "./SendMessageModal.vue";

const studentId = ref("");
const student = ref({});
const studentAllData = ref(null);
const searchByOther = ref(false);
const showPicker = ref(false);
const studentsList = ref([]);
const modalType = ref("email");
const isLoading = ref(false);
const showConfirmModal = ref(false);
const showEmailModal = ref(false);
const emailBody = ref("");
const showSmsModal = ref(false);
const smsBody = ref("");

const studentStore = useStudentStore();
const messageStore = useStudentMessageStore();

const emit = defineEmits(["student-selected"]);

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
    showPicker.value = studentsList.value.length > 0;
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
  if (searchByOther.value) searchStudentByOther();
  else searchStudent();
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

const sendQrEmail = async () => {
  try {
    showConfirmModal.value = false;
    if (!studentId.value) {
      notyf.error("No student selected");
      return;
    }

    const payload = { st_num: studentId.value };
    await messageStore.sendMail(payload);
    notyf.success("Send QR successfully");
  } catch (error) {
    console.error(error);
  }
};



const handleEmailSend = async (message) => {
  try {
    if (!studentId.value) return notyf.error("No student selected");

    const payload = { st_num: studentId.value, emailBody: message };
    await messageStore.sendMail(payload);
    notyf.success("Email sent successfully!");
    showEmailModal.value = false;
  } catch (error) {
    notyf.error("Failed to send email");
    console.error(error);
  }
};

const handleSmsSend = async (message) => {
  try {
    if (!studentId.value) return notyf.error("No student selected");

    const payload = { st_num: studentId.value, body: message };
    await messageStore.sendSms(payload);
    notyf.success("SMS sent successfully!");
    showSmsModal.value = false;
  } catch (error) {
    notyf.error("Failed to send SMS");
    console.error(error);
  }
};

</script>
