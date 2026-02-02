<script setup>
import { ref } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["accept"]);

const rulesAccepted = ref(false);

const acceptRules = () => {
  if (rulesAccepted.value) {
    emit("accept");
  }
};
</script>

<template>
  <div
    v-if="show"
    class="rules-modal fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
  >
    <div
      class="rules-content bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      dir="auto"
    >
      <h2
        class="text-2xl font-bold text-center mb-6 text-primary dark:text-blue-400"
        dir="auto"
      >
        قواعد تأدية الامتحانات بقاعة الامتحانات
      </h2>
      <div class="rules-list space-y-4 mb-6">
        <div
          class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start gap-3"
        >
          <span
            class="text-primary dark:text-blue-400 text-lg font-semibold flex-shrink-0"
            >1.</span
          >
          <p
            class="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right flex-1"
            dir="auto"
          >
            غير مسموح باستخدام الهاتف المحمول لأي غرض سواء (استخدامه آلة حاسبة
            – ترجمة – مكالمات).
          </p>
        </div>
        <div
          class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start gap-3"
        >
          <span
            class="text-primary dark:text-blue-400 text-lg font-semibold flex-shrink-0"
            >2.</span
          >
          <p
            class="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right flex-1"
            dir="auto"
          >
            غير مسموح اصطحاب أي مأكولات أو مشروبات داخل قاعة الامتحانات.
          </p>
        </div>
        <div
          class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start gap-3"
        >
          <span
            class="text-primary dark:text-blue-400 text-lg font-semibold flex-shrink-0"
            >3.</span
          >
          <p
            class="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right flex-1"
            dir="auto"
          >
            لا يتم عمل Submit للامتحان إلا في تواجد موظف المراقبة الموجود
            بالقاعة.
          </p>
        </div>
        <div
          class="rule-item p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start gap-3"
        >
          <span
            class="text-primary dark:text-blue-400 text-lg font-semibold flex-shrink-0"
            >4.</span
          >
          <p
            class="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right flex-1"
            dir="auto"
          >
            يسمح في حالة أداء اختبارات المواد استخدام Google Translate من على
            الحاسب فقط وغير مسموح بذلك في حالة أداء اختبارات القبول.
          </p>
        </div>
      </div>
      <div class="flex items-center justify-center mb-6">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="rulesAccepted"
            class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mr-2"
          />
          <span class="text-lg font-medium text-gray-700 dark:text-gray-300" dir="auto">
            قرأت وفهمت القواعد وأوافق عليها
          </span>
        </label>
      </div>
      <div class="text-center">
        <button
          @click="acceptRules"
          :disabled="!rulesAccepted"
          class="buttonClass"
          :class="{
            'opacity-50 cursor-not-allowed': !rulesAccepted,
          }"
        >
          موافق
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rules-modal {
  backdrop-filter: blur(4px);
}

.rules-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rule-item {
  border-right: 4px solid #092c67;
  transition: all 0.3s ease;
}

.rule-item:hover {
  transform: translateX(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark .rule-item {
  border-right-color: #4788f8;
}

.buttonClass {
  font-size: 15px;
  font-family: Arial;
  width: 140px;
  height: 50px;
  border-width: 1px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  border-color: rgba(9, 44, 103, 1);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0px 0px 0px 2px #9fb4f2;
  text-shadow: 0px 1px 0px rgba(136, 148, 179, 1);
  background: linear-gradient(rgb(120, 146, 194), rgba(9, 44, 103, 1));
}

.buttonClass:hover {
  background: linear-gradient(rgba(9, 44, 103, 1), rgb(120, 146, 194));
}
</style>
