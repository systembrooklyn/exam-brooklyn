<script setup>
import { onMounted, ref, reactive, nextTick } from "vue";
import { User, Mail, Calendar, IdCard, Landmark, Loader2 } from "lucide-vue-next";
import { useReservationStore } from "@/stores/reservations.js";
import { useScholarshipStore } from "@/stores/scholarships.js";
import { useEmployeeStore } from "@/stores/employeesStore.js";
import { useRouter } from "vue-router";

const reservationStore = useReservationStore();
const scholarshipStore = useScholarshipStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

const isLoading = ref(false);

const restrictToEnglish = (field) => {
  form[field] = form[field].replace(/[^\x00-\x7F]/g, "");
};

const restrictToEnglishAlphanumeric = (field) => {
  form[field] = form[field].replace(/[^A-Za-z0-9]/g, "");
};

const form = reactive({
  name: "",
  email: "",
  mobiles: [""],
  ID_number: "",
  nationality: "",
  governorate: "",
  birth_date: "",
  grade: "",
  company: "",
  has_scholarship_code: "No",
  marketing_code: "",
  scholarship: "",
  called_time: "",
  called_by: "",
  faculity: "",
  major: "",
  careerType: "",
  receptionist: "",
});

const missingFieldsError = ref(false);
const phase1Error = ref(false);
const step = ref(1);
const serverErrorFields = reactive({});

function goToStep2() {
  if (employeeStore.loading) return;
  phase1Error.value = false;
  if (!form.called_by || !form.receptionist) {
    phase1Error.value = true;
    return;
  }
  step.value = 2;
  missingFieldsError.value = false;
}

function goBackToStep1() {
  step.value = 1;
  missingFieldsError.value = false;
}

function clearServerErrors() {
  Object.keys(serverErrorFields).forEach((k) => delete serverErrorFields[k]);
}

function applyServerErrors(err) {
  clearServerErrors();
  const data = err?.response?.data;
  if (!data) return;
  if (data.errors && typeof data.errors === "object") {
    for (const [key, val] of Object.entries(data.errors)) {
      const msg = Array.isArray(val) ? val[0] : val;
      serverErrorFields[key] = typeof msg === "string" ? msg : true;
    }
    return;
  }
  const msg = data.message;
  if (
    typeof msg === "string" &&
    /email|already|exist|duplicate|registered|taken/i.test(msg)
  ) {
    serverErrorFields.email = msg;
  }
}

const emailInputRef = ref(null);

