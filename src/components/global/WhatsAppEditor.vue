<template>
  <div class="w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
    
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div class="flex items-center flex-wrap gap-1">
        <!-- Bold -->
        <button
          type="button"
          @mousedown.prevent="format('bold')"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold class="w-4 h-4" />
        </button>

        <!-- Italic -->
        <button
          type="button"
          @mousedown.prevent="format('italic')"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Italic"
        >
          <Italic class="w-4 h-4" />
        </button>

        <!-- Strikethrough -->
        <button
          type="button"
          @mousedown.prevent="format('strikeThrough')"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough class="w-4 h-4" />
        </button>

        <div class="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1"></div>

        <!-- Monospace / Code -->
        <button
          type="button"
          @mousedown.prevent="formatCode()"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Code"
        >
          <Code class="w-4 h-4" />
        </button>

        <!-- Blockquote -->
        <button
          type="button"
          @mousedown.prevent="formatBlockquote()"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Quote"
        >
          <Quote class="w-4 h-4" />
        </button>

        <div class="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1"></div>

        <!-- Unordered List -->
        <button
          type="button"
          @mousedown.prevent="format('insertUnorderedList')"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List class="w-4 h-4" />
        </button>

        <!-- Ordered List -->
        <button
          type="button"
          @mousedown.prevent="format('insertOrderedList')"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered class="w-4 h-4" />
        </button>
      </div>

      <!-- Color Picker Dropdown -->
      <div class="relative">
        <button
          type="button"
          @click="isColorOpen = !isColorOpen"
          class="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="Text Color"
        >
          <Palette class="w-4 h-4" />
          <span class="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-700" :style="{ backgroundColor: currentColor || 'currentColor' }"></span>
        </button>

        <div v-if="isColorOpen" class="absolute right-0 mt-1.5 p-2 bg-white dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-700/60 shadow-lg z-20 grid grid-cols-5 gap-1.5 w-40 animate-fade-in">
          <button
            v-for="color in colors"
            :key="color.value"
            type="button"
            @mousedown.prevent="applyColor(color.value)"
            class="w-6 h-6 rounded-full border border-gray-250 dark:border-gray-700 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
            :style="{ backgroundColor: color.value || 'transparent' }"
            :title="color.name"
          >
            <span v-if="color.value === ''" class="text-[8px] text-gray-500 font-bold">✖</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenteditable Input Area -->
    <div
      ref="editorRef"
      contenteditable="true"
      @input="onInput"
      @blur="onBlur"
      class="w-full px-4 py-3 min-h-[120px] max-h-[300px] overflow-y-auto text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:outline-none editor-content"
      :placeholder="placeholder"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Palette } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Type your message...'
  }
});

const emit = defineEmits(['update:modelValue', 'blur']);

const editorRef = ref(null);
const isColorOpen = ref(false);
const currentColor = ref('');

// Popular colors for formatting
const colors = [
  { name: 'Default', value: '' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gray', value: '#6b7280' }
];

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || '';
  }
});

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    editorRef.value.innerHTML = newVal || '';
  }
});

const onInput = (e) => {
  emit('update:modelValue', e.target.innerHTML);
};

const onBlur = () => {
  emit('blur');
};

// General styling format
const format = (command, value = null) => {
  document.execCommand(command, false, value);
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML);
  }
};

// Custom format for monospace / code
const formatCode = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    document.execCommand('formatBlock', false, 'pre');
  } else {
    const range = selection.getRangeAt(0);
    const code = document.createElement('code');
    code.className = 'font-mono bg-gray-100 dark:bg-gray-800 text-red-500 px-1 py-0.5 rounded';
    code.appendChild(range.extractContents());
    range.insertNode(code);
  }
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML);
  }
};

// Custom format for blockquote
const formatBlockquote = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    document.execCommand('formatBlock', false, 'blockquote');
  } else {
    const range = selection.getRangeAt(0);
    const bq = document.createElement('blockquote');
    bq.className = 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-500';
    bq.appendChild(range.extractContents());
    range.insertNode(bq);
  }
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML);
  }
};

// Apply custom text color
const applyColor = (color) => {
  currentColor.value = color;
  if (color === '') {
    // Reset/remove color
    document.execCommand('removeFormat', false, null);
  } else {
    document.execCommand('foreColor', false, color);
  }
  isColorOpen.value = false;
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML);
  }
};
</script>

<style scoped>
.editor-content:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}
.dark .editor-content:empty:before {
  color: #6b7280;
}
</style>

<style>
/* Rich Text render styling */
.editor-content pre {
  background-color: #f3f4f6;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: monospace;
  margin: 6px 0;
}
.dark .editor-content pre {
  background-color: #1f2937;
}

.editor-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 16px;
  font-style: italic;
  color: #6b7280;
  margin: 8px 0;
}
.dark .editor-content blockquote {
  border-left-color: #4b5563;
  color: #9ca3af;
}

.editor-content ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 6px 0;
}

.editor-content ol {
  list-style-type: decimal;
  padding-left: 20px;
  margin: 6px 0;
}
</style>
