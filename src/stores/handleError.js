// 📁 src/utils/handleError.js
import notyf from "@/components/global/notyf";

/**
 * Handle API errors and show notifications
 * @param {Object} err - The error object caught from an API call
 */
export function handleError(err) {
  // Ensure error is visible in console for debugging
  if (typeof console !== "undefined") {
    console.error("[API ERROR]", err?.response?.data || err);
  }
  const errors = err?.response?.data?.errors;
  const singleMessage =
    err?.response?.data?.message ||
    err?.message ||
    "An unexpected error occurred.";

  if (errors) {
    if (Array.isArray(errors) && errors.length > 0) {
      errors.forEach((error) => {
        notyf.error(error.message || "An error occurred.");
      });
    } else if (typeof errors === "object") {
      // Loop through Laravel's error object { field: ['error msg', ...], ... }
      Object.keys(errors).forEach((key) => {
        const fieldErrors = errors[key];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((msg) => notyf.error(msg));
        } else {
          notyf.error(fieldErrors);
        }
      });
    }
  } else {
    notyf.error(singleMessage);
  }
}
