<template>
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
      <Paperclip :size="16" />
      Attachments (Optional)
    </label>
    
    <!-- Upload Button -->
    <div>
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <button
        type="button"
        @click="$refs.fileInput.click()"
        class="flex items-center gap-3 px-5 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-gray-700 dark:text-gray-300 font-medium group"
      >
        <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <Upload :size="20" class="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
        <span>Choose Files to Attach</span>
      </button>
    </div>
    
    <!-- File List -->
    <Transition name="list">
      <div v-if="files.length > 0" class="space-y-2">
        <TransitionGroup name="file-list">
          <div
            v-for="(file, index) in files"
            :key="file.name + index"
            class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-md transition-all group"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                <FileIcon :size="20" class="text-blue-600 dark:text-blue-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {{ file.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>{{ formatFileSize(file.size) }}</span>
                </p>
              </div>
            </div>
            
            <button
              type="button"
              @click="removeFile(index)"
              class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-red-500 dark:hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100"
              title="Remove file"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
    
    <!-- Empty State -->
    <div v-if="files.length === 0" class="text-center py-4">
      <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
        <FileIcon :size="16" />
        No files selected
        <Upload :size="16" />
      </p>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Paperclip, X, FileIcon, Upload, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const files = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files);
  
  if (props.multiple) {
    files.value = [...files.value, ...selectedFiles];
  } else {
    files.value = selectedFiles;
  }
  
  // Reset input to allow selecting the same file again
  event.target.value = '';
};

const removeFile = (index) => {
  files.value = files.value.filter((_, i) => i !== index);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s ease;
}

.file-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.file-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.file-list-move {
  transition: transform 0.3s ease;
}
</style>
