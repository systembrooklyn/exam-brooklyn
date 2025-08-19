<template>
  <div
    v-if="
      (isExam || isInstructors || isEmployee || isCourse || isReservation) &&
      Object.keys(selectedExam).length
    "
    class="fixed inset-0 bg-[rgba(0,0,0,0.6)] bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
  >
    <div
      class="bg-white relative overflow-auto max-h-[95vh] p-8 rounded-lg shadow-2xl max-w-[60vw] w-full transform transition-all duration-500 ease-in-out scale-95 hover:scale-100"
    >
      <!-- Modal Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">
          {{
            (isExam && "Exam") ||
            (isInstructors && "Instructor") ||
            (isEmployee && "Employee") ||
            (isCourse && "Course") ||
            (isReservation && "Reservation")
          }}
          Details
        </h2>
        <div class="border-b-2 border-gray-300 mb-4"></div>
      </div>

      <!-- Modal Content -->
      <div v-if="isExam">
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Description:</strong>
          {{ selectedExam.description }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Questions Count:</strong>
          {{ selectedExam.questions_count }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Created At:</strong>
          {{ formatDate(selectedExam.created_at) }}
        </p>
      </div>

      <div v-if="isInstructors">
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Phone:</strong>
          {{ selectedExam.phone }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Updated At:</strong>
          {{ selectedExam.updated_at }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Created At:</strong>
          {{ formatDate(selectedExam.created_at) }}
        </p>
      </div>

      <div v-if="isEmployee">
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Email:</strong>
          {{ selectedExam.email }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Branch:</strong>
          {{ (selectedExam.branch && selectedExam.branch.name) || "No Branch" }}
        </p>
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Created At:</strong>
          {{ formatDate(selectedExam.created_at) }}
        </p>
      </div>

      <div v-if="isCourse">
        <p class="text-gray-700 text-sm mb-2">
          <strong class="text-primary font-medium">Scholarship:</strong>
          {{
            (selectedExam.scholarship &&
              selectedExam.scholarship
                .filter((scholarship) => scholarship.name)
                .map((scholarship) => `(${scholarship.name})`)
                .join(", ")) ||
            "No Scholarship"
          }}
        </p>
      </div>
      <div
        v-if="isReservation"
        class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      >
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Name: </strong>
          {{ selectedExam.student.name }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Email: </strong>
          {{ selectedExam.student.email }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Phone: </strong>
          {{
            (selectedExam.student.phones &&
              selectedExam.student.phones.map((phone) => phone).join(", ")) ||
            "No Phone"
          }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Student Number: </strong>
          {{ selectedExam.student.st_num }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Company: </strong>
          {{ selectedExam.student.company }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Grade: </strong>
          {{ selectedExam.student.grade }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Faculity: </strong>
          {{ selectedExam.student.faculity || "Not Available" }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Scholarship: </strong>
          {{ selectedExam.student.scholarship.name || "Not Available" }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Major: </strong>
          {{ selectedExam.student.majorx || "Not Available" }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Birth Date : </strong>
          {{ selectedExam.student.birth_date }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Status: </strong>
          {{ selectedExam.status.label }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Career Type : </strong>
          {{ selectedExam.student.careerType }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Reserved Time: </strong>
          {{
            (selectedExam.reserved_time &&
              formatDate(selectedExam.reserved_time)) ||
            "No Reserved Time"
          }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Called By: </strong>
          {{
            (selectedExam.called_by && selectedExam.called_by.name) ||
            "No Called By"
          }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Called Time: </strong>
          {{ formatDate(selectedExam.called_time) }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Registered By: </strong>
          {{
            (selectedExam.registered_by && selectedExam.registered_by.name) ||
            "No Registration"
          }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Registered At: </strong>
          {{ formatDate(selectedExam.registered_at) }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Marketing Code: </strong>
          {{ selectedExam.marketing_code }}
        </p>
        <p class="text-gray-700 text-md">
          <strong class="text-primary font-lg text-lg">Branch: </strong>
          {{ (selectedExam.branch && selectedExam.branch.name) || "No Branch" }}
        </p>
      </div>

      <!-- Modal Footer -->
      <div class="mt-6 flex justify-end">
        <button
          @click="closeModal"
          class="px-6 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import formatDate from "./FormDate";

const props = defineProps({
  selectedExam: {
    type: Object,
    required: true,
  },
  isExam: {
    type: Boolean,
    required: true,
  },
  isInstructors: {
    type: Boolean,
    required: true,
  },
  isEmployee: {
    type: Boolean,
    required: true,
  },
  isCourse: {
    type: Boolean,
    required: true,
  },
  isReservation: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
/* Optional: Add any custom styles for the modal */
</style>
