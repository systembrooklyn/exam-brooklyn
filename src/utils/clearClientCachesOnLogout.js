import Cookies from "js-cookie";

/** Keys the app stores in localStorage that are tied to the logged-in user. */
const LOCALSTORAGE_KEYS = ["studentId"];

/**
 * Clear session and user-related client storage so the next login does not
 * inherit the previous account's cached data. Intentionally does not remove
 * `theme` (and similar) from localStorage.
 */
export function clearClientCachesOnLogout() {
  try {
    sessionStorage.clear();
  } catch {
    /* ignore private mode / quota */
  }

  for (const key of LOCALSTORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  const cookieOpts = { path: "/" };
  try {
    Cookies.remove("token", cookieOpts);
    Cookies.remove("st_id", cookieOpts);
    Cookies.remove("attempt_id", cookieOpts);
  } catch {
    /* ignore */
  }
}
