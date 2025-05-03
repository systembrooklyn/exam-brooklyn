<template>
  <div
    class="w-full max-w-4xl border border-gray-300 mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800"
  >
    <img src="@/assets/logo.png" class="h-15 mx-auto" alt="" />
    <h2
      class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-7"
    >
      Receptionist Intake Form
    </h2>

    <form
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <!-- Step 1: Form Inputs -->
      <template v-if="step === 1">
        <!-- Full Name -->
        <div class="md:col-span-2">
          <label class="form-label">Full Name (English)</label>
          <div class="relative">
            <User
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.fullName"
              type="text"
              class="form-input pl-10"
              placeholder="Please enter full English name"
            />
          </div>
        </div>

        <!-- Branch -->
        <div>
          <label class="form-label">Branch</label>
          <div class="relative">
            <MapPin
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <select v-model="form.branch" class="form-input pl-10">
              <option disabled value="">Select Branch</option>
              <option>Nasr City</option>
              <option>Heliopolis</option>
              <option>Maadi</option>
            </select>
          </div>
        </div>

        <!-- Called By -->
        <div>
          <label class="form-label">Called by</label>
          <div class="relative">
            <Phone
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.calledBy"
              type="text"
              class="form-input pl-10"
              placeholder="Enter caller name"
            />
          </div>
        </div>

        <!-- Waiting Number -->
        <div>
          <label class="form-label">Waiting Number</label>
          <div class="relative">
            <ListOrdered
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.waitingNumber"
              type="number"
              class="form-input pl-10"
              placeholder="e.g., 23"
            />
          </div>
        </div>

        <!-- Receptionist -->
        <div>
          <label class="form-label">Receptionist</label>
          <div class="relative">
            <UserCircle
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.calledBy"
              type="text"
              class="form-input pl-10"
              placeholder="Enter caller name"
            />
          </div>
        </div>

        <!-- Date of Birth -->
        <div>
          <label class="form-label">Date of Birth</label>
          <div class="relative">
            <Calendar
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.dob"
              type="date"
              class="form-input pl-10 appearance-none bg-white text-gray-800 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- National ID -->
        <div>
          <label class="form-label">National ID (14 digits)</label>
          <input
            v-model="form.nationalId"
            type="text"
            class="form-input"
            maxlength="14"
            placeholder="12345678901234"
          />
        </div>

        <!-- Nationality -->
        <div class="md:col-span-2">
          <label class="form-label">Nationality</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label
              v-for="n in nationalities"
              :key="n"
              class="inline-flex items-center"
            >
              <input
                type="checkbox"
                v-model="form.nationalities"
                :value="n"
                class="mr-2"
              />
              {{ n }}
            </label>
          </div>
        </div>

        <!-- Email Address -->
        <div>
          <label class="form-label">E-Mail Address</label>
          <div class="relative">
            <Mail
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.email"
              type="email"
              class="form-input pl-10"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        <!-- Mobile Number -->
        <div>
          <label class="form-label">Mobile Number</label>
          <div class="relative">
            <Phone
              class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
            />
            <input
              v-model="form.mobile"
              type="tel"
              class="form-input pl-10"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <!-- Governorate -->
        <div>
          <label class="form-label">Governorate</label>
          <select v-model="form.governorate" class="form-input">
            <option disabled value="">Select Governorate</option>
            <option>Cairo</option>
            <option>Giza</option>
            <option>Alexandria</option>
          </select>
        </div>

        <!-- Grade -->
        <div>
          <label class="form-label">Grade</label>
          <select v-model="form.grade" class="form-input">
            <option disabled value="">Select Grade</option>
            <option>Grade 10</option>
            <option>Grade 11</option>
            <option>Grade 12</option>
          </select>
        </div>

        <!-- Faculty -->
        <div>
          <label class="form-label">Faculty</label>
          <input
            v-model="form.faculty"
            type="text"
            class="form-input"
            placeholder="Faculty name"
          />
        </div>

        <!-- Major -->
        <div>
          <label class="form-label">Major</label>
          <input
            v-model="form.major"
            type="text"
            class="form-input"
            placeholder="Major"
          />
        </div>

        <!-- Student Category -->
        <div>
          <label class="form-label">Student Category</label>
          <select v-model="form.studentCategory" class="form-input">
            <option disabled value="">Select Category</option>
            <option>Local</option>
            <option>International</option>
          </select>
        </div>

        <!-- Company -->
        <div>
          <label class="form-label">Company</label>
          <input
            v-model="form.company"
            type="text"
            class="form-input"
            placeholder="Company name (if any)"
          />
        </div>

        <!-- Scholarship -->
        <div>
          <label class="form-label">Scholarship</label>
          <select v-model="form.scholarship" class="form-input">
            <option disabled value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <!-- Scholarship Code -->
        <div>
          <label class="form-label">Do you have Scholarship Code?</label>
          <select v-model="form.scholarshipCode" class="form-input">
            <option disabled value="">Select Code</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </template>

      <!-- Step 2: Scholarship Questions -->
      <template v-else>
        <div class="md:col-span-2 mt-6">
          <label class="form-label"
            >Why did you apply for the scholarship?</label
          >
          <textarea
            v-model="scholarshipQuestions.reason"
            required
            class="form-input h-28"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="form-label"
            >If you participate in this program, how do you think your life will
            be different in 5 years?</label
          >
          <textarea
            v-model="scholarshipQuestions.future"
            required
            class="form-input h-28"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="form-label"
            >Describe a challenge you faced and how you solved it.</label
          >
          <textarea
            v-model="scholarshipQuestions.challenge"
            required
            class="form-input h-28"
          ></textarea>
        </div>
      </template>

      <!-- Buttons -->
      <div class="md:col-span-2 text-center mt-6 flex justify-center gap-4">
        <button
          v-if="step === 2"
          type="button"
          @click="step = 1"
          class="bg-gray-500 text-white py-2 px-6 w-40 rounded-xl hover:bg-gray-600 transition"
        >
          Back
        </button>

        <button
          type="submit"
          class="bg-primary text-white py-2 cursor-pointer w-40 px-6 rounded-xl hover:bg-blue-700 transition"
        >
          {{ step === 1 ? "Next" : "Submit" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ListOrdered,
  UserCircle,
} from "lucide-vue-next";

const step = ref(1);

const form = reactive({
  branch: "",
  calledBy: "",
  waitingNumber: "",
  grade: "",
  fullName: "",
  nationalId: "",
  faculty: "",
  major: "",
  studentCategory: "",
  company: "",
  scholarship: "",
  scholarshipCode: "",
  nationalities: [],
  dob: "",
  governorate: "",
  mobile: "",
  email: "",
});

const scholarshipQuestions = reactive({
  reason: "",
  future: "",
  challenge: "",
});

const nationalities = [
  "Egyptian",
  "Sudanese",
  "KSA",
  "UAE",
  "Bahrain",
  "Syrian",
  "Iraq",
  "Palestinian",
  "Yemeni",
  "Algerienne",
  "Ethiopian",
  "Other",
];

function handleSubmit() {
  if (step.value === 1) {
    step.value = 2;
  } else {
    const payload = {
      ...form,
      scholarshipAnswers: { ...scholarshipQuestions },
    };
    console.log("Final Submission:", payload);
    // send `payload` to API here
  }
}
</script>

<style scoped>
.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e3a8a;
}
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: border 0.3s;
  background-color: #f9fafb;
}
.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
</style>
