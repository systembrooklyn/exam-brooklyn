<script setup>
const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const updateField = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};
</script>

<template>
  <div class="card p-5">
    <div class="space-y-6">
      <!-- SECTION 1: PERSONAL INFORMATION -->
      <div class="space-y-3">
        <h2
          class="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b pb-1 mb-2"
        >
          Personal Information
        </h2>

        <div class="grid grid-cols-12 gap-3">
          <!-- Name -->
          <div class="col-span-12">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Name</label
            >
            <input
              type="text"
              class="input-field text-sm"
              :value="modelValue.name"
              @input="updateField('name', $event.target.value)"
              placeholder="Enter Student Name"
            />
          </div>
          <div class="col-span-12">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Scholarship</label
            >
            <input
              type="text"
              class="input-field text-sm"
              :value="modelValue.scholarship"
              @input="updateField('scholarship', $event.target.value)"
              placeholder="Amount"
            />
          </div>

          <!-- Nationality -->
          <div class="col-span-12">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Nationality</label
            >
            <input
              class="input-field text-sm"
              :value="modelValue.nationality"
              @input="updateField('nationality', $event.target.value)"
              placeholder="Nationality"
            />
          </div>
          <!-- Grade -->
          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Grade</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.grade"
                @change="updateField('grade', $event.target.value)"
              >
                <option value="" disabled selected>Select Grade</option>
                <option>5 Years Ex</option>
                <option>4 Years Ex</option>
              </select>
            </div>
          </div>
          <!-- Student Type -->
          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Student Type</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.studentType"
                @change="updateField('studentType', $event.target.value)"
              >
                <option value="" disabled selected>Select Type</option>
                <option>Engineer</option>
                <option>Accountant</option>
                <option>HR</option>
              </select>
            </div>
          </div>
          <!-- Scholarship -->
        </div>
      </div>

      <!-- SECTION 2: STUDY INFORMATION -->
      <div class="space-y-3">
        <h2
          class="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b pb-1 mb-2"
        >
          Study Information
        </h2>

        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Study Type</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.studyType"
                @change="updateField('studyType', $event.target.value)"
              >
                <option value="" disabled selected>Study Type</option>
                <option>Online</option>
                <option>Offline</option>
              </select>
            </div>
          </div>

          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Category</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.studyCategory"
                @change="updateField('studyCategory', $event.target.value)"
              >
                <option value="" disabled selected>Category</option>
                <option>HR</option>
                <option>Management</option>
                <option>Engineering</option>
              </select>
            </div>
          </div>

          <div class="col-span-12">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Payment Method</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.paymentMethod"
                @change="updateField('paymentMethod', $event.target.value)"
              >
                <option value="" disabled selected>Method</option>
                <option>2 months</option>
                <option>4 months</option>
                <option>6 months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: REQUIRED PAPERS -->
      <div class="space-y-3">
        <h2
          class="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b pb-1 mb-2"
        >
          Required Papers
        </h2>

        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >ID</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.paperID"
                @change="updateField('paperID', $event.target.value)"
              >
                <option value="" disabled selected>Status</option>
                <option>ID</option>
              </select>
            </div>
          </div>

          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Certificate</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.paperCertificate"
                @change="updateField('paperCertificate', $event.target.value)"
              >
                <option value="" disabled selected>Status</option>
                <option>Certificate</option>
              </select>
            </div>
          </div>

          <div class="col-span-12">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >HR</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.paperHR"
                @change="updateField('paperHR', $event.target.value)"
              >
                <option value="" disabled selected>Status</option>
                <option>HR</option>
                <option>Not HR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: OFFERS -->
      <div class="space-y-3">
        <h2
          class="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b pb-1 mb-2"
        >
          Offers
        </h2>

        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Top student</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.topStudent"
                @change="updateField('topStudent', $event.target.value)"
              >
                <option value="" disabled selected>Is Top Student?</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          <div class="col-span-6">
            <label
              class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >Offer Mode</label
            >
            <div class="relative">
              <select
                class="select-field text-sm"
                :value="modelValue.offerMode"
                @change="updateField('offerMode', $event.target.value)"
              >
                <option value="" disabled selected>Select Offer Mode</option>
                <option>In class</option>
                <option>Online</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
