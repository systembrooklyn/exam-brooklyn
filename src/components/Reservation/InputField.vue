<template>
  <div>
    <label class="text-sm font-medium">{{ label }}</label>
    <input
      :disabled="disabled"
      v-model="modelValue"
      class="w-full border rounded px-3 py-2"
    />
  </div>
</template>

<script setup>
defineProps(["label", "disabled", "modelValue"]);
defineEmits(["update:modelValue"]);
</script>
