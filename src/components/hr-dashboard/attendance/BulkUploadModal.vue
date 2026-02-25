<template>
  <HrModal
    :show="show"
    title="Bulk Upload Attendance"
    :loading="loading"
    @close="$emit('close')"
    @save="handleUpload"
  >
    <div class="space-y-4">
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-start gap-4">
        <div>
          <h4 class="text-sm font-bold text-blue-800 mb-2">Instructions:</h4>
          <p class="text-xs text-blue-700 leading-relaxed">
            Please upload a <strong>CSV</strong> file with the following headers and format. Ensure date is <strong>YYYY-MM-DD</strong> and time is <strong>HH:MM:SS</strong>.
          </p>
        </div>
        <a 
          :href="templateUrl" 
          download="BulkUploadTemplate.csv"
          class="flex-shrink-0 bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <LucideDownload class="w-3 h-3" /> Download Template
        </a>
      </div>

      <div class="relative group">
        <input 
          type="file" 
          @change="onFileChange" 
          accept=".csv" 
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div class="border-2 border-dashed border-gray-300 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 p-8 rounded-xl transition-all text-center">
          <LucideUpload class="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600 group-hover:text-indigo-600">
            {{ selectedFile ? selectedFile.name : 'Click or drag CSV file to upload' }}
          </p>
          <p class="text-xs text-gray-400 mt-1">Maximum file size: 5MB</p>
        </div>
      </div>
    </div>
  </HrModal>
</template>

<script setup>
import { ref } from 'vue';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import { LucideUpload, LucideDownload } from 'lucide-vue-next';
import notyf from '@/components/global/notyf';

const props = defineProps({
  show: Boolean,
  loading: Boolean,
  templateUrl: String
});

const emit = defineEmits(['close', 'upload']);

const selectedFile = ref(null);

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const handleUpload = () => {
  if (!selectedFile.value) {
    notyf.error('Please select a CSV file');
    return;
  }
  emit('upload', selectedFile.value);
  selectedFile.value = null; // Reset for next time
};
</script>
