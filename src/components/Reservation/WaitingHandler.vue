<template>
  <div class="w-full p-4">

    <h2 class="text-center font-semibold text-lg mb-4">Handling Panel</h2>

    <!-- List of Selected Students (Removed as requested) -->
    


    <!-- Student Dropdown (Add specific) -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">Add Student To Handle</label>
      <select
        class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700"
        @change="emitSelection($event)"
      >
        <option disabled value="" selected>Select Student to Add</option>
        <option
          v-for="s in students"
          :key="s.id"
          :value="s.id"
          :disabled="selectedStudents.some(sel => sel.id === s.id)"
        >
          {{ s.name }}
        </option>
      </select>
    </div>

    <!-- Branch -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">Choose Branch</label>
      <select v-model="branch" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700">
        <option value="Downtown">Downtown</option>
        <option value="Abbas">Abbas</option>
        <option value="Nasr City">Nasr City</option>
      </select>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-4 mt-6">

      <button
        @click="handleScholarship"
        class="flex items-center justify-center gap-3 border rounded-xl py-3 bg-green-600 text-white font-semibold hover:bg-green-700 transition"
      >
        <span>Scholarship Handle ({{ selectedStudents.length }})</span>
        <span class="bg-white text-green-600 font-bold px-3 py-1 rounded-full">GO</span>
      </button>

      <button
        @click="handleOther"
        class="flex items-center justify-center gap-3 border rounded-lg py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      >
        <span>Other Handle ({{ selectedStudents.length }})</span>
        <span class="bg-white text-red-600 font-bold px-3 py-1 rounded-full">Go</span>
      </button>

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
