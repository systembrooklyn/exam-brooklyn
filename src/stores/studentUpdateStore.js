// 📁 src/stores/studentUpdateStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { UPDATE_STUDENT_BASIC_INFO } from "../api/Api";
import { handleError } from "./handleError";
import notyf from "../components/global/notyf";

export const useStudentUpdateStore = defineStore("studentUpdateStore", () => {
  const loading = ref(false);
  const error = ref(null);

  const updateStudent = async (id, updatedData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.put(
        UPDATE_STUDENT_BASIC_INFO(id),
        updatedData,
      );
      const updatedStudent = response.data.data;

      notyf.success("Student updated successfully");
      return updatedStudent;
    } catch (err) {
      handleError(err);
      error.value = err.response?.data?.message || "An error occurred while updating the student.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    updateStudent,
  };
});
