<template>
 <div  class="grid grid-cols-2 gap-4">
          <div class="relative w-[95%]" >
            <label class="block text-sm mb-1">Select Scholarship</label>
            <select
  v-if="form.student"
  v-model="form.student.scholarship_id"
  class="w-full border border-gray-200 rounded-md px-3 py-2"
>
  <option disabled value="">Select Scholarship</option>
  <option
    v-for="scholarship in scholarships"
    :key="scholarship.id"
    :value="scholarship.id"
  >
    {{ scholarship.name }}
  </option>
</select>

          </div>

          <div>
            <label class="block text-sm mb-1">Name</label>
            <input
              v-model="form.student.name"
              type="text"
              placeholder="123456, 987654"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
          
            />
          </div>
          <div class="w-full">
            <label
              for="careerType"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Career Type</label
            >
            <select
              id="careerType"
              v-model="form.student.careerType"
              class="block w-full py-2 px-3 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option disabled value="">Select a career type</option>
              <option value="Engineer">Engineer</option>
              <option value="healthcare">Healthcare</option>
              <option value="Business Administration">
                Business Administration
              </option>
              <option value="Science graduates">Science Graduates</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Student Email -->
          <div>
            <label class="block text-sm mb-1">Student Email</label>
            <input
              v-model="form.student.email"
              type="email"
              placeholder="Enter student email"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Phones -->
          <div>
            <label class="block text-sm mb-1">Phones (comma separated)</label>
            <input
              v-model="form.student.phones"
              type="text"
              placeholder="123456, 987654"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
              @input="
                form.student.phones = $event.target.value
                  .split(',')
                  .map((p) => p.trim())
              "
            />
          </div>

          <!-- ID Number -->
          <div>
            <label class="block text-sm mb-1">ID Number</label>
            <input
              v-model="form.student.ID_number"
              type="text"
              placeholder="Enter ID number"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Grade -->
          <div>
            <label class="block text-sm mb-1">Grade</label>
            <select
              v-model="form.student.grade"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            >
              <option disabled value="">Select grade</option>
              <option>Pass</option>
              <option>Good</option>
              <option>V.Good</option>
              <option>Excellent</option>
              <option>5 Years Ex</option>
              <option>>45</option>
            </select>
          </div>

          <!-- Birth Date -->
          <div>
            <label class="block text-sm mb-1">Birth Date</label>
            <input
              v-model="form.student.birth_date"
              type="date"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Company -->
          <div>
            <label class="block text-sm mb-1">Company</label>
            <input
              v-model="form.student.company"
              type="text"
              placeholder="Enter company"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Marketing Code -->
          <div>
            <label class="block text-sm mb-1">Marketing Code</label>
            <input
              v-model="form.student.marketing_code"
              type="text"
              placeholder="Enter marketing code"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            >
              <option disabled value="">Select status</option>
              <option value="manual">manual</option>
              <option value="reserve">reserve</option>
              <option value="ask">ask</option>
              <option value="cancel">cancel</option>
            </select>
          </div>

          <!-- Called By -->
         <div class="relative w-[95%]" >
            <label class="block text-sm mb-1">Colled By</label>
        <select
  v-model="form.called_by"
  class="w-full border border-gray-200 rounded-md px-3 py-2"
>
  <option disabled value="">Select Called By</option>
  <option
    v-for="colled in employeeStore.employees"
    :key="colled.id"
    :value="colled.id"
  >
    {{ colled.name }}
  </option>
</select>

          </div>

          <!-- Called Time -->
          <div>
            <label class="block text-sm mb-1">Called Time</label>
            <input
              v-model="form.called_time"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Faculty -->
          <div>
            <label class="block text-sm mb-1">Faculty</label>
            <input
              v-model="form.student.faculity"
              type="text"
              placeholder="Enter faculty"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>

          <!-- Major -->
          <div>
            <label class="block text-sm mb-1">Major</label>
            <input
              v-model="form.student.major"
              type="text"
              placeholder="Enter major"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Branch</label>
            <input
              v-model="form.branch.name"
              type="text"
              placeholder="Enter major"
              class="w-full border border-gray-200 rounded-md px-3 py-2"
            />
          </div>
        </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useEmployeeStore } from "@/stores/employeesStore.js";
import { useScholarshipStore } from "@/stores/scholarships";


const employeeStore = useEmployeeStore();
const scholarshipStore = useScholarshipStore();
const scholarships = computed(() => scholarshipStore.scholarships || []);



const props = defineProps({
  form: Object,
});
onMounted(() => {
  employeeStore.fetchEmployees();
  scholarshipStore.fetchScholarships();
});
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
