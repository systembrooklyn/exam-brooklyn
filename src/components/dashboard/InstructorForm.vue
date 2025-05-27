<template>
  <div class="space-y-4">
    <!-- Name -->
    <div class="relative">
      <label class="block text-sm mb-1">Name</label>
      <div class="flex items-center space-x-2">
        <LucideUser class="text-gray-500 w-5 h-5 absolute left-3" />
        <input
          v-model="form.name"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
          type="text"
          placeholder="Enter name"
        />
      </div>
    </div>

    <!-- Phone -->
    <div class="relative">
      <label class="block text-sm mb-1">Phone</label>
      <div class="flex items-center space-x-2">
        <LucidePhoneCall class="text-gray-500 w-5 h-5 absolute left-3" />
        <input
          v-model="form.phone"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
          type="text"
          placeholder="Enter phone"
        />
      </div>
      <!-- Error Message -->
      <p v-if="phoneError" class="text-red-500 text-sm mt-1">
        Phone number must be in Egyptian (01X-XXXX-XXXX) or Saudi (05X-XXXX-XXXX) format.
      </p>
    </div>

    <!-- Courses -->
    <div class="relative w-[95%]">
      <label class="block text-sm mb-1">
        Courses <span class="text-xs text-gray-400">(Optional)</span>
      </label>
      <multiselect
        v-model="form.courses"
        :options="courses"
        track-by="id"
        label="name"
        multiple
        placeholder="Select Courses"
        :loading="courseStore.loading"
        loading-text="Loading courses..."
        no-options="No courses available"
        class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
      />
    </div>
  </div>
</template>

<script setup>
import { LucideUser, LucidePhoneCall } from "lucide-vue-next";
import { useCourseStore } from "@/stores/courseStore";
import { computed, ref, onMounted, watch } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

const courseStore = useCourseStore();
const courses = computed(() => courseStore.courses);

const props = defineProps({
  form: Object,
});

const phoneError = ref(false);

onMounted(() => {
  courseStore.fetchCourses();
});

// ✅ Watch for phone validation
watch(
  () => props.form.phone,
  (newPhone) => {
    const egyptRegex = /^01[0125][0-9]{8}$/;
    const saudiRegex = /^05[0-9]{8}$/;
    phoneError.value = !(egyptRegex.test(newPhone) || saudiRegex.test(newPhone));
  }
);
</script>
