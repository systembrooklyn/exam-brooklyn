<template>
  <template v-if="hasContent">
    <template v-for="(part, i) in noteParts(text)" :key="i">
      <a
        v-if="part.type === 'link'"
        :href="part.value"
        target="_blank"
        rel="noopener noreferrer"
        class="text-indigo-600 underline break-all hover:text-indigo-700"
      >
        {{ part.value }}
      </a>
      <span v-else class="whitespace-pre-wrap break-words">{{ part.value }}</span>
    </template>
  </template>
  <span v-else>{{ emptyLabel }}</span>
</template>

<script setup>
import { computed } from "vue";
import { noteParts } from "@/utils/noteParts";

const props = defineProps({
  text: { type: String, default: "" },
  emptyLabel: { type: String, default: "-" },
});

const hasContent = computed(() => String(props.text ?? "").trim().length > 0);
</script>
