<template>
  <div class="grid grid-cols-12 gap-4 w-full p-4">

 

    <!-- RIGHT: Main Handler Panel -->
    <div class="col-span-9">
      <WaitingHandler
        :selectedStudents="selectedStudents"
        :students="students"
        @studentChanged="addStudent"
      />
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import WaitingHandler from "../../components/Reservation/WaitingHandler.vue";

const students = ref([
  { id: 1, name: "Ahmed Ali", scholarship: true },
  { id: 2, name: "Sara Mohamed", scholarship: false },
  { id: 3, name: "Youssef Ayman", scholarship: true },
]);

const selectedStudents = ref([]);


const toggleStudent = (s) => {
  const index = selectedStudents.value.findIndex(existing => existing.id === s.id);
  if (index === -1) {
    selectedStudents.value.push(s);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

const addStudent = (s) => {
  // Enforce single selection from the dropdown as requested
  selectedStudents.value = [s];
};
</script>
