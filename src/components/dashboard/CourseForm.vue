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
    </div>
    <div class="relative">
      <label class="block text-sm mb-1">Course Code</label>
      <div class="flex items-center space-x-2">
        <LucideCode class="text-gray-400 w-5 h-5 absolute left-3" />
        <input
          v-model="form.code"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
          type="text"
          placeholder="Enter course code"
        />
      </div>
    </div>
    <div class="relative w-[95%]">
      <label class="block text-sm mb-1"
        >Instructors
        <span class="text-xs text-gray-400">(Optional)</span></label
      >
      <multiselect
        v-model="form.instructor"
        :options="instructors"
        track-by="id"
        label="name"
        multiple
        placeholder="Select Instructors"
        :loading="instructorStore.loading"
        loading-text="Loading instructors..."
        no-options="No instructors available"
        class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
        :reduce="(selected) => selected.id"
      />
    </div>
    <div class="relative w-[95%]">
      <label class="block text-sm mb-1"
        >Scholarship
        <span class="text-xs text-gray-400">(Optional)</span></label
      >
      <multiselect
        v-model="form.scholarship"
        :options="scholarships"
        track-by="id"
        label="name"
        multiple
        placeholder="Select Scholarships"
        :loading="scholarshipStore.loading"
        loading-text="Loading scholarships..."
        no-options="No scholarships available"
        class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
        :reduce="(selected) => selected.id"
      />
    </div>
  </div>
</template>

<script setup>
import { LucideCode, LucideUser } from "lucide-vue-next";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { useInstructorStore } from "@/stores/instructorStore";
import { useScholarshipStore } from "@/stores/scholarships";

import { computed, onMounted } from "vue";
const scholarshipStore = useScholarshipStore();
const instructorStore = useInstructorStore();

const scholarships = computed(() => scholarshipStore.scholarships);
const instructors = computed(() => instructorStore.instructors);

const props = defineProps({
  form: Object,
});
onMounted(() => {
  instructorStore.fetchInstructors();
  scholarshipStore.fetchScholarships();
});
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
