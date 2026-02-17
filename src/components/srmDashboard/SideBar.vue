<template>
  <div class="flex min-h-screen bg-gray-100">
    <aside class="w-110 bg-white shadow-lg shadow-blue-300 flex flex-col overflow-y-auto overflow-x-hidden h-screen">
      <div class="max-w-3xl mx-auto mb-5">
        <div class="relative mt-3">
          <input v-model="studentId" @keyup.enter="handleSearch" type="text" :placeholder="searchByOther
              ? 'Enter Phone / Email / National ID...'
              : 'Enter Student ID...'
            " class="input-field pl-10 shadow-sm" />

          <button @click="handleSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6c63ff] transition">
            <Search v-if="!isLoading" class="w-5 h-5 font-bold cursor-pointer hover:w-6" />
            <div v-if="isLoading" class="flex justify-center items-center">
              <div class="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </button>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" v-model="searchByOther" class="sr-only" />
            <div class="relative w-12 h-6 bg-gray-300 rounded-full transition-colors duration-300"
              :class="{ 'bg-indigo-500': searchByOther }">
              <div class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                :class="searchByOther ? 'left-6' : 'left-0.5'"></div>
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
        <p v-if="student?.scholar_status === 'canceled'"
          class="mb-2 text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block">
          ❌ This student has been canceled
        </p>

        <div class="flex justify-center gap-2">
          <span v-if="student?.scholarship?.study_type"
            class="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
            {{ student?.scholarship?.study_type }}
          </span>
          <span v-if="student?.scholar_status"
            class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            {{ student?.scholar_status }}
          </span>
          <span v-if="student?.careerType"
            class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            {{ student?.careerType }}
          </span>
        </div>

        <div v-show="student?.name && student?.st_num && student?.ID_number" class="text-center">
          <h2 class="mt-2 text-xl font-bold text-gray-800">
            <template v-if="!isEditMode">
              {{ student?.name || "John Doe" }}
            </template>
            <input v-else ref="nameInput" v-model="editForm.name" type="text"
              class="text-xl font-bold text-gray-800 bg-gray-50 border border-indigo-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
            <template v-if="!isEditMode">
              {{ studentAllData?.student?.marketing_code }}
            </template>
            <input v-else v-model="editForm.marketing_code" type="text"
              class="text-sm text-gray-600 bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </p>
          <p class="text-sm text-gray-600">
            <strong> ID:</strong>
            <template v-if="!isEditMode">
              {{ student?.ID_number || "N/A" }}
            </template>
            <input v-else v-model="editForm.ID_number" type="text"
              class="text-sm text-gray-600 bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </p>
        </div>

        <div class="flex gap-3 mt-4">
          <div class="flex items-center space-x-2 relative group">
            <Share2 color="red" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              Share
            </div>
          </div>

          <div class="flex items-center space-x-2 relative group">
            <QrCode color="green" class="cursor-pointer hover:scale-110 transition" @click="showConfirmModal = true" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              Send QR
            </div>
          </div>

          <div class="flex items-center space-x-2 relative group">
            <AppWindow color="blue" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              App
            </div>
          </div>

          <div v-if="student?.name" class="flex items-center space-x-2 relative group">
            <Edit v-if="!isEditMode && authStore.hasPermission('edit-student')" color="orange" class="cursor-pointer hover:scale-110 transition"
              @click="enterEditMode" />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              Edit
            </div>
          </div>
        </div>
      </div>

      <div class="p-4" v-if="
        student &&
        (student.email ||
          student.phones?.length ||
          student.major ||
          student.company ||
          student.grade ||
          student.faculity)
      ">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-center text-indigo-400">
            General & Personal Information
          </h3>
          <div v-if="isEditMode" class="flex gap-2">
            <button @click="saveChanges" :disabled="!hasChanges || studentUpdateStore.loading"
              class="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="studentUpdateStore.loading">Saving...</span>
              <span v-else>Save</span>
            </button>
            <button @click="cancelEdit" class="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>

        <!-- Phones -->
        <div class="flex items-center space-x-2 mb-2">
          <strong>Phones:</strong>
          <template v-if="!isEditMode">
            <span>{{ student?.phones?.join(" / ") }}</span>
            <div class="relative group">
              <MessageSquareText class="w-5 h-5 transition text-green-500 cursor-pointer hover:text-green-800"
                @click="showSmsModal = true" />
              <div
                class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Send SMS
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex-1">
              <input v-model="phoneInput" @blur="updatePhones" type="text" placeholder="Enter phones separated by comma"
                class="w-full text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p class="text-xs text-gray-500 mt-1">
                Separate multiple phones with comma
              </p>
            </div>
          </template>
        </div>

        <!-- Email -->
        <div class="flex items-center space-x-2 mb-2">
          <strong>Email:</strong>
          <template v-if="!isEditMode">
            <span>{{ student?.email }}</span>
            <div class="relative group">
              <Mail class="w-5 h-5 transition cursor-pointer text-[#6c63ff] hover:text-blue-800"
                @click="showEmailModal = true" />
              <div
                class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Send Email
              </div>
            </div>
          </template>
          <template v-else>
            <input v-model="editForm.email" type="email"
              class="flex-1 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </template>
        </div>

        <!-- Company -->
        <div class="mb-2">
          <strong>Company:</strong>
          <template v-if="!isEditMode">
            <span class="ml-2">{{ student?.company || "No Available" }}</span>
          </template>
          <template v-else>
            <input v-model="editForm.company" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </template>
        </div>

        <!-- Major -->
        <div class="mb-2">
          <strong>Major:</strong>
          <template v-if="!isEditMode">
            <span class="ml-2">{{ student?.major || "No Available" }}</span>
          </template>
          <template v-else>
            <input v-model="editForm.major" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </template>
        </div>

        <!-- Grade -->
        <div class="mb-2">
          <strong>Grade:</strong>
          <template v-if="!isEditMode">
            <span class="ml-2">{{ student?.grade || "N/A" }}</span>
          </template>
          <template v-else>
            <input v-model="editForm.grade" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </template>
        </div>

        <!-- Faculty -->
        <div class="mb-2">
          <strong>Faculty:</strong>
          <template v-if="!isEditMode">
            <span class="ml-2">{{ student?.faculity || "No Available" }}</span>
          </template>
          <template v-else>
            <input v-model="editForm.faculity" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </template>
        </div>

        <!-- Additional fields in edit mode -->
        <template v-if="isEditMode">
          <div class="mb-2">
            <strong>Birth Date:</strong>
            <input v-model="editForm.birth_date" type="date"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="mb-2">
            <strong>Career Type:</strong>
            <input v-model="editForm.careerType" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          <!-- <div class="mb-2">
            <strong>Profile Picture URL:</strong>
            <input v-model="editForm.ppUrl" type="text"
              class="ml-2 text-sm bg-gray-50 border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
          </div> -->
        </template>
      </div>
    </aside>

    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl border border-indigo-500 text-center max-w-md">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          Are you sure you want to send the QR code?
        </h3>
        <p class="text-gray-600 mb-4">
          The QR code will be sent via email to {{ student?.email }}
        </p>
        <div class="flex justify-center gap-3 mt-3">
          <button @click="sendQrEmail"
            class="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
            yes
          </button>
          <button @click="showConfirmModal = false"
            class="bg-gray-300 hover:bg-gray-400 cursor-pointer text-gray-800 px-4 py-2 rounded-lg">
            No
          </button>
        </div>
      </div>
    </div>

    <SendMessageModal v-if="showEmailModal" :visible="showEmailModal" type="email" :recipient="student?.email"
      :loading="messageStore.loading" @send="handleEmailSend" @close="showEmailModal = false" />

    <SendMessageModal v-if="showSmsModal" :visible="showSmsModal" type="sms" :recipient="student?.phones?.join(' / ')"
      :loading="messageStore.loading" @send="handleSmsSend" @close="showSmsModal = false" />



    <StudentPickerModal v-model:visible="showPicker" :students="studentsList" @confirm="handlePickStudent" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import StudentPickerModal from "./StudentPickerModal.vue";
