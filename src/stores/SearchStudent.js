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

  const fetchStudent = async (id) => {
    console.log(`Fetching student with ID: ${id}`);
    
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`${STUDENT}/${id}`);
      student.value = response.data;
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
    loading,
    error,
    fetchStudent,
  };
});
