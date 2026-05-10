<template>
  <div
    v-show="showModal"
    class="fixed inset-0 bg-[rgba(0,0,0,0.6)] bg-opacity-30 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full relative"
      :class="
        isScholarship
          ? 'max-w-[74%] max-h-[92vh] overflow-y-auto p-4 sm:p-5'
          : 'max-w-[70%] min-h-[90%] p-6'
      "
    >
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
        {{ modalTitle }}
      </h2>

     <div class="">
       <EmployeeForm v-if="isEmployee" :form="form" />
      <InstructorForm v-if="isInstructor" :form="form" />
      <CourseForm v-if="isCourse" :form="form" />
      <ScholarshipForm
        v-if="isScholarship"
        :form="form"
        :isEditing="isEditing"
        @update:courseGroups="forwardCourseGroups"
      />
      <RoleForm v-if="isRole" :form="form" />
      <ReservationsForm v-if="isReservation" :form="form" />
     </div>

      <div class="flex justify-end gap-3 mt-4">
        <button
          @click="saveData"
          :disabled="!hasChanges"
          class="save-button min-w-[90px] flex justify-center items-center"
        >
          <span
            v-if="saving"
            class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"
          ></span>
          Save
        </button>
      </div>

      <button
        @click="closeModal"
        class="absolute top-2 right-2 text-red-800 cursor-pointer hover:text-gray-600 hover:text-3xl text-2xl"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, toRaw } from "vue";
import EmployeeForm from "../dashboard/EmployeeForm.vue";
import InstructorForm from "../dashboard/InstructorForm.vue";
import ScholarshipForm from "../dashboard/ScholarshipForm.vue";
import CourseForm from "../dashboard/CourseForm.vue";
import RoleForm from "../dashboard/RoleForm.vue";
import ReservationsForm from "../dashboard/ReservationsForm.vue";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

const props = defineProps({
  showModal: Boolean,
  modalTitle: String,
  form: Object,
  saving: Boolean,
  isEditing: Boolean,
  isInstructor: Boolean,
  isCourse: Boolean,
  isScholarship: Boolean,
  isEmployee: Boolean,
  isRole: Boolean,
  isReservation: Boolean,
});

const emit = defineEmits(["closeModal", "saveData", "update:courseGroups"]);

/** Plain snapshot for isEqual. toRaw only here — not in watch source — so Vue still tracks nested edits. */
function snapshotForm(form) {
  if (form == null) return {};
  return cloneDeep(toRaw(form));
}

const originalForm = ref(snapshotForm(props.form ?? {}));

const hasChanges = ref(false);

watch(
  () => props.form,
  () => {
    hasChanges.value = !isEqual(
      snapshotForm(props.form ?? {}),
      originalForm.value
    );
  },
  { deep: true }
);

watch(
  () => props.form.student,
  (newForm) => {
    if (!isEqual(newForm, originalForm.value)) {
      hasChanges.value = true;
    }
  },
  { deep: true }
);

const isSaveButtonDisabled = computed(() => {
  const form = props.form;
  const requiredFieldsValid =
    (form.name && form.student?.name && form.student?.email) ||
    (props.isReservation &&
      form.student?.ID_number &&
      form.student?.careerType);

  return !hasChanges.value || !requiredFieldsValid;
});

watch(
  () => props.showModal,
  (isOpen) => {
    if (isOpen) {
      originalForm.value = snapshotForm(props.form ?? {});
      hasChanges.value = false;
    }
  }
);

const closeModal = () => emit("closeModal");
const saveData = () => emit("saveData");

function forwardCourseGroups(list) {
  emit("update:courseGroups", list);
}
</script>
