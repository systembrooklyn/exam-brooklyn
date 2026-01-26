<script setup>
import { onMounted, watch } from "vue";
import { useStudentStore } from "../../stores/studentStore";
import { IdCard, UserRound } from "lucide-vue-next";
import { useCourseStore } from "@/stores/courseStore";
import { ref } from "vue";

const studentStore = useStudentStore();
const rulesAccepted = ref(false);

const courseStore = useCourseStore();

const handelSendOtp = () => {
  if (studentStore.studentId) {
    studentStore.sendOTP(studentStore.studentId);
  }
};


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

const acceptRules = () => {
  rulesAccepted.value = true;
  sessionStorage.setItem("rulesAccepted", "true");
  studentStore.showRulesModal = false;
  studentStore.proceedToExam();
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
        <div
          class="mb-5"
          v-else-if="studentStore.courses.data"
        >
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
        v-if="
          
          studentStore.selectedModule &&
          studentStore.selectedInstructor
        "
      >
        <div class="flex justify-center">
          <button
            @click="handelSendOtp"
            :disabled="
              (studentStore.timer < 120 && studentStore.timer > 0) ||
              
              studentStore.studentId === ''
            "
            class="text-primary absolute top-4 z-10 right-3 cursor-pointer"
          >
            <span v-if="studentStore.loadingOtp"
              ><i class="fa-solid fa-circle-notch fa-spin-pulse"></i
            ></span>
            <span
              v-else
              :class="{
                'opacity-50 cursor-not-allowed ':
                  (studentStore.timer < 120 && studentStore.timer > 0) ||
                
                  studentStore.studentId === '',
              }"
              class="relative text-sm font-bold border-b-1"
            >
              Send OTP</span
            >
          </button>
        </div>

        <div class="relative">
          <!-- OTP Input -->
          <input
            type="text"
            v-model="studentStore.studentOTP"
            :placeholder="`It will be sent after ${studentStore.timer} seconds`"
            :disabled="
              
              studentStore.studentId === '' ||
              studentStore.timer === 120 ||
              studentStore.timer === 0
            "
            class="bg-gray-50 border border-gray-300 mt-3 w-full text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <p :class="studentStore.otpMessageColor" class="mt-2">
          {{ studentStore.otpMasg }}
        </p>
      </div>

      <button
        v-show="studentStore.selectedModule && studentStore.selectedInstructor"
        @click="submitForm"
        type="button"
        class="  w-full py-2 rounded-2xl text-white hover:bg-blue-900 cursor-pointer bg-primary flex items-center justify-center"
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

    <!-- Exam Rules Modal -->
    <div
      v-if="studentStore.showRulesModal"
      class="rules-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="rules-content bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2
          class="text-2xl font-bold text-center mb-6 text-primary dark:text-blue-400"
        >
          قواعد تأدية الامتحانات بقاعة الامتحانات
        </h2>
        <div class="rules-list space-y-4 mb-6 text-right">
          <div class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              <span class="text-primary dark:text-blue-400">1.</span>
              غير مسموح باستخدام الهاتف المحمول لأي غرض سواء (استخدامه آلة
              حاسبة – ترجمة – مكالمات).
            </p>
          </div>
          <div class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              <span class="text-primary dark:text-blue-400">2.</span>
              غير مسموح اصطحاب أي مأكولات أو مشروبات داخل قاعة الامتحانات.
            </p>
          </div>
          <div class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              <span class="text-primary dark:text-blue-400">3.</span>
              لا يتم عمل Submit للامتحان إلا في تواجد موظف المراقبة الموجود
              بالقاعة.
            </p>
          </div>
          <div class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              <span class="text-primary dark:text-blue-400">4.</span>
              يسمح في حالة أداء اختبارات المواد استخدام Google Translate من على
              الحاسب فقط وغير مسموح بذلك في حالة أداء اختبارات القبول.
            </p>
          </div>
        </div>
        <div class="flex items-center justify-center mb-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="rulesAccepted"
              class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mr-2"
            />
            <span class="text-lg font-medium text-gray-700 dark:text-gray-300">
              قرأت وفهمت القواعد وأوافق عليها
            </span>
          </label>
        </div>
        <div class="text-center">
          <button
            @click="acceptRules"
            :disabled="!rulesAccepted"
            class="w-full py-2 rounded-2xl text-white hover:bg-blue-900 cursor-pointer bg-primary flex items-center justify-center"
            :class="{
              'opacity-50 cursor-not-allowed': !rulesAccepted,
            }"
          >
            موافق ومتابع
          </button>
        </div>
      </div>
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

.rules-modal {
  backdrop-filter: blur(4px);
}

.rules-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rule-item {
  border-right: 4px solid #092c67;
  transition: all 0.3s ease;
}

.rule-item:hover {
  transform: translateX(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark .rule-item {
  border-right-color: #4788f8;
}
</style>