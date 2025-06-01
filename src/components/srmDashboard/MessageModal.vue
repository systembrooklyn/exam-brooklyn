<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-xl p-6 w-[100%] max-w-md shadow-lg space-y-4">
      <h3 class="text-lg font-bold text-primary mb-4 text-center">
        {{
          type === "email" || type === "share"
            ? `Send Email to ${recipient}`
            : `Send SMS to ${recipient}`
        }}
      </h3>

      <div v-if="type === 'share'" class="space-y-4">
        <input type="text" readonly class="input-field" :value="recipient" />

        <select class="input-field">
          <option value="" disabled>Select a Course</option>
          <option
            v-for="course in courseStore.courses"
            :key="course.id"
            :value="course.id"
          >
            {{ course.name }}
          </option>
        </select>

        <input
          type="text"
          v-model="message"
          class="input-field"
          placeholder="Module Code"
        />
      </div>

      <textarea
        v-model="message"
        rows="5"
        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Write your message here..."
      >
      </textarea>

      <div class="flex justify-end space-x-2">
        <button
          @click="close"
          class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          @click="send"
          :class="[
            'px-4 py-2 text-white rounded-md',
            type === 'email'
              ? 'bg-blue-600 hover:bg-primary'
              : 'bg-green-600 hover:bg-green-700',
          ]"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useCourseStore } from "@/stores/courseStore";

const courseStore = useCourseStore();

const props = defineProps({
  type: String, // "email" أو "phone"
  recipient: String, // البريد أو رقم الهاتف
  visible: Boolean, // هل المودال ظاهر؟
});

// الأحداث التي يصدرها المكون
const emits = defineEmits(["update:visible", "send"]);

// الرسالة التي يكتبها المستخدم
const message = ref("");

// إغلاق المودال
const close = () => {
  emits("update:visible", false);
  message.value = "";
};

// إرسال الرسالة
const send = () => {
  emits("send", message.value);
  close();
};

onMounted(() => {
  courseStore.fetchCourses();
});
</script>
<style scoped>
.input-field {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: border 0.3s ease;
}

.input-field:focus {
  border-color: #007bff;
}
</style>
