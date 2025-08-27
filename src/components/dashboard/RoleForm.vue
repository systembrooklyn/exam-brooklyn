<template>
  <div>
    <div class="relative">
      <label class="block text-sm mb-1">Name</label>
      <div class="flex items-center gap-2 mb-4">
        <LucideUser class="text-gray-500 w-5 h-5 absolute left-3" />
        <input
          v-model="form.name"
          class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2 pl-10"
          type="text"
          placeholder="Enter name"
        />
      </div>
       <div class="relative w-[97%]">
      <label class="block text-sm mb-1"
        >Permissions
        <span class="text-xs text-gray-400">(Optional)</span></label
      >
      <multiselect
        v-model="form.permissions"
        :options="permissions || []"
        track-by="id"
        label="name"
        multiple
        placeholder="Select Permissions"
        :loading="rolesStore.loading"
        loading-text="Loading permissions..."
        no-options="No permissions available"
        class="w-full border border-gray-200 bg-white outline-0 shadow-2xl shadow-gray-200 rounded-md px-3 py-2"
        :reduce="(selected) => selected.id"
        :append-to-body="true"
      />
    </div>
    </div>
   
  </div>
</template>

<script setup>
import { LucideUser } from "lucide-vue-next";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { useRoleStore } from "@/stores/roleStore";
import { computed, onMounted } from "vue";

const rolesStore = useRoleStore();
const permissions = computed(() => rolesStore.permissions || []);

const props = defineProps({
  form: Object,
});
onMounted(() => {
  rolesStore.fetchPermissions();
});
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
