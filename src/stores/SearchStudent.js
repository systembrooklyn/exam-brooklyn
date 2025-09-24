// 📁 src/stores/courseStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { STUDENT, STUDENT_SEARCH } from "../api/Api";
import { handleError } from "./handleError";

export const useStudentStore = defineStore("studentStore", () => {
  const student = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const studentId = ref(null);
  const studentData = ref(null);
  const loadingData = ref(false);
  const studentsList = ref([]);

 const fetchStudent = async (id) => {
  studentId.value = id;
  console.log(`Fetching student with ID: ${id}`);
  
  loadingData.value = true;
  error.value = null;

  try {
    const response = await apiClient.get(`${STUDENT}/${id}`);
    student.value = response.data.data;
    localStorage.setItem("studentId", JSON.stringify(student.value.student.id));
    console.log("Student ID:", student.value.student.id);
    
    console.log("Student fetched successfully:", response.data);
    console.log("Fetched student:", student.value);
  } catch (err) {
    handleError(err);
    error.value = err.response?.data?.message || "An error occurred while fetching the student.";
    throw err; 
  } finally {
    loadingData.value = false;
  }
};

const fetchStudentByOther = async (value) => {
  console.log(`Fetching student with value: ${value}`);
     
  loading.value = true;
  error.value = null;
   
  try {
    const response = await apiClient.post(STUDENT_SEARCH, { value: value });
    studentsList.value = response.data.data;
    console.log("Student fetched successfully:", response.data.data);
    
    // ✅ ارجع الـ response
    return response;
  } catch (err) {
    studentsList.value = null;
    handleError(err);
    throw err; // ✅ ارمي الخطأ عشان الكومبونينت يتعامل معاه
  } finally {
    loading.value = false;
  }
};

const fetchDataStuden = async (name) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get(`${STUDENT}/${studentId.value}/${name}`);
    studentData.value = response.data.data;
    console.log("Student fetched successfully:", response.data);
  } catch (err) {
    studentData.value = null;
    handleError(err);
  } finally {
    loading.value = false;
  }
};



  return {
    student,
    fetchDataStuden,
    fetchStudentByOther,
    studentData,
    studentsList,
    loading,
    error,
    fetchStudent,
    loadingData
  };
});