async function handleSubmit() {
  if (step.value !== 2) return;

  const cleanedPhones = form.mobiles
    .map((phone) => phone?.replace(/\D/g, ""))
    .filter((phone) => phone);

  const requiredFields = [
    "name",
    "email",
    "mobiles",
    "ID_number",
    "nationality",
    "birth_date",
    "scholarship",
    "called_by",
    "grade",
    "company",
    "receptionist",
  ];

  const missing = requiredFields.filter((field) => !form[field]);

  // Conditional requirements
  if (form.nationality === "Egyptian" && !form.governorate) {
    missing.push("governorate");
  }
  if (form.has_scholarship_code === "Yes" && !form.marketing_code) {
    missing.push("marketing_code");
  }

  if (missing.length > 0) {
    missingFieldsError.value = true;
    return;
  }

  missingFieldsError.value = false;
  clearServerErrors();
  isLoading.value = true;

  const payload = {
    name: form.name,
    email: form.email,
    phones: cleanedPhones,
    ID_number: form.ID_number,
    nationality: form.nationality,
    governorate: form.nationality === "Egyptian" ? form.governorate : "",
    birth_date: form.birth_date,
    grade: form.grade,
    company: form.company,
    has_scholarship_code: form.has_scholarship_code,
    marketing_code: form.has_scholarship_code === "Yes" ? form.marketing_code : "",
    scholarship: form.scholarship,
    called_by: form.called_by,
    faculity: form.faculity,
    major: form.major,
    careerType: form.careerType,
    receptionist: form.receptionist,
  };

  try {
    await reservationStore.addReservation(payload);
    router.push({ name: "reservation-success" });
  } catch (err) {
    applyServerErrors(err);
    await nextTick();
    if (serverErrorFields.email) {
      emailInputRef.value?.focus?.();
    }
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
    class="w-full max-w-4xl border border-gray-300 mx-auto m-5 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800">
    <img src="@/assets/logo.png" class="h-15 mx-auto" alt="" />
    <h2 class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-2">
      Reservation Form
    </h2>

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      <p
        class="md:col-span-2 text-center text-sm font-semibold text-[#1e3a8a] dark:text-blue-200 -mb-2"
      >
        {{ step === 1 ? "Step 1 of 2 — Employee" : "Step 2 of 2 — Applicant details" }}
      </p>

      <template v-if="step === 1">
        <div>
          <label class="flex items-center gap-2 mb-2">
            <span class="font-bold text-[#1e3a8a]">Called By</span>
            <span class="text-sm text-gray-500">(Filled by the employee)</span>
          </label>
          <div class="relative min-h-[2.75rem]">
            <User
              class="absolute top-1/2 left-3 z-[1] transform -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none"
            />
            <select
              v-model="form.called_by"
              class="form-input relative z-0"
              :disabled="employeeStore.loading"
              :class="{ 'opacity-60 cursor-wait': employeeStore.loading }"
            >
              <option disabled value="">
                {{
                  employeeStore.loading ? "Loading employees…" : "Select Employee"
                }}
              </option>
              <option
                v-for="employee in employeeStore.employees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.name }}
              </option>
            </select>
            <div
              v-if="employeeStore.loading"
              class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-[1px]"
              aria-hidden="true"
            >
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 mb-2">
            <span class="font-bold text-[#1e3a8a]">Receptionist By</span>
            <span class="text-sm text-gray-500">(Filled by the employee)</span>
          </label>
          <div class="relative min-h-[2.75rem]">
            <User
              class="absolute top-1/2 left-3 z-[1] transform -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none"
            />
            <select
              v-model="form.receptionist"
              class="form-input relative z-0"
              :disabled="employeeStore.loading"
              :class="{ 'opacity-60 cursor-wait': employeeStore.loading }"
            >
              <option disabled value="">
                {{
                  employeeStore.loading ? "Loading employees…" : "Select Employee"
                }}
              </option>
              <option
                v-for="employee in employeeStore.employees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.name }}
              </option>
            </select>
            <div
              v-if="employeeStore.loading"
              class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-[1px]"
              aria-hidden="true"
            >
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>

        <p
          v-if="phase1Error"
          class="text-red-600 text-center font-medium md:col-span-2"
        >
          Please select both employees before continuing.
        </p>

        <div class="md:col-span-2 flex justify-center pt-2">
          <button
            type="button"
            class="bg-primary text-white py-2 px-8 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="employeeStore.loading"
            @click="goToStep2"
          >
            Next
          </button>
        </div>
      </template>

      <template v-else>
      <!-- Full Name -->
       <div class="md:col-span-2 flex items-center gap-3 bg-blue-50 border border-blue-200 p-2 rounded-xl mb-4">
          <div class="bg-blue-500 p-2 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>

            <p class="text-blue-700 text-sm">Please ensure all data is entered in English only.</p>
          </div>
        </div>

      <div>
        <label class="form-label">Full Name (English)</label>
        <div class="relative">
          <User class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.name" type="text" class="form-input pl-10" placeholder="Please enter full English name"
            @input="restrictToEnglish('name')" />
        </div>
      </div>

      <div>
        <label class="form-label">Select Scholarship</label>
        <select v-model="form.scholarship" class="form-input">
          <option disabled value="">Select Scholarship</option>
          <option v-for="scholarship in scholarshipStore.scholarships" :key="scholarship.id" :value="scholarship.id">
            {{ scholarship.name }}
          </option>
        </select>
      </div>

      <!-- Email -->
      <div>
        <label class="form-label">E-Mail Address</label>
        <div class="relative">
          <Mail class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            ref="emailInputRef"
            v-model="form.email"
            type="email"
            class="form-input pl-10"
            :class="{ '!border-red-500 ring-1 ring-red-400': serverErrorFields.email }"
            placeholder="example@mail.com"
            @input="
              restrictToEnglish('email');
              delete serverErrorFields.email;
            "
          />
        </div>
        <p
          v-if="serverErrorFields.email && typeof serverErrorFields.email === 'string'"
          class="text-red-600 text-sm mt-1"
        >
          {{ serverErrorFields.email }}
        </p>
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
          :class="{ 'rounded-xl ring-1 ring-red-400 p-1': serverErrorFields.phones }"
        >
          <vue-tel-input
            v-model="form.mobiles[index]"
            mode="international"
            placeholder="Enter mobile number"
            class="form-input-tel"
            :class="{ '!border-red-500': serverErrorFields.phones }"
            @update:model-value="delete serverErrorFields.phones"
          ></vue-tel-input>

          <!-- Add button only on last input -->
          <button v-if="index === form.mobiles.length - 1" type="button" @click="form.mobiles.push('')"
            class="text-blue-600 text-xl font-bold w-7 h-7 cursor-pointer flex items-center justify-center border rounded border-blue-600 hover:bg-blue-100">
            +
          </button>

          <!-- Remove button (optional) -->
          <button v-if="form.mobiles.length > 1" type="button" @click="form.mobiles.splice(index, 1)"
            class="text-red-500 text-xl w-7 h-7 flex cursor-pointer items-center justify-center font-bold border rounded border-red-400 hover:bg-red-100">
            −
          </button>
        </div>
      </div>

      <!-- National ID -->
      <div>
        <label class="form-label">National ID</label>
        <div class="relative">
          <IdCard class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            v-model="form.ID_number"
            type="text"
            class="form-input"
            :class="{ '!border-red-500 ring-1 ring-red-400': serverErrorFields.ID_number }"
            maxlength="64"
            placeholder="English letters Or Numbers only"
            autocomplete="off"
            @input="
              restrictToEnglishAlphanumeric('ID_number');
              delete serverErrorFields.ID_number;
            "
          />
        </div>
      </div>

      <!-- Nationality -->
      <div>
        <label class="form-label">Nationality</label>
        <select v-model="form.nationality" class="form-input">
          <option disabled value="">Select Nationality</option>
          <option value="Egyptian">Egyptian</option>
          <option value="Sudanese">Sudanese</option>
          <option value="KSA">KSA</option>
          <option value="UAE">UAE</option>
          <option value="Bahrain">Bahrain</option>
          <option value="Syrian">Syrian</option>
          <option value="Iraq">Iraq</option>
          <option value="Palestinian">Palestinian</option>
          <option value="Yemeni">Yemeni</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <!-- Governorate (Conditional) -->
      <div v-if="form.nationality === 'Egyptian'">
        <label class="form-label">Governorate</label>
        <select v-model="form.governorate" class="form-input">
          <option disabled value="">Select Governorate</option>
          <option value="Cairo">Cairo</option>
          <option value="Giza">Giza</option>
          <option value="Alex">Alex</option>
          <option value="Behira">Behira</option>
          <option value="Kafr Elsheekh">Kafr Elsheekh</option>
          <option value="Demiat">Demiat</option>
          <option value="Pour Saied">Pour Saied</option>
          <option value="Ismailia">Ismailia</option>
          <option value="Gharbia">Gharbia</option>
          <option value="Dakhlia">Dakhlia</option>
          <option value="Sharkia">Sharkia</option>
          <option value="Kalubia">Kalubia</option>
          <option value="Monofia">Monofia</option>
          <option value="Suez">Suez</option>
          <option value="South Sinai">South Sinai</option>
          <option value="Matrouh">Matrouh</option>
          <option value="Red sea">Red sea</option>
          <option value="Faum">Faum</option>
          <option value="Bani Suif">Bani Suif</option>
          <option value="Minia">Minia</option>
          <option value="Assuit">Assuit</option>
          <option value="Sauhag">Sauhag</option>
          <option value="Kina">Kina</option>
          <option value="Elwadi El gaded">Elwadi El gaded</option>
          <option value="Luxor">Luxor</option>
          <option value="Aswan">Aswan</option>
        </select>
      </div>

      <!-- Date of Birth -->
      <div>
        <label class="form-label">Date of Birth</label>
        <div class="relative">
          <Calendar class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.birth_date" type="date"
            class="form-input pl-10 appearance-none bg-white text-gray-800 dark:bg-gray-700 dark:text-white" />
        </div>
      </div>
      <!-- Faculty -->
      <div>
        <label class="form-label">Faculty</label>
        <input v-model="form.faculity" type="text" class="form-input" placeholder="Faculty name"
          @input="restrictToEnglish('faculity')" />
      </div>
      <!-- Major -->
      <div>
        <label class="form-label">Major</label>
        <input v-model="form.major" type="text" class="form-input" placeholder="Your Major"
          @input="restrictToEnglish('major')" />
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
      <!-- Student Category -->
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
          <Landmark class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.company" type="text" class="form-input" placeholder="Company name (if any)"
            @input="restrictToEnglish('company')" />
        </div>
      </div>

      <!-- Marketing Code / Scholarship Code -->
      <div>
        <label class="form-label">Do you have a scholarship Code?</label>
        <div class="flex gap-4 mb-2">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="form.has_scholarship_code" value="Yes" />
            Yes
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="form.has_scholarship_code" value="No" />
            No
          </label>
        </div>
      </div>

      <div v-if="form.has_scholarship_code === 'Yes'">
        <label class="form-label">Scholarship Code</label>
        <input v-model="form.marketing_code" type="text" class="form-input" placeholder="Enter Scholarship Code"
          @input="restrictToEnglish('marketing_code')" />
      </div>

      

      <!-- Error message if required fields are missing -->
      <p v-if="missingFieldsError" class="text-red-600 text-center font-medium md:col-span-2">
        ⚠️ Please fill in all required fields before submitting.
      </p>

      <!-- Back + Submit -->
      <div
        class="md:col-span-2 text-center py-4 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          :disabled="isLoading"
          class="py-2 px-6 rounded-xl border border-gray-300 text-[#1e3a8a] font-medium hover:bg-gray-50 transition disabled:opacity-50"
          @click="goBackToStep1"
        >
          Back
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="bg-primary text-white py-2 px-6 min-w-[12rem] cursor-pointer rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
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
      </template>
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
