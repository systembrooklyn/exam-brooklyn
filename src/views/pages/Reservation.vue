<script setup>
import { onMounted, reactive } from 'vue';
import { User, Mail, Phone, Calendar } from 'lucide-vue-next';
import  {useReservationStore} from '@/stores/reservations.js';


const reservationStore = useReservationStore();

const form = reactive({
  name: '',
  email: '',
  mobile: '',
  ID_number: '',
  birth_date: '',
  grade: '',
  company: '',
  marketing_code: '',
  scholarship: '',
  // الحقول التالية تُولد تلقائياً عند الإرسال:
  // called_by: id, called_time: timestamp
});

function handleSubmit() {
  const payload = {
    name: form.name,
    email: form.email,
    phones: [form.mobile],
    ID_number: form.ID_number,
    birth_date: form.birth_date,
    grade: form.grade,
    company: form.company,
    marketing_code: form.marketing_code,
    scholarship: parseInt(form.scholarship),
    status: 'manual',
    called_by: 1, 
    called_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  console.log('Submitting to API:', payload);

  reservationStore.addReservation(payload);
}


</script>

<template>
  <div class="w-full max-w-4xl border border-gray-300 mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg shadow-blue-300 space-y-6 dark:bg-gray-800">
    <img src="@/assets/logo.png" class="h-15 mx-auto" alt="">
    <h2 class="text-3xl font-bold text-blue-900 dark:text-white text-center mb-7">Receptionist Intake Form</h2>

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Full Name -->
      <div class="md:col-span-2">
        <label class="form-label">Full Name (English)</label>
        <div class="relative">
          <User class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.name" type="text" class="form-input pl-10" placeholder="Please enter full English name" />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label class="form-label">E-Mail Address</label>
        <div class="relative">
          <Mail class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.email" type="email" class="form-input pl-10" placeholder="example@mail.com" />
        </div>
      </div>

      <!-- Mobile Number -->
      <div>
        <label class="form-label">Mobile Number</label>
        <div class="relative">
          <Phone class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.mobile" type="tel" class="form-input pl-10" placeholder="01XXXXXXXXX" />
        </div>
      </div>

      <!-- National ID -->
      <div>
        <label class="form-label">National ID (14 digits)</label>
        <input v-model="form.ID_number" type="text" class="form-input" maxlength="14" placeholder="12345678901234" />
      </div>

      <!-- Date of Birth -->
      <div>
        <label class="form-label">Date of Birth</label>
        <div class="relative">
          <Calendar class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input v-model="form.birth_date" type="date" class="form-input pl-10 appearance-none bg-white text-gray-800 dark:bg-gray-700 dark:text-white" />
        </div>
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

      <!-- Company -->
      <div>
        <label class="form-label">Company</label>
        <input v-model="form.company" type="text" class="form-input" placeholder="Company name (if any)" />
      </div>

      <!-- Marketing Code -->
      <div>
        <label class="form-label">Do you have a Scholarship Code?</label>
        <select v-model="form.marketing_code" class="form-input">
          <option disabled value="">Select</option>
          <option value="SomeCode">Yes</option>
          <option value="">No</option>
        </select>
      </div>

      <!-- Scholarship -->
      <div>
        <label class="form-label">Scholarship</label>
        <select v-model="form.scholarship" class="form-input">
          <option disabled value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>

      <!-- Submit -->
      <div class="md:col-span-2 text-center mt-6">
        <button type="submit" class="bg-primary text-white py-2 px-6 w-50 cursor-pointer rounded-xl hover:bg-blue-700 transition">
          Submit
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
.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
</style>
