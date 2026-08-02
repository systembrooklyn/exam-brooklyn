<template>
  <div class="min-h-screen w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-4 bg-gray-50/50 dark:bg-gray-900/50 animate-fade-in">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <router-link to="/tickets" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Tickets</router-link>
            <ChevronRight class="w-3.5 h-3.5" />
            <span>New</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <TicketPlus class="w-6 h-6" />
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create a New Ticket</h1>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
            Submit a new support request. Please fill in all required fields.
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden w-full">
      <!-- Card Header -->
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-3 bg-gradient-to-r from-indigo-50/30 to-white dark:from-indigo-950/15 dark:to-gray-800">
        <span class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <TicketPlus class="w-5 h-5" />
        </span>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-none">Ticket Details</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Describe your issue or request in detail.</p>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="submitTicket" class="px-6 py-6 space-y-5">

        <!-- Type & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type"
              required
              class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>Select type...</option>
              <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category"
              required
              class="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>Select category...</option>
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <!-- URL -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            URL <span class="text-[10px] text-gray-400 lowercase italic normal-case">(optional)</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Link class="w-4 h-4" />
            </span>
            <input
              type="url"
              v-model="form.url"
              placeholder="https://example.com"
              class="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Description <span class="text-red-500">*</span>
          </label>
          <WhatsAppEditor
            v-model="form.desc"
            placeholder="Describe the issue or request in detail..."
          />
        </div>

        <!-- Attachment -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Attachment <span class="text-[10px] text-gray-400 lowercase italic normal-case">(optional)</span>
          </label>

          <div
            class="flex flex-col items-center justify-center px-6 pt-6 pb-5 border-2 border-dashed rounded-xl transition-all cursor-pointer"
            :class="selectedFileName
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10'"
          >
            <div v-if="!selectedFileName" class="text-center">
              <Paperclip class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <label class="cursor-pointer">
                <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Click to upload</span>
                <span class="text-sm text-gray-500 dark:text-gray-400"> or drag and drop</span>
                <input type="file" class="sr-only" @change="handleFileUpload" />
              </label>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
            </div>
            <div v-else class="flex items-center gap-3">
              <span class="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle class="w-5 h-5" />
              </span>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedFileName }}</p>
                <p class="text-xs text-gray-400">File selected</p>
              </div>
              <button type="button" @click="clearFile" class="ml-2 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <router-link
            to="/tickets"
            class="px-4 py-2 text-sm font-semibold text-gray-650 dark:text-gray-300 hover:text-gray-850 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="store.loading"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/10"
          >
            <span v-if="store.loading" class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Submit Ticket
          </button>
        </div>

      </form>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { TicketPlus, ChevronRight, Link, Paperclip, X, CheckCircle } from 'lucide-vue-next';
import { useTicketsStore } from '@/stores/ticketsStore';
import WhatsAppEditor from '@/components/global/WhatsAppEditor.vue';

const router = useRouter();
const store = useTicketsStore();

const form = ref({ type: '', category: '', url: '', desc: '' });
const file = ref(null);
const selectedFileName = ref('');

const typeOptions = computed(() => {
  const meta = store.metaOptions;
  return meta?.type || meta?.types || [];
});

const categoryOptions = computed(() => {
  const meta = store.metaOptions;
  return meta?.category || meta?.categories || [];
});

onMounted(() => {
  if (!typeOptions.value.length) store.fetchMetaOptions();
});

const handleFileUpload = (event) => {
  const f = event.target.files?.[0];
  if (f) {
    file.value = f;
    selectedFileName.value = f.name;
  }
};

const clearFile = () => {
  file.value = null;
  selectedFileName.value = '';
};

const submitTicket = async () => {
  try {
    const formData = new FormData();
    formData.append('type', form.value.type);
    formData.append('category', form.value.category);
    if (form.value.url) formData.append('url', form.value.url);
    formData.append('desc', form.value.desc);
    if (file.value) formData.append('attachment', file.value);

    await store.createTicket(formData);
    router.push('/tickets');
  } catch (error) {
    console.error('Failed to create ticket', error);
  }
};
</script>
