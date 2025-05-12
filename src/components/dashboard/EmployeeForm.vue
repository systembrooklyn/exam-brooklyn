<template>
  <div class="space-y-6 p-6">
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
    <div class="relative">
      <label class="block text-sm mb-1">Email</label>
      <div class="flex items-center space-x-2">
        <LucideMail class="text-gray-500 w-5 h-5 absolute left-3" />
        <input
          v-model="form.email"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
          type="email"
          placeholder="Enter email"
        />
      </div>
    </div>
    <div class="relative w-[95%]">
      <label class="block text-sm mb-1"
        >Roles <span class="text-xs text-gray-400">(Optional)</span></label
      >
      <multiselect
        v-model="form.roles"
        :options="roles || []"
        track-by="id"
        label="name"
        multiple
        placeholder="Select Roles"
        :loading="roleStore.loading"
        loading-text="Loading roles..."
        no-options="No roles available"
        class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
        :reduce="(selected) => selected.id"
      />
    </div>
  </div>
</template>

<script setup>
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { useRoleStore } from "@/stores/roleStore";
import { LucideUser } from "lucide-vue-next";

const roleStore = useRoleStore();
const props = defineProps({
  form: Object,
});
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
