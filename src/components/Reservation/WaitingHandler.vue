<template>
  <div class="w-full p-4">
    <h2 class="text-center font-semibold text-2xl mb-6 text-indigo-600">Waiting List Handler</h2>

    <div class="flex flex-col md:flex-row gap-6">
      
      <!-- LEFT: Inputs & Controls -->
      <div class="w-full md:w-1/2">
        <!-- Student Dropdown -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-gray-700">Add Student To Handle</label>
          <select
            class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700"
            @change="emitSelection($event)"
          >
            <option disabled value="" selected>Select Student to Add</option>
            <option
              v-for="s in students"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }}
            </option>
          </select>
        </div>

        <!-- Branch -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-gray-700">Choose Branch</label>
          <select v-model="branch" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700">
            <option value="Downtown">Downtown</option>
            <option value="Abbas">Abbas</option>
            <option value="Nasr City">Nasr City</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3 mt-6">
          <button
            @click="handleScholarship"
            class="flex items-center justify-between px-6 py-3 border rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
          >
            <span>Scholarship Handle</span>
            <span class="bg-white text-green-600 text-sm font-bold px-2 py-0.5 rounded-full">GO</span>
          </button>

          <button
            @click="handleOther"
            class="flex items-center justify-between px-6 py-3 border rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md"
          >
            <span>Other Handle</span>
            <span class="bg-white text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">GO</span>
          </button>
        </div>
      </div>

      <!-- RIGHT: Selected Student Display -->
      <div class="w-full md:w-1/2 border-l pl-0 md:pl-6 border-gray-200">
        <h3 class="font-medium text-xl text-indigo-800 mb-3 border-b pb-2">Selected Student</h3>
        
        <div v-if="selectedStudents.length > 0" class="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
              {{ selectedStudents[0].name.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-lg text-gray-900">{{ selectedStudents[0].name }}</p>
              <p class="text-sm text-gray-500">ID: {{ selectedStudents[0].id }}</p>
            </div>
          </div>
          <div class="mt-3">
             <span 
              v-if="selectedStudents[0].scholarship" 
              class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold"
            >
              Scholarship Student
            </span>
             <span 
              v-else 
              class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold"
            >
              Regular Student
            </span>
          </div>
        </div>

        <div v-else class="h-32 flex items-center justify-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
          No student selected
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  selectedStudents: {
    type: Array,
    default: () => []
  },
  students: {
    type: Array,
    default: () => []
  },
});

const emit = defineEmits(["studentChanged"]);

const branch = ref("Downtown");

const emitSelection = (e) => {
  const id = Number(e.target.value);
  if (!id) return;

  const stu = props.students.find((x) => x.id === id);
  if (stu) {
    emit("studentChanged", stu);
    e.target.value = ""; // Reset dropdown
  }
};

const handleScholarship = () => {
  if (props.selectedStudents.length === 0) return alert("Choose at least one student");

  console.log("Scholarship Handle:", {
    students: props.selectedStudents,
    branch: branch.value,
  });
  alert(`Processing Scholarship for ${props.selectedStudents.length} students! Check console.`);
};

const handleOther = () => {
  if (props.selectedStudents.length === 0) return alert("Choose at least one student");
  
  console.log("Other Handle:", {
    students: props.selectedStudents,
    branch: branch.value
  });
  alert(`Processing Other Handle for ${props.selectedStudents.length} students! Check console.`);
};
</script>
