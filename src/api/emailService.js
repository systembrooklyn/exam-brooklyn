import axios from "axios";
import { BASE_URL } from "./Api";
import Cookies from "js-cookie";

/**
 * Send multiple custom emails with attachments
 * @param {Object} emailData - Email data object
 * @param {Array<string>} emailData.to - Array of recipient emails (required)
 * @param {Array<string>} emailData.cc - Array of CC emails (optional)
 * @param {Array<string>} emailData.bcc - Array of BCC emails (optional)
 * @param {string} emailData.subject - Email subject (required)
 * @param {string} emailData.body - HTML email body (required)
 * @param {Array<File>} emailData.attachments - Array of File objects (optional)
 * @returns {Promise} API response
 */
export const sendMultipleCustomMail = async (emailData) => {
  const formData = new FormData();

  // Add 'to' emails as array
  emailData.to.forEach((email) => {
    formData.append("to[]", email);
  });

  // Add 'cc' emails as array (if provided)
  if (emailData.cc && emailData.cc.length > 0) {
    emailData.cc.forEach((email) => {
      formData.append("cc[]", email);
    });
  }

  // Add 'bcc' emails as array (if provided)
  if (emailData.bcc && emailData.bcc.length > 0) {
    emailData.bcc.forEach((email) => {
      formData.append("bcc[]", email);
    });
  }

  // Add subject and body
  formData.append("subject", emailData.subject);
  formData.append("body", emailData.body);

  // Add attachments (if provided)
  if (emailData.attachments && emailData.attachments.length > 0) {
    emailData.attachments.forEach((file) => {
      formData.append("attachment", file);
    });
  }

  // Get token from cookies
  const token = Cookies.get("token");

  // Make API request
  const response = await axios.post(`${BASE_URL}sendMultipleMail`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