import { useStudentStore } from "@/stores/SearchStudent";
import { useStudentUpdateStore } from "@/stores/studentUpdateStore";
import { useAuthStore } from "@/stores/auth";

import {
  Mail,
  Share2,
  QrCode,
  AppWindow,
  Search,
  MessageSquareText,
  Edit,
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

// Edit mode states
const isEditMode = ref(false);
const editForm = ref({});
const originalData = ref({});
const phoneInput = ref("");
const nameInput = ref(null);

const studentStore = useStudentStore();
const studentUpdateStore = useStudentUpdateStore();
const messageStore = useStudentMessageStore();
const authStore = useAuthStore();

const emit = defineEmits(["student-selected"]);

// Computed to check if there are changes
const hasChanges = computed(() => {
  if (!isEditMode.value) return false;

  // Compare each field
  const fieldsToCompare = [
    "name",
    "email",
    "company",
    "major",
    "grade",
    "faculity",
    "ID_number",
    "marketing_code",
    "birth_date",
    "careerType",
    "scholar_status",
    "ppUrl",
  ];

  for (const field of fieldsToCompare) {
    const originalValue = originalData.value[field] || "";
    const editValue = editForm.value[field] || "";
    if (String(originalValue) !== String(editValue)) {
      return true;
    }
  }

  // Compare phones array
  const originalPhones = originalData.value.phones || [];
  const editPhones = editForm.value.phones || [];
  if (
    JSON.stringify(originalPhones.sort()) !==
    JSON.stringify(editPhones.sort())
  ) {
    return true;
  }

  return false;
});

const enterEditMode = () => {
  if (!student.value || !student.value.name) {
    notyf.error("No student selected");
    return;
  }

  isEditMode.value = true;

  // Initialize edit form with current student data
  editForm.value = {
    name: student.value.name || "",
    email: student.value.email || "",
    phones: student.value.phones ? [...student.value.phones] : [],
    company: student.value.company || "",
    major: student.value.major || "",
    grade: student.value.grade || "",
    faculity: student.value.faculity || "",
    ID_number: student.value.ID_number || "",
    marketing_code: studentAllData.value?.student?.marketing_code || "",
    birth_date: student.value.birth_date || "",
    careerType: student.value.careerType || "",
    scholar_status: student.value.scholar_status || "",
    ppUrl: student.value.ppUrl || "",
  };

  // Store original data for comparison
  originalData.value = JSON.parse(JSON.stringify(editForm.value));

  // Initialize phone input
  phoneInput.value = editForm.value.phones.join(", ");

  // Focus on first input
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus();
    }
  });
};

