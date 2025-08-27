<script setup>
import { onMounted, watch } from "vue";
import { useStudentStore } from "../../stores/studentStore";
import { IdCard, UserRound } from "lucide-vue-next";
import { useCourseStore } from "@/stores/courseStore";

import { useAuthStore } from "../../stores/auth";

const studentStore = useStudentStore();
const authStore = useAuthStore();

const courseStore = useCourseStore();

const handleSendOtp = () => {
  if (studentStore.studentId) {
    studentStore.sendOTP(studentStore.studentId);
  }
};
// watch(
//   () => studentStore.studentId,
//   (newId) => {
//     if (timeout) {
//       clearTimeout(timeout);
//     }

//     if (newId) {
//       timeout = setTimeout(() => {
//         studentStore.fetchCourses();
//       }, 500);
//     }
//   }
// );

onMounted(() => {
  courseStore.fetchCourses();
});

watch(
  () => studentStore.selectedModule,
  (newModule) => {
    if (newModule) {
      studentStore.fetchInstructors();
    }
  }
);

const submitForm = async () => {
  if (studentStore.studentOTP === "") {
    studentStore.otpMasg = "OTP is required.";
    studentStore.timer = 0;
    studentStore.otpMessageColor = "text-red-500";
    studentStore.loading = false;
    return;
  } else if (studentStore.studentOTP.length < 6) {
    studentStore.otpMasg = "OTP must be at least 6 digits.";
    studentStore.otpMessageColor.value = "text-red-500";
    studentStore.loading = false;
    return;
  } else {
    studentStore.otpMasg = "";
  }

  await studentStore.submitForm();
};
</script>

<template>
  <div
    class="bg-blue-50 dark:bg-gray-800 w-[100%] sm:w-[90%] rounded-xl pt-15 pb-5 px-5 relative"
  >
    <div
      class="p-10 bg-primary mb-5 w-10 h-10 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[50%]"
    >
      <UserRound
        color="white"
        size="100"
        class="w-10 h-10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[50%]"
      />
    </div>

    <div
      class="p-5 bg-white rounded-lg shadow-md dark:bg-gray-700 dark:text-white"
    >
      <div class="mb-5 relative">
        <label
          for="name-input"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Student ID:
        </label>

        <div class="relative">
          <IdCard
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size="20"
          />
          <input
            v-model="studentStore.studentId"
            @blur="studentStore.fetchCourses"
            :disabled="studentStore.otpSent"
            type="text"
            id="name-input"
            placeholder="Enter Your ID"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>
      <p v-if="studentStore.errorMessages" class="text-red-600">
        {{ studentStore.errorMessages }}
      </p>

      <div>
        <div class="mb-5" v-if="studentStore.loadingCourses">
          <p class="text-sm text-gray-500">Loading modules...</p>
        </div>
        <div class="mb-5" v-else-if="studentStore.courses.data">
          <label
            class="block text-sm font-medium dark:text-gray-300 text-gray-900"
          >
            Module Name:
          </label>

          <div class="flex items-center gap-2">
            <select v-model="studentStore.selectedModule" class="input-field">
              <option value="" disabled>Choose a Module</option>
              <option
                v-for="course in studentStore.courses.data"
                :key="course.id"
                :value="course.id"
              >
                {{ course.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- <div class="mb-5" v-if="studentStore.loadingCourses && showAllCourses">
          <p class="text-sm text-gray-500">Loading all courses...</p>
        </div>
        <div class="mb-5" v-else-if="showAllCourses">
          <label
            class="block text-sm font-medium dark:text-gray-300 text-gray-900"
          >
            Choose From All Courses:
          </label>
          <div class="flex items-center gap-2">
            <select v-model="studentStore.selectedModule" class="input-field">
              <option value="" disabled>Select a Course</option>
              <option
                v-for="course in courseStore.courses"
                :key="course.id"
                :value="course.id"
              >
                {{ course.name }}
              </option>
            </select>

            <button
              @click="showAllCourses = false"
              class="text-sm font-semibold text-gray-600 hover:underline"
            >
              Back
            </button>
          </div>
        </div> -->
      </div>

      <div class="mb-5" v-if="studentStore.loadingInstructors">
        <p class="text-sm text-gray-500">Loading instructors...</p>
      </div>
      <div class="mb-5" v-else-if="studentStore.instructors.data">
        <label
          for="instructor-select"
          class="block dark:text-gray-300 text-sm font-medium text-gray-900"
          >Instructor:</label
        >
        <select
          v-model="studentStore.selectedInstructor"
          id="instructor-select"
          class="input-field"
        >
          <option value="" disabled>Choose an Instructor</option>
          <option
            class="dark:bg-gray-800"
            v-for="instructor in studentStore.instructors.data"
            :key="instructor.id"
            :value="instructor.id"
          >
            {{ instructor.name }}
          </option>
        </select>
      </div>

      <div
        class="mb-5 relative"
        v-if="studentStore.selectedModule && studentStore.selectedInstructor"
      >
        <div class="flex justify-center">
          <button
            @click="handleSendOtp"
            :disabled="
              studentStore.loadingOtp ||
              !studentStore.studentId ||
              !studentStore.selectedModule ||
              !studentStore.selectedInstructor ||
              studentStore.otpSent ||
              studentStore.timer > 0
            "
            class="text-primary absolute top-4 z-10 right-3"
          >
            <span v-if="studentStore.loadingOtp">
              <i class="fa-solid fa-circle-notch fa-spin-pulse"></i>
            </span>
            <span
              v-else-if="studentStore.timer > 0"
              class="text-sm font-bold text-primary"
            >
              Resend in {{ studentStore.timer }}s
            </span>
            <span
              v-else
              class="text-sm font-bold text-primary hover:underline cursor-pointer"
            >
              Send OTP
            </span>
          </button>
        </div>

        <div class="relative">
          <!-- OTP Input -->
          <input
            type="text"
            v-model="studentStore.studentOTP"
            :placeholder="
              studentStore.timer > 0
                ? `Enter your OTP `
                : 'Enter OTP sent to your email'
            "
            :disabled="!studentStore.otpSent"
            class="bg-gray-50 border border-gray-300 mt-3 w-full text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <p :class="studentStore.otpMessageColor" class="mt-2">
          {{ studentStore.otpMasg }}
        </p>
      </div>

      <button
        v-show="
          studentStore.selectedModule &&
          studentStore.selectedInstructor &&
          authStore.hasPermission('start-exam')
        "
        @click="submitForm"
        type="button"
        class="bg-primary w-full py-2 rounded-2xl text-white font-semibold cursor-pointer hover:bg-blue-900 flex items-center justify-center"
        :disabled="
          studentStore.loading &&
          !studentStore.selectedModule &&
          !studentStore.selectedInstructor
        "
        :class="{
          'opacity-50 cursor-not-allowed':
            studentStore.loading &&
            !studentStore.selectedModule &&
            !studentStore.selectedInstructor,
        }"
      >
        <span v-if="studentStore.loading" class="loader"></span>
        <span v-else>Submit</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: border 0.3s ease;
}

.input-field:focus {
  border-color: #007bff;
}

.btn-primary {
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  text-align: center;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #007bff;
  width: 24px;
  height: 24px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
