import { ref } from "vue";
import { defineStore } from "pinia";
import apiClient from "../api/axiosInstance";
import { ADD_PLACEMENT_QUESTIONS, ADD_PLACEMENT_TEST, GET_ST_BY_EMAIL, PLACEMENT_TESTS } from "../api/Api";
import { handleError } from "./handleError";


export const usePlacementTestsStore = defineStore("placementTests", () => {
  const student = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const placementTests = ref([]);
  const placementTest = ref(null); 
    const examQuestions = ref([]); // لتخزين أسئلة الاختبار

  // ✅ جلب كل الاختبارات
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

  // ✅ جلب اختبار واحد بالتفصيل
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
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`${PLACEMENT_TESTS}/${examId}/questions`);
      console.log(`Fetched questions for exam ID ${examId}:`, response.data);
      
      examQuestions.value = response.data;
    } catch (e) {
      error.value = e;
      handleError(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

 async function addNewQuestions(exam_id, questions) {

console.log(`Adding new questions to exam ID ${exam_id}:`, questions);

  error.value = null;
  try {
    const response = await apiClient.post(`${ADD_PLACEMENT_QUESTIONS}/${exam_id}`, questions);
    return response.data;
  } catch (e) {
    error.value = e;
    handleError(e);
    throw e;
  } finally {
    loading.value = false;
  }
}

  return {
    // state
    student,
    placementTest,
    placementTests,
    loading,
    error,

    // actions
    fetchPlacementTests,
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
