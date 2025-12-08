<template>
  <div class="grid grid-cols-12 gap-4 w-full p-4">

    <!-- LEFT: Waiting List Column -->
    <div class="col-span-3 border-r pr-2">
      <h3 class="font-semibold text-lg mb-3">Waiting List</h3>

      <div
        v-for="student in students"
        :key="student.id"
        @click="toggleStudent(student)"
        class="p-3 mb-2 cursor-pointer rounded border transition
               hover:bg-blue-100"
        :class="isSelected(student) ? 'bg-blue-200 border-blue-400' : 'bg-white'"
      >
        {{ student.name }}
      </div>
    </div>

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

const isSelected = (student) => {
  return selectedStudents.value.some(s => s.id === student.id);
};

const toggleStudent = (s) => {
  const index = selectedStudents.value.findIndex(existing => existing.id === s.id);
  if (index === -1) {
    selectedStudents.value.push(s);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

const addStudent = (s) => {
  if (!isSelected(s)) {
    selectedStudents.value.push(s);
  }
};
</script>
