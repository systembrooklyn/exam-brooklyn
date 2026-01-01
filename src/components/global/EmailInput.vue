<template>
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="flex flex-wrap gap-2 p-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      <!-- Email Tags -->
      <div
        v-for="(email, index) in displayedEmails"
        :key="index"
        class="flex items-center gap-2 px-3 py-1.5 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium transition-all group"
      >
        <span>{{ email }}</span>
        <button
          type="button"
          @click="removeEmail(index)"
          class="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
          title="Remove"
        >
          <X :size="14" />
        </button>
      </div>
      
      <!-- Expand/Collapse Button -->
      <button
        v-if="hiddenCount > 0 && !isExpanded"
        type="button"
        @click="toggleExpand"
        class="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>+{{ hiddenCount }} more</span>
      </button>

      <button
        v-if="isExpanded && emails.length > MAX_VISIBLE_EMAILS"
        type="button"
        @click="toggleExpand"
        class="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>Show less</span>
      </button>
      
      <!-- Input Field -->
      <input
        v-model="currentEmail"
        @keydown.enter.prevent="addEmail"
        @keydown.tab.prevent="addEmail"
        @blur="addEmail"
        @paste="handlePaste"
        type="email"
        :placeholder="emails.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[200px] outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
      />
    </div>
    
    <!-- Error Message -->
    <Transition name="fade">
      <div v-if="error" class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle :size="16" class="text-red-500" />
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </Transition>
    
    <!-- Helper Text -->
    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
      <Info :size="12" />
      Press Enter or Tab to add email
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X, AlertCircle, Info } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Enter email address'
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const currentEmail = ref('');
const error = ref('');

const emails = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const addEmail = () => {
  const email = currentEmail.value.trim();
  
  if (!email) {
    error.value = '';
    return;
  }
  
  if (!validateEmail(email)) {
    error.value = 'Please enter a valid email address';
    return;
  }
  
  if (emails.value.includes(email)) {
    error.value = 'This email is already added';
    return;
  }
  
  emails.value = [...emails.value, email];
  currentEmail.value = '';
  error.value = '';
};

const removeEmail = (index) => {
  emails.value = emails.value.filter((_, i) => i !== index);
};
const handlePaste = (event) => {
  event.preventDefault();
  const pastedText = event.clipboardData.getData('text');
  
  if (!pastedText) return;

  // Split by common delimiters: comma, space, newline, semicolon
  const rawEmails = pastedText.split(/[\s,;\n]+/);
  
  const validEmails = rawEmails
    .map(email => email.trim())
    .filter(email => email.length > 0 && validateEmail(email));

  // Add unique valid emails that aren't already in the list
  const newEmails = validEmails.filter(email => !emails.value.includes(email));
  
  if (newEmails.length > 0) {
    emails.value = [...emails.value, ...newEmails];
    error.value = '';
  }
  currentEmail.value = '';
};

// Collapsible logic
const isExpanded = ref(false);
const MAX_VISIBLE_EMAILS = 3;

const displayedEmails = computed(() => {
  if (isExpanded.value) return emails.value;
  return emails.value.slice(0, MAX_VISIBLE_EMAILS);
});

const hiddenCount = computed(() => Math.max(0, emails.value.length - MAX_VISIBLE_EMAILS));

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
