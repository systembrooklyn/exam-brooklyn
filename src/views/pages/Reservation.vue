<script setup>
import { onMounted, ref, reactive } from "vue";
import { User, Mail, Phone, Calendar, IdCard, Landmark } from "lucide-vue-next";
import { useReservationStore } from "@/stores/reservations.js";
import { useScholarshipStore } from "@/stores/scholarships.js";
import { useEmployeeStore } from "@/stores/employeesStore.js";
import { useRouter } from "vue-router";

const reservationStore = useReservationStore();
const scholarshipStore = useScholarshipStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

const isLoading = ref(false);

const form = reactive({
  name: "",
  email: "",
  mobiles: [""],
  ID_number: "",
  birth_date: "",
  grade: "",
  company: "",
  marketing_code: "",
  scholarship: "",
  called_time: "",
  called_by: "",
  faculity: "",
  major: "",
  careerType: "",
});

const missingFieldsError = ref(false);

async function handleSubmit() {
  const cleanedPhones = form.mobiles
    .map((phone) => phone?.replace(/\D/g, ""))
    .filter((phone) => phone);

  const requiredFields = [
    "name",
    "email",
    "mobiles",
    "ID_number",
    "birth_date",
    "grade",
    "company",
    "marketing_code",
    "scholarship",
    "called_time",
    "called_by",
  ];

  const missing = requiredFields.filter((field) => !form[field]);

  if (missing.length > 0) {
    missingFieldsError.value = true;
    return;
  }

  missingFieldsError.value = false;
  isLoading.value = true;

  const calledDateTime = form.called_time.replace("T", " ") + ":00";

  const payload = {
    name: form.name,
    email: form.email,
    phones: cleanedPhones,
    ID_number: form.ID_number,
    birth_date: form.birth_date,
    grade: form.grade,
    company: form.company,
    marketing_code: form.marketing_code,
    scholarship: form.scholarship,
    called_by: form.called_by,
    called_time: calledDateTime,
    faculity: form.faculity,
    major: form.major,
    careerType: form.careerType,
  };

  try {
    await reservationStore.addReservation(payload);
    router.push({ name: "reservation-success" });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  scholarshipStore.fetchScholarships();
  employeeStore.fetchEmployees();
});
</script>

