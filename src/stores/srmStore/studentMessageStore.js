// 📁 src/stores/studentMessage.js
import { defineStore } from 'pinia'
import { handleError } from '../handleError'
import apiClient from '../../api/axiosInstance'
import { SEND_STUDEND_MAIL ,SEND_STUDEND_SMS } from '../../api/Api'
import { ref } from 'vue'

export const useStudentMessageStore = defineStore('studentMessage', () => {
  // 🧩 state
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

 
  const sendSms = async (payload) => {
    try {
      loading.value = true
      error.value = null
      success.value = false
      

      const { data } = await apiClient.post(SEND_STUDEND_SMS, payload)
      success.value = true
      return data
    } catch (err) {
      
      handleError(err)
      console.error('sendSms error:', err)
    } finally {
      loading.value = false
    }
  }

  // 📧 إرسال إيميل
  const sendMail = async (payload) => {
    try {
      loading.value = true
      error.value = null
      success.value = false

      const { data } = await apiClient.post(SEND_STUDEND_MAIL, payload)
      success.value = true
      return data
    } catch (err) {

      console.error('sendMail error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    success,
    sendSms,
    sendMail,
  }
})
