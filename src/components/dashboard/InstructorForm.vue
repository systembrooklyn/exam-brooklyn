<template>
  <div >
    
     <div class="space-y-4">
        <!-- Name input -->
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
    <!-- Add more instructor-specific fields here -->
  </div>
  <div class="relative">
          <label class="block text-sm mb-1">Phone</label>
          <div class="flex items-center space-x-2">
            <LucidePhoneCall class="text-gray-500 w-5 h-5 absolute left-3" />
            <input
              v-model="form.phone"
              class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
              type="text"
              placeholder="Enter name"
            />
          </div>
        </div>
           <div  class="relative w-[95%]">
          <label class="block text-sm mb-1"
            >Courses
            <span class="text-xs text-gray-400">(Optional)</span></label
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
import { LucideUser ,LucidePhoneCall } from 'lucide-vue-next';
import { useCourseStore } from "@/stores/courseStore";
import { computed, onMounted } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";



const courseStore = useCourseStore();
const courses = computed(() => courseStore.courses);

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
