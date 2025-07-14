<template>
  <div>
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
      <div class="relative w-full mt-3">
        <label class="block text-sm mb-1">Scholarship Type</label>
        <select
          v-model="form.study_type"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
        >
          <option disabled value="">Select type</option>
          <option value="Class">Class</option>
          <option value="Online">Online</option>
        </select>
      </div>
    </div>
    <div class="relative w-[95%]">
      <label class="block text-sm mb-1"
        >Courses <span class="text-xs text-gray-400">(Optional)</span></label
      >
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
import { LucideUser } from "lucide-vue-next";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { useCourseStore } from "@/stores/courseStore";

import { computed, onMounted } from "vue";

const courseStore = useCourseStore();
const courses = computed(() => courseStore.courses || []);

const props = defineProps({
  form: Object,
});
onMounted(() => {
  courseStore.fetchCourses();
});
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
