import { ref } from "vue";
import { defineStore } from "pinia";
import apiClient from "../api/axiosInstance";
import { ADD_PLACEMENT_QUESTIONS, ADD_PLACEMENT_TEST, GET_PLACEMENT_QUESTIONS, GET_ST_BY_EMAIL, PLACEMENT_TESTS } from "../api/Api";
import { handleError } from "./handleError";
import notyf from "../components/global/notyf";


export const usePlacementTestsStore = defineStore("placementTests", () => {
  const student = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const placementTests = ref([]);
  const placementTest = ref(null); 
    const examQuestions = ref([]); 

 
  async function fetchPlacementTests() {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(PLACEMENT_TESTS);
      placementTests.value = response.data.data;
    } catch (e) {
      error.value = e;
      handleError(e);
    } finally {
      loading.value = false;
    }
  }


  async function fetchPlacementTestById(id) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`${PLACEMENT_TESTS}/${id}`);
      placementTest.value = response.data;
    } catch (e) {
      error.value = e;
      handleError(e);
    } finally {
      loading.value = false;
    }
  }


  async function fetchStudenByEmail(email) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(GET_ST_BY_EMAIL,  {email} );
      console.log(`Fetched student by email :`, response.data);
      
      student.value = response.data.data;
    } catch (e) {
      error.value = e;
      handleError(e);
    } finally {
      loading.value = false;
    }
  }

  // ✅ إنشاء اختبار جديد
  async function createPlacementTest(data) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(PLACEMENT_TESTS, data);
      return response.data;
    } catch (e) {
      error.value = e;
      handleError(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // ✅ تحديث اختبار
  async function updatePlacementTest(id, data) {
    error.value = null;
    console.log(`Updating placement test with ID: ${id}`, data);
    
    try {
      const response = await apiClient.put(`${PLACEMENT_TESTS}/${id}`, data);
      return response.data;
    } catch (e) {
      error.value = e;
      handleError(e);
      throw e;
    }
  }

  // ✅ حذف اختبار
  async function deletePlacementTest(id) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`${PLACEMENT_TESTS}/${id}`);
      placementTests.value = placementTests.value.filter(item => item.id !== id);
    } catch (e) {
      error.value = e;
      handleError(e);
    } finally {
      loading.value = false;
    }
  }
  
  const addPlacementTest = async (data) => {
    console.log(`Adding placement test with data:`, data);
    
    error.value = null;
    try {
      const response = await apiClient.post(ADD_PLACEMENT_TEST, data);
      console.log(`Placement test created:`, response.data);
      
      placementTests.value.push(response.data);
       notyf.success("Placement Test added successfully");
      return response.data;
    } catch (e) {
      error.value = e;
      handleError(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  const fetchExamQuestions = async (examId) => {
    console.log(`Fetching questions for exam ID: ${examId}`);
    
    error.value = null;
    try {
      const response = await apiClient.get(`${GET_PLACEMENT_QUESTIONS}/${examId}`);
      console.log(`Fetched exam questions:`, response.data.data);
      
      examQuestions.value = response.data.data || [];
      notyf.success(response.data.message || "Exam questions fetched successfully");
    } catch (e) {
      error.value = e;
      handleError(e);
      throw e;
    } 
  }

 async function addNewQuestions(exam_id, questions) {

console.log(`Adding new questions to exam ID ${exam_id}:`, questions);

  error.value = null;
  try {
    const response = await apiClient.post(`${GET_PLACEMENT_QUESTIONS}/${exam_id}`, {questions});
    return response.data;
  } catch (e) {
    error.value = e;
    handleError(e);
    throw e;
  } finally {
    loading.value = false;
  }
}

const updatePlacementTestQuestion = async (questionId, data) => {
  console.log(`Updating placement test question with ID: ${questionId}`, data); 
  error.value = null;
  try {
    const response = await apiClient.put(`${GET_PLACEMENT_QUESTIONS}/${questionId}`, data);
    console.log(`Placement test question updated:`, response.data);
    notyf.success("Placement Test Question updated successfully");
    return response.data;
  } catch (e) {
    error.value = e;
    handleError(e);
    throw e;
  } finally {
    loading.value = false;
  }
}

const deletePlacementTestQuestion = async (questionId) => {
  console.log(`Deleting placement test question with ID: ${questionId}`); 
  error.value = null;
  try {
    await apiClient.delete(`${GET_PLACEMENT_QUESTIONS}/${questionId}`);
    examQuestions.value = examQuestions.value.filter(q => q.id !== questionId);
    notyf.success("Placement Test Question deleted successfully");
  } catch (e) {
    error.value = e;
    handleError(e);
  } finally {
    loading.value = false;
  }
}

  return {
    // state
    student,
    placementTest,
    placementTests,
    examQuestions,
    loading,
    error,

    // actions
    fetchPlacementTests,
    updatePlacementTestQuestion,
    deletePlacementTestQuestion,
    addNewQuestions,
    addPlacementTest,
    fetchPlacementTestById,
    fetchExamQuestions,
    fetchStudenByEmail,
    createPlacementTest,
    updatePlacementTest,
    deletePlacementTest,
  };
});
