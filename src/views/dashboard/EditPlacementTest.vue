<template>
  <div class="m-10 bg-white shadow-md rounded-2xl p-5">
    <h1 class="text-3xl font-bold text-indigo-700 mb-5">Edit Placement Test</h1>

    <div v-if="placementStore.loading" class="flex justify-center items-center py-20">
      <div class="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10"></div>
    </div>

    <div v-else>
      <ExamInfoForm v-model="exam" />

      <div class="flex justify-end mt-6">
        <button
          @click="updatePlacementTest"
          :disabled="!hasChanges || submitting"
          :class="[
            'px-6 py-2 rounded flex items-center cursor-pointer justify-center min-w-[140px] transition-all duration-300',
            !hasChanges || submitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          ]"
        >
          <span
            v-if="submitting"
            class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"
          ></span>
          Save Changes
        </button>
      </div>

      <div class="flex justify-center items-center mt-6 gap-4">
        <button
          v-if="showGetButton"
          @click="loadQuestions"
          class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex items-center gap-2 min-w-[140px]"
        >
          <span v-if="loadingQuestions" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
          <span v-else>Get Questions</span>
        </button>

        <button
          v-if="!showAdder"
          @click="handleAddQuestion"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 min-w-[140px]"
        >
          + Add Question
        </button>
      </div>

      <QuestionEditor v-if="showEditor" :questions="questions" @update:questions="handleQuestionsUpdate" />
      <ExamQuestions v-if="showAdder" ref="questionForm" />

      <div v-if="showAdder" class="flex justify-center mt-6">
        <button
          @click="submitNewQuestions"
          :disabled="addQuestions.length === 0"
          :class="[
            'px-6 py-2 rounded flex items-center cursor-pointer justify-center min-w-[140px] transition-all duration-300',
            addQuestions.length === 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'
          ]"
        >
          <span v-if="submittingNewQuestions" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
          <span v-else>Submit New Questions</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from "vue";
import { useRoute } from "vue-router";
import { usePlacementTestsStore } from "@/stores/placementTestsStore";
import ExamInfoForm from "@/components/dashboard/ExamInfoForm.vue";
import QuestionEditor from "@/components/dashboard/QuestionEditor.vue";
import ExamQuestions from "@/components/dashboard/ExamQuestions.vue";
import notyf from '@/components/global/notyf';

const placementStore = usePlacementTestsStore();
const route = useRoute();
const emitter = inject('emitter');

const loadingQuestions = ref(false);
const submitting = ref(false);
const submittingNewQuestions = ref(false);
const showEditor = ref(false);
const showAdder = ref(false);
const showGetButton = ref(true);
const hasChanges = ref(false);
const addQuestions = ref([]);
const questions = ref([]);
const questionForm = ref();

const exam = ref({
  name: "",
  description: "",
  duration: 0,
  is_active: true,
});

let initialExamData = {};

watch(
  () => ({ ...exam.value }),
  () => {
    hasChanges.value = JSON.stringify(initialExamData) !== JSON.stringify(exam.value);
  },
  { deep: true }
);

onMounted(async () => {
  const id = route.params.id;
  await placementStore.fetchPlacementTests(); // This would ideally be `fetchPlacementTestById(id)`
  const test = placementStore.placementTests.find(e => e.id == id);
  if (test) {
    exam.value = {
      name: test.name,
      description: test.description,
      duration: test.duration,
      is_active: !!test.is_active,
    };
    initialExamData = { ...exam.value };
  }

  emitter.on('questions', (questionsData) => {
    addQuestions.value = questionsData;
  });
});

const loadQuestions = async () => {
  loadingQuestions.value = true;
  try {
    await placementStore.fetchExamQuestions(route.params.id);
    questions.value = placementStore.examQuestions;
    showEditor.value = true;
    showAdder.value = false;
    showGetButton.value = false;
  } catch (err) {
    console.error("Error loading questions:", err);
  } finally {
    loadingQuestions.value = false;
  }
};

const handleQuestionsUpdate = (updated) => {
  questions.value = updated;
  hasChanges.value = true;
};

const updatePlacementTest = async () => {
  submitting.value = true;
  try {
    if (showAdder.value && questionForm.value) {
      const newQuestions = questionForm.value.getQuestions();
      if (newQuestions) {
        exam.value.questions = newQuestions;
      }
    }

    // You should implement `updatePlacementTest` in your store
    await placementStore.updatePlacementTest(route.params.id, exam.value);

    notyf.success("Placement test updated successfully!");
    hasChanges.value = false;
  } catch (err) {
    console.error("Error updating placement test:", err);
    notyf.error("Failed to update placement test.");
  } finally {
    submitting.value = false;
  }
};

const submitNewQuestions = async () => {
  submittingNewQuestions.value = true;

  for (let question of addQuestions.value) {
    if (!question.question_text || !question.option_a || !question.option_b || !question.option_c || !question.option_d) {
      notyf.error("Please fill in all fields for each question.");
      submittingNewQuestions.value = false;
      return;
    }
  }

  try {
    console.log("Submitting new questions:", addQuestions.value);
    console.log("Exam ID:", route.params.id);
    

   await placementStore.addNewQuestions(route.params.id, addQuestions.value);
    addQuestions.value = [];
    showAdder.value = false;
    showGetButton.value = true;
    notyf.success("Questions added successfully!");
  } catch (err) {
    console.error("Error submitting new questions:", err);
    notyf.error("Failed to add questions.");
  } finally {
    submittingNewQuestions.value = false;
  }
};

const handleAddQuestion = () => {
  showAdder.value = true;
  showEditor.value = false;
  showGetButton.value = true;
};
</script>