const cancelEdit = () => {
  isEditMode.value = false;
  editForm.value = {};
  originalData.value = {};
  phoneInput.value = "";
};

const updatePhones = () => {
  if (phoneInput.value.trim()) {
    editForm.value.phones = phoneInput.value
      .split(",")
      .map((phone) => phone.trim())
      .filter((phone) => phone.length > 0);
  } else {
    editForm.value.phones = [];
  }
};

const getChangedFields = () => {
  const changes = {};

  const fieldsToCheck = [
    "name",
    "email",
    "company",
    "major",
    "grade",
    "faculity",
    "ID_number",
    "marketing_code",
    "birth_date",
    "careerType",
    "scholar_status",
    "ppUrl",
  ];

  for (const field of fieldsToCheck) {
    const originalValue = originalData.value[field] || "";
    const editValue = editForm.value[field] || "";
    if (String(originalValue) !== String(editValue)) {
      changes[field] = editValue;
    }
  }

  // Check phones
  const originalPhones = originalData.value.phones || [];
  const editPhones = editForm.value.phones || [];
  if (
    JSON.stringify(originalPhones.sort()) !==
    JSON.stringify(editPhones.sort())
  ) {
    changes.phones = editPhones;
  }

  return changes;
};

const saveChanges = async () => {
  if (!hasChanges.value) {
    notyf.info("No changes to save");
    return;
  }

  if (!studentId.value || !student.value?.id) {
    notyf.error("No student selected");
    return;
  }

  try {
    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      notyf.info("No changes to save");
      cancelEdit();
      return;
    }

    await studentUpdateStore.updateStudent(student.value.id, changedFields);

    // Refresh student data
    await studentStore.fetchStudent(studentId.value);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;
    emit("student-selected", studentAllData.value);

    cancelEdit();
  } catch (error) {
    console.error("Error updating student:", error);
  }
};

const searchStudent = async () => {
  try {
    await studentStore.fetchStudent(studentId.value);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;
    emit("student-selected", studentAllData.value);
    // Exit edit mode if active
    if (isEditMode.value) {
      cancelEdit();
    }
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
    `${modalType.value === "email" ? "Email" : "SMS"
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