<template>
  <div
    class="w-full max-w-4xl border border-gray-300 mx-auto m-5 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800"
  >
    <img src="@/assets/logo.png" class="h-15 mx-auto" alt="" />
    <h2
      class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-7"
    >
      Reservation Intake Form
    </h2>

    <form
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
    >
      <!-- Full Name -->
      <div>
        <label class="form-label">Full Name (English)</label>
        <div class="relative">
          <User
            class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
          />
          <input
            v-model="form.name"
            type="text"
            class="form-input pl-10"
            placeholder="Please enter full English name"
          />
        </div>
      </div>

      <div>
        <label class="form-label">Select Scholarship</label>
        <select v-model="form.scholarship" class="form-input">
          <option disabled value="">Select</option>
          <option
            v-for="scholarship in scholarshipStore.scholarships"
            :key="scholarship.id"
            :value="scholarship.id"
          >
            {{ scholarship.name }}
          </option>
        </select>
      </div>

      <!-- Email -->
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
      <!-- <div>
        <label class="form-label">Mobile Number</label>
        <vue-tel-input mode="international" v-model="form.mobile" placeholder="Enter your mobile number"
          class="form-input-tel"></vue-tel-input>
      </div> -->
      <!-- Mobile Numbers -->
      <div>
        <label class="form-label">Mobile Numbers</label>
        <div
          v-for="(phone, index) in form.mobiles"
          :key="index"
          class="flex items-center gap-2 mb-2"
        >
          <vue-tel-input
            v-model="form.mobiles[index]"
            mode="international"
            placeholder="Enter mobile number"
            class="form-input-tel"
          ></vue-tel-input>

          <!-- Add button only on last input -->
          <button
            v-if="index === form.mobiles.length - 1"
            type="button"
            @click="form.mobiles.push('')"
            class="text-blue-600 text-xl font-bold w-7 h-7 cursor-pointer flex items-center justify-center border rounded border-blue-600 hover:bg-blue-100"
          >
            +
          </button>

          <!-- Remove button (optional) -->
          <button
            v-if="form.mobiles.length > 1"
            type="button"
            @click="form.mobiles.splice(index, 1)"
            class="text-red-500 text-xl w-7 h-7 flex cursor-pointer items-center justify-center font-bold border rounded border-red-400 hover:bg-red-100"
          >
            −
          </button>
        </div>
      </div>

      <!-- National ID -->
      <div>
        <label class="form-label">National ID (14 digits)</label>
        <div class="relative">
          <IdCard
            class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
          />
          <input
            v-model="form.ID_number"
            type="text"
            class="form-input"
            maxlength="14"
            placeholder="12345678901234"
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
            v-model="form.birth_date"
            type="date"
            class="form-input pl-10 appearance-none bg-white text-gray-800 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
       <!-- Faculty -->
      <div>
        <label class="form-label">Faculty</label>
        <input
          v-model="form.faculity"
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
          placeholder="Your Major"
        />
      </div>

     

      <!-- Grade -->
      <div>
        <label class="form-label">Grade</label>
        <select v-model="form.grade" class="form-input">
          <option disabled value="">Select Grade</option>
          <option>Pass</option>
          <option>Good</option>
          <option>V.Good</option>
          <option>Excellent</option>
          <option>5 Years Ex</option>
          <option>>45</option>
        </select>
      </div>
      <!-- Career Type -->
      <div>
        <label class="form-label">Career Type</label>
        <select v-model="form.careerType" class="form-input">
          <option disabled value="">Select Career Type</option>
          <option value="Engineer">Engineer</option>
          <option value="healthcare">Healthcare</option>
          <option value="Business Administration">
            Business Administration
          </option>
          <option value="Science graduates">Science graduates</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Company -->
      <div>
        <label class="form-label">Company</label>
        <div class="relative">
          <Landmark
            class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500"
          />
          <input
            v-model="form.company"
            type="text"
            class="form-input"
            placeholder="Company name (if any)"
          />
        </div>
      </div>

      <!-- Marketing Code -->
      <div>
        <label class="form-label">Scholarship Code</label>
        <input
          v-model="form.marketing_code"
          type="text"
          class="form-input"
          placeholder="Scholarship Code"
        />
      </div>

      <!-- Manual Called Time -->

      <!-- Call Info Section -->
      <div class="md:col-span-2 border-t-1 border-blue-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <!-- Call Time -->
          <!-- Call Time -->
          <div>
            <label class="flex items-center gap-2 mb-2">
              <span class="font-bold text-[#1e3a8a]">Call Date & Time</span>
              <span class="text-sm text-gray-500"
                >(Filled by the employee)</span
              >
            </label>
            <input
              v-model="form.called_time"
              type="datetime-local"
              class="form-input"
            />
          </div>

          <!-- Called By -->
          <div>
            <label class="flex items-center gap-2 mb-2"
              ><span class="font-bold text-[#1e3a8a]">Called By</span>
              <span class="text-sm text-gray-500"
                >(Filled by the employee)</span
              ></label
            >
            <select v-model="form.called_by" class="form-input">
              <option disabled value="">Select</option>
              <option
                v-for="employee in employeeStore.employees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <!-- Error message if required fields are missing -->
      <p
        v-if="missingFieldsError"
        class="text-red-600 text-center font-medium md:col-span-2"
      >
        ⚠️ Please fill in all required fields before submitting.
      </p>

      <!-- Submit -->
      <div
        class="md:col-span-2 text-center py-4 flex items-center justify-center"
      >
        <button
          type="submit"
          :disabled="isLoading"
          class="bg-primary text-white py-2 px-6 w-50 cursor-pointer rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <svg
            v-if="isLoading"
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>{{ isLoading ? "Submitting..." : "Submit" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

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

.form-input-tel {
  width: 100%;
  padding: 0.2rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: border 0.3s;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
</style>
