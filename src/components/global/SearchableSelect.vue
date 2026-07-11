<template>
  <div ref="rootEl" class="relative w-full">
    <!-- Trigger button -->
    <button
      type="button"
      class="w-full h-10 flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 text-sm bg-white text-left focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <span class="min-w-0 flex-1 truncate" :class="selectedLabel ? 'text-gray-800' : 'text-gray-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <LucideChevronDown
        class="w-4 h-4 shrink-0 text-gray-500 transition-transform pointer-events-none"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </button>

    <!-- Dropdown panel — flips upward automatically when near the bottom of viewport -->
    <div
      v-show="open"
      class="absolute left-0 right-0 z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg"
      :class="openUpward ? 'bottom-full mb-1' : 'top-full mt-1'"
      role="listbox"
      @mousedown.prevent
    >
      <!-- Search input -->
      <div class="px-2 pb-1.5 pt-1 border-b border-gray-100">
        <input
          ref="searchInputEl"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          class="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          @keydown.escape.prevent="open = false"
        />
      </div>

      <!-- Options list -->
      <div class="max-h-52 overflow-y-auto">
        <!-- All / clear option -->
        <button
          v-if="clearable"
          type="button"
          role="option"
          class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer"
          :class="{ 'bg-indigo-50 text-indigo-700 font-medium': !modelValue }"
          @click="select('')"
        >
          {{ clearLabel }}
        </button>

        <!-- Filtered options -->
        <button
          v-for="opt in filteredOptions"
          :key="opt.value"
          type="button"
          role="option"
          class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 cursor-pointer"
          :class="{
            'bg-indigo-50 text-indigo-700 font-medium': String(modelValue) === String(opt.value),
          }"
          @click="select(opt.value)"
        >
          <span class="min-w-0 truncate">{{ opt.label }}</span>
          <span v-if="opt.badge" class="inline-flex shrink-0 items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 tabular-nums">
            {{ opt.badge }}
          </span>
        </button>

        <p v-if="filteredOptions.length === 0" class="px-3 py-2 text-xs text-gray-400">
          No results found.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { LucideChevronDown } from "lucide-vue-next";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: "Select..." },
  searchPlaceholder: { type: String, default: "Search..." },
  clearable: { type: Boolean, default: true },
  clearLabel: { type: String, default: "All" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);

const rootEl = ref(null);
const searchInputEl = ref(null);
const open = ref(false);
const openUpward = ref(false);
const query = ref("");

const selectedLabel = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return "";
  const found = props.options.find((o) => String(o.value) === String(props.modelValue));
  return found?.label ?? "";
});

const filteredOptions = computed(() => {
  const q = String(query.value ?? "").toLowerCase().trim();
  if (!q) return props.options;
  return props.options.filter((o) => {
    const haystack = `${o.label} ${o.searchText ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
});

const DROPDOWN_HEIGHT = 300;

function toggle() {
  open.value = !open.value;
  if (open.value) {
    query.value = "";
    if (rootEl.value) {
      const rect = rootEl.value.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      openUpward.value = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;
    }
    nextTick(() => searchInputEl.value?.focus());
  }
}

function select(value) {
  emit("update:modelValue", value);
  emit("change", value);
  open.value = false;
  query.value = "";
}

function handleOutsideClick(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleOutsideClick));

watch(() => props.modelValue, () => { open.value = false; });
</script>
