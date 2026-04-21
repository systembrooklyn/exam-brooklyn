<template>
  <div class="relative" ref="container">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    
    <div 
      class="w-full border border-gray-300 rounded-lg bg-white cursor-pointer min-h-[42px] relative transition-all duration-200"
      :class="{'ring-2 ring-indigo-500/20 border-indigo-500': isOpen}"
      @click="toggleDropdown"
    >
      <!-- Cap height so many tags don’t break modals / layout; scroll inside. -->
      <div
        class="max-h-52 min-h-[42px] overflow-y-auto overflow-x-hidden p-1.5 pr-10 scroll-smooth"
      >
        <div class="flex flex-wrap gap-1.5 content-start">
          <span v-if="selectedOptions.length === 0" class="text-gray-400 py-1 px-2 select-none">{{ placeholder }}</span>
          
          <div 
            v-for="item in selectedOptions" 
            :key="item[valueKey]"
            class="bg-indigo-50 text-indigo-700 text-sm py-0.5 px-2 rounded inline-flex items-center gap-1 border border-indigo-100 max-w-full min-w-0"
            @click.stop
          >
            <span class="min-w-0 flex-1 truncate">{{ item[labelKey] }}</span>
            <button 
              type="button"
              @click.stop="removeItem(item)"
              class="hover:text-indigo-900 focus:outline-none shrink-0"
              :aria-label="`Remove ${item[labelKey]}`"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <div class="absolute right-3 top-2.5 pointer-events-none text-gray-400">
        <svg class="w-4 h-4 transition-transform duration-200" :class="{'rotate-180': isOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div 
      v-if="isOpen" 
      class="absolute z-[999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in-down"
    >
      <div class="p-2 sticky top-0 bg-white border-b border-gray-100 z-[1]">
        <input 
          ref="searchInput"
          v-model="searchQuery" 
          type="text" 
          placeholder="Search..." 
          class="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          @click.stop
        />
        <button
          v-if="showSelectAll && options.length"
          type="button"
          class="mt-2 w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-50 cursor-pointer transition-colors"
          @click.stop="toggleSelectAllFiltered"
        >
          <div
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150 shrink-0"
            :class="selectAllBoxClass"
          >
            <svg
              v-if="selectAllFilteredState === 'all'"
              class="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else-if="selectAllFilteredState === 'some'"
              class="w-3 h-3 text-indigo-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-800">{{ selectAllRowLabel }}</span>
        </button>
      </div>

      <div class="py-1">
        <div 
          v-for="option in filteredOptions" 
          :key="option[valueKey]"
          class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
          @click.stop="toggleOption(option)"
        >
          <div 
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150"
            :class="isSelected(option) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'"
          >
            <svg v-if="isSelected(option)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span class="text-sm text-gray-700" :class="{'font-medium text-indigo-700': isSelected(option)}">{{ option[labelKey] }}</span>
        </div>
        <div v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-sm text-gray-500">
          No results found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array, // Expected to be array of IDs (values)
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select options'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  /** Show “Select all” for the current list (respects search filter). */
  showSelectAll: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const container = ref(null);
const searchInput = ref(null);

const optionMatchesModel = (optVal) => {
  if (!props.modelValue?.length) return false;
  return props.modelValue.some((v) => v == optVal);
};

const selectedOptions = computed(() => {
  if (!props.modelValue) return [];
  return props.options.filter((opt) => optionMatchesModel(opt[props.valueKey]));
});

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return props.options;
  return props.options.filter(opt => 
    String(opt[props.labelKey]).toLowerCase().includes(query)
  );
});

/** 'all' | 'some' | 'none' — for rows currently shown in the dropdown. */
const selectAllFilteredState = computed(() => {
  const f = filteredOptions.value;
  if (!f.length) return "none";
  let n = 0;
  for (const o of f) {
    if (isSelected(o)) n++;
  }
  if (n === 0) return "none";
  if (n === f.length) return "all";
  return "some";
});

const selectAllBoxClass = computed(() => {
  const s = selectAllFilteredState.value;
  if (s === "all") return "bg-indigo-600 border-indigo-600";
  if (s === "some") return "bg-indigo-100 border-indigo-600";
  return "border-gray-300 bg-white";
});

const selectAllRowLabel = computed(() => {
  const q = searchQuery.value.trim();
  if (q) return "Select all shown";
  return "Select all";
});

function toggleSelectAllFiltered() {
  const filtered = filteredOptions.value;
  if (!filtered.length) return;
  const filteredVals = filtered.map((o) => o[props.valueKey]);
  if (selectAllFilteredState.value === "all") {
    const newValue = props.modelValue.filter(
      (v) => !filteredVals.some((fid) => fid == v),
    );
    emit("update:modelValue", newValue);
    return;
  }
  const merged = [...props.modelValue];
  for (const fid of filteredVals) {
    if (!merged.some((v) => v == fid)) merged.push(fid);
  }
  emit("update:modelValue", merged);
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    setTimeout(() => {
        if(searchInput.value) searchInput.value.focus();
    }, 50);
  } else {
      searchQuery.value = '';
  }
};

const isSelected = (option) => {
  return optionMatchesModel(option[props.valueKey]);
};

const toggleOption = (option) => {
  const id = option[props.valueKey];
  const newValue = [...props.modelValue];
  const idx = newValue.findIndex((v) => v == id);

  if (idx >= 0) {
    newValue.splice(idx, 1);
  } else {
    newValue.push(id);
  }

  emit('update:modelValue', newValue);
};

const removeItem = (item) => {
  const optVal = item[props.valueKey];
  const newValue = props.modelValue.filter((v) => v != optVal);
  emit('update:modelValue', newValue);
};

const closeDropdown = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false;
    searchQuery.value = '';
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
