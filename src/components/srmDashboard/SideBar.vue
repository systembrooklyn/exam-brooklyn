<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-110 bg-white shadow-lg shadow-blue-300 flex flex-col">
      <div class="max-w-3xl mx-auto mb-10">
        <div class="relative mt-6">
          <input
            v-model="studentId"
            @keyup.enter="searchStudent"
            type="text"
            placeholder="Enter Student ID..."
            class="w-full p-2 pl-12 rounded-xl shadow-md border border-[#6c63ff] focus:ring-non focus:px-10 focus:outline-none transition"
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
      <div class="flex flex-col items-center py-3 border-b px-4 text-center">
        <img
          :src="
            student?.ppUrl ||
            'https://st2.depositphotos.com/1531183/5770/v/950/depositphotos_57709697-stock-illustration-male-person-silhouette-profile-picture.jpg'
          "
          class="w-24 h-24 rounded-full shadow-md"
        />
        <div v-show="student.name && student.st_num && student.ID_number" class="text-center">
          <h2 class="mt-3 text-xl font-bold text-gray-800">
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
            <Share2 color="red" @click="openModal('share')" />
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

      <!-- Contact Buttons -->
      <div
        class="py-4 border-b p-3"
     v-if="student && (student.email || student.phones?.length || student.major || student.company || student.grade || student.faculity)"
      >
        <h3 class="font-bold text-center mb-3 text-indigo-400">
          General & Personal Information
        </h3>
        <div class="flex items-center space-x-2">
          <strong>Email:</strong>

          <span>{{ student?.email }}</span>
          <div class="relative group">
            <Mail
              @click="openModal('email')"
              class="w-5 h-5 transition text-[#6c63ff] hover:text-blue-800"
            />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Send Email
            </div>
          </div>
          <!-- Tooltip -->
        </div>
        <div class="flex items-center space-x-2 mt-2">
          <strong>Phones:</strong>
          <!-- Display phones as a list -->
          <span>{{ student?.phones?.join(" / ") }}</span>
          <div class="relative group">
            <Phone
              @click="openModal('phone')"
              class="w-5 h-5 transition text-green-500 hover:text-green-800"
            />
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-300 text-primary font-bold text-sm px-2 w-25 text-center py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
            >
              Send SMS
            </div>
          </div>
        </div>
        <div class="space-y-2 mt-2">
          <div class="flex items-center space-x-4">
            <p>
              <strong>Major:</strong> {{ student?.major || "No Available" }}
            </p>

            <p>
              <strong>Company:</strong>
              {{ student?.company || "No Available" }}
            </p>
          </div>

          <div class="flex items-center space-x-4">
            <p><strong>Grade:</strong> {{ student?.grade }}</p>

            <p>
              <strong>Faculty:</strong>
              {{ student?.faculity || "No Available" }}
            </p>
          </div>

         
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 pt-6 space-y-2">
        <NavItem
          v-for="item in navItems"
          class="text-red"
          :key="item.label"
          v-bind="item"
        />
      </nav>
    </aside>

    <!-- Message Modal -->
    <MessageModal
      v-if="student"
      :type="modalType"
   :recipient="modalType === 'share' ? student.email : (modalType === 'email' ? student.email : student.phones?.join(' / '))"
      :visible="showModal"
      @update:visible="showModal = $event"
      @send="handleSend"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import MessageModal from "./MessageModal.vue";
import {
  LayoutDashboard,
  Mail,
  Phone,
  Share2,
  QrCode,
  AppWindow,
  Search,
} from "lucide-vue-next";
import NavItem from "./NavItem.vue";

const studentId = ref("");
const student = ref({});
const studentAllData = ref(null); 
import { useStudentStore } from "@/stores/studentStore";

const emit = defineEmits(['student-selected']);


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
  await studentStore.fetchStudent(studentId.value);
  student.value = studentStore.student.student;
  studentAllData.value = studentStore.student; 
  console.log("Selected Student:", student.value);
  console.log("Student ID:", studentId.value);
  
  
  emit('student-selected', studentAllData.value); 
};


// watch(
//   () => studentId.value,
//   (newVal, oldVal) => {
//     cardName.value = "";
//   }
// );
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
