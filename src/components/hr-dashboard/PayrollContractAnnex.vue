<template>
  <div
    class="rounded-xl border border-violet-100 bg-violet-50/70 dark:border-violet-900/40 dark:bg-violet-950/25 p-4"
  >
    <p class="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase mb-1">
      Contract annex
    </p>
    <p class="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
      Salary calculation is based on this contract document.
      <span v-if="contractType" class="font-medium text-gray-600 dark:text-gray-300">
        ({{ contractType }})
      </span>
    </p>

    <div v-if="hasDescription" class="text-sm text-gray-800 dark:text-gray-200">
      <template v-for="(part, i) in noteParts(description)" :key="i">
        <a
          v-if="part.type === 'link'"
          :href="part.value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-600 underline break-all hover:text-indigo-700 dark:text-indigo-400"
        >
          View contract annex
        </a>
        <span v-else class="whitespace-pre-wrap break-words">{{ part.value }}</span>
      </template>
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">
      No contract document link on file for this payroll.
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { noteParts } from "@/utils/noteParts";

const props = defineProps({
  contract: { type: Object, default: null },
});

const description = computed(() =>
  String(props.contract?.description ?? "").trim(),
);

const contractType = computed(() => {
  const t = props.contract?.type;
  return t ? String(t).replace(/_/g, " ") : "";
});

const hasDescription = computed(() => Boolean(description.value));
</script>
