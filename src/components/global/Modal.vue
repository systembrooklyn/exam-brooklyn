<template>
  <div v-show="showModal"
    class="fixed inset-0 bg-[rgba(0,0,0,0.6)] bg-opacity-30 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] overflow-auto max-h-[90vh] relative">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">
        {{ modalTitle }}
      </h2>


      <EmployeeForm v-if="isEmployee" :form="form" />
      <InstructorForm v-if="isInstructor" :form="form" />
      <CourseForm v-if="isCourse" :form="form" />
      <ScholarshipForm v-if="isScholarship" :form="form" />
      <RoleForm v-if="isRole" :form="form" />
      <ReservationsForm v-if="isReservation" :form="form" />


      <div class="flex justify-end gap-3 mt-6">
        <button @click="saveData" :disabled="isSaveButtonDisabled" class="save-button min-w-[90px] flex justify-center items-center">
          <span v-if="saving"
            class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
          Save
        </button>
      </div>

      <button @click="closeModal"
        class="absolute top-2 right-2 text-red-800 cursor-pointer hover:text-gray-600 hover:text-3xl text-2xl">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import EmployeeForm from "../dashboard/EmployeeForm.vue";
import InstructorForm from "../dashboard/InstructorForm.vue";
import ScholarshipForm from "../dashboard/ScholarshipForm.vue";
import CourseForm from "../dashboard/CourseForm.vue";
import RoleForm from "../dashboard/RoleForm.vue";
import ReservationsForm from "../dashboard/ReservationsForm.vue";
import isEqual from 'lodash/isEqual';

const props = defineProps({
  showModal: Boolean,
  modalTitle: String,
  form: Object,
  saving: Boolean,
  isInstructor: Boolean,
  isCourse: Boolean,
  isScholarship: Boolean,
  isEmployee: Boolean,
  isRole: Boolean,
  isReservation: Boolean,
});

const emit = defineEmits(["closeModal", "saveData"]);

const originalForm = ref({ ...props.form }); // استخدم النسخ البسيط بدلاً من structuredClone

const hasChanges = ref(false);

// استخدم watch على الفورم لمراقبة التغييرات
watch(
  () => props.form,
  (newForm) => {
    hasChanges.value = !isEqual(newForm, originalForm.value);
  },
  { deep: true }
);

// تحقق من الحقول المطلوبة لتفعيل زر الحفظ
const isSaveButtonDisabled = computed(() => {
  const form = props.form;
  const requiredFieldsValid =
    (form.name && form.student?.name && form.student?.email) ||
    (props.isReservation && form.student?.ID_number && form.student?.careerType);

  return !hasChanges.value || !requiredFieldsValid;
});

// مراقبة الـ showModal لضبط القيمة الأولية عند فتح المودال
watch(
  () => props.showModal,
  (isOpen) => {
    if (isOpen) {
      originalForm.value = { ...props.form }; // نسخة جديدة
      hasChanges.value = false;
    }
  }
);

// التعامل مع إغلاق المودال وحفظ البيانات
const closeModal = () => emit("closeModal");
const saveData = () => emit("saveData");
</script>
