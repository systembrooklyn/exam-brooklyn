<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] bg-opacity-50 z-50">
    <div class="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-4">
      <!-- العنوان -->
      <h3 class="text-lg font-bold text-primary mb-4 text-center">
        {{ type === 'email' ? `Send Email to ${recipient}` : `Send SMS to ${recipient}` }}
      </h3>

      <!-- مربع الرسالة -->
      <textarea
        v-model="message"
        rows="5"
        class="w-full p-2 border border-gray-300 rounded"
        :placeholder="type === 'email' ? 'Write your email...' : 'Type your SMS...'">
      </textarea>

      <!-- الأزرار -->
      <div class="flex justify-end space-x-2">
        <button @click="close" class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
        <button
          @click="send"
          :class="[
            'px-4 py-2 text-white rounded-md',
            type === 'email' ? 'bg-blue-600 hover:bg-primary' : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// الخصائص التي يستقبلها المكون من المكون الأب
const props = defineProps({
  type: String,        // "email" أو "phone"
  recipient: String,   // البريد أو رقم الهاتف
  visible: Boolean,    // هل المودال ظاهر؟
})

// الأحداث التي يصدرها المكون
const emits = defineEmits(['update:visible', 'send'])

// الرسالة التي يكتبها المستخدم
const message = ref('')

// إغلاق المودال
const close = () => {
  emits('update:visible', false)
  message.value = ''
}

// إرسال الرسالة
const send = () => {
  emits('send', message.value)
  close()
}
</script>
