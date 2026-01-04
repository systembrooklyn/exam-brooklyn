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
  emailData.to.forEach((email, index) => {
    formData.append(`to[${index}]`, email);
  });

  // Add 'cc' emails as array (if provided)
  if (emailData.cc && emailData.cc.length > 0) {
    emailData.cc.forEach((email, index) => {
      formData.append(`cc[${index}]`, email);
    });
  }

  // Add 'bcc' emails as array (if provided)
  if (emailData.bcc && emailData.bcc.length > 0) {
    emailData.bcc.forEach((email, index) => {
      formData.append(`bcc[${index}]`, email);
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
  console.log(
    "Token retrieved:",
    token ? "Yes (length: " + token.length + ")" : "No"
  );

  const url = `${BASE_URL}sendMultipleMail`;
  console.log("Making POST request to:", url);

  // Debug FormData entries
  for (let pair of formData.entries()) {
    console.log("FormData:", pair[0], pair[1]);
  }

  try {
    // Make API request
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Axios response:", response);
    return response.data;
  } catch (error) {
    console.error("Axios error in service:", error);
    throw error;
  }
};
