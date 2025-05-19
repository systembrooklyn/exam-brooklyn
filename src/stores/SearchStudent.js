// 📁 src/stores/courseStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { STUDENT } from "../api/Api";
import notyf from "../components/global/notyf"; // Adjust the path as necessary
import { handleError } from "./handleError";

export const useStudentStore = defineStore("studentStore", () => {
  const student = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const studentId = ref(null);
  const studentData = ref(null);

  const fetchStudent = async (id) => {
    studentId.value = id;
    console.log(`Fetching student with ID: ${id}`);
    
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`${STUDENT}/${id}`);
      student.value = response.data.data;
  
      
      
    } catch (err) {
      handleError(err);
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
      console.log( "Student fetched successfully:", response.data);
      console.log( "Fetched student:", student.value);
      
      
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };


  return {
    student,
    fetchDataStuden,
    studentData,
    loading,
    error,
    fetchStudent,
  };
});
