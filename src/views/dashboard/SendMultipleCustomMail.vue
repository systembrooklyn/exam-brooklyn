<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 flex items-center justify-center">
    <div class="max-w-3xl w-full mx-auto">
      <!-- Page Header -->
      <div class="mb-6 text-center">
   <div class="flex items-center justify-center gap-2">
         <div class="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4">
          <Mail class="text-blue-600 dark:text-blue-400" :size="32" />
        </div>
           <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Send Multiple Custom Mail
        </h1>
   </div>
       
        <p class="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Compose and send emails to multiple recipients
        </p>
      </div>

      <!-- Email Composer Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <!-- Card Header with Gradient Line -->
        <div class="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div class="p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Recipients Section -->
            <div class="space-y-4">
              <EmailInput
                v-model="formData.to"
                label="To"
                placeholder="Add recipients..."
                :required="true"
              />
              
              <div class="flex gap-4">
                <div class="flex-1">
                  <EmailInput
                    v-model="formData.cc"
                    label="CC"
                    placeholder="Add CC..."
                    :required="false"
                  />
                </div>
                <div class="flex-1">
                  <EmailInput
                    v-model="formData.bcc"
                    label="BCC"
                    placeholder="Add BCC..."
                    :required="false"
                  />
                </div>
              </div>
            </div>

            <!-- Subject Field -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.subject"
                type="text"
                placeholder="Enter subject line"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <!-- Body Field -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message <span class="text-red-500">*</span>
              </label>
              <RichTextEditor
                v-model="formData.body"
                placeholder="Write your message..."
              />
            </div>

            <!-- Footer Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-8">
              <div class="flex-1">
                <AttachmentUploader v-model="formData.attachments" />
              </div>
              
              <div class="flex items-center gap-3 ml-4">
                <button
                  type="button"
                  @click="$router.push('/systems')"
                  class="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  <Send :size="18" v-if="!loading" />
                  <Loader2 :size="18" class="animate-spin" v-else />
                  <span>{{ loading ? 'Sending...' : 'Send Message' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Mail, Send, Loader2 } from 'lucide-vue-next';
import EmailInput from '@/components/global/EmailInput.vue';
import RichTextEditor from '@/components/global/RichTextEditor.vue';
import AttachmentUploader from '@/components/global/AttachmentUploader.vue';
import { sendMultipleCustomMail } from '@/api/emailService';
import notyf from '@/components/global/notyf';

const loading = ref(false);

const formData = ref({
  to: [],
  cc: [],
  bcc: [],
  subject: '',
  body: '',
  attachments: []
});

const validateForm = () => {
  if (formData.value.to.length === 0) {
    notyf.error('Please add at least one recipient');
    return false;
  }

  if (!formData.value.subject.trim()) {
    notyf.error('Subject is required');
    return false;
  }

  if (!formData.value.body.trim() || formData.value.body === '<p></p>') {
    notyf.error('Message body is required');
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  console.log('handleSubmit called, validating form...');
  if (!validateForm()) {
    console.log('Form validation failed');
    return;
  }

  console.log('Form validation passed, setting loading=true');
  loading.value = true;

  try {
    const payload = {
      to: formData.value.to,
      cc: formData.value.cc,
      bcc: formData.value.bcc,
      subject: formData.value.subject,
      body: formData.value.body,
      attachments: formData.value.attachments
    };
    console.log('Calling sendMultipleCustomMail with payload:', payload);

    const response = await sendMultipleCustomMail(payload);
    
    console.log('API response received:', response);
    notyf.success('Email sent successfully! ✉️');

    // Clear ALL form fields including CC and BCC
    formData.value = {
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: []
    };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.log('Error response data:', error.response.data);
      console.log('Error response status:', error.response.status);
    }
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
    notyf.error(errorMessage);
  } finally {
    console.log('Finally block executed, setting loading=false');
    loading.value = false;
  }
};
</script>

<style scoped>
/* Custom Scrollbar for the page if needed */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
