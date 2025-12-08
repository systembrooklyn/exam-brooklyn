<template>
  <div>
    <label class="text-sm font-medium">{{ label }}</label>
    <select
      class="w-full border rounded px-3 py-2"
      v-model="modelValue"
    >
      <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
    </select>
  </div>
</template>

<script setup>
defineProps(["label", "options", "modelValue"]);
defineEmits(["update:modelValue"]);
</script>
