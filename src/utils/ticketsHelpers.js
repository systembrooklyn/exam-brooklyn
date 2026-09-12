import DOMPurify from "dompurify";

/** Normalize fingerprint from user/reader objects (API uses mixed casing). */
export function getFingerprint(user) {
  if (!user || typeof user !== "object") return null;
  return user.fingerPrint || user.fingerprint || null;
}

function namesMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function emailsMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function samePerson(person, reader) {
  if (!person || !reader) return false;

  if (typeof person === "string") {
    return namesMatch(person, reader.name);
  }

  if (person.id && reader.id && String(person.id) === String(reader.id)) {
    return true;
  }

  const personFp = getFingerprint(person);
  if (personFp && reader.fingerprint && String(personFp) === String(reader.fingerprint)) {
    return true;
  }

  if (emailsMatch(person.email, reader.email)) {
    return true;
  }

  if (namesMatch(person.name, reader.name)) {
    return true;
  }

  if (person.author_name && namesMatch(person.author_name, reader.name)) {
    return true;
  }

  return false;
}

/**
 * Readers excluding the current viewer and the comment/ticket owner.
 * Preserves previous TicketDetails + TicketsList filter behavior.
 */
export function getOtherReaders(readers, owner, currentUser) {
  if (!readers || !Array.isArray(readers)) return [];

  return readers.filter((r) => {
    const isSelf = samePerson(currentUser, r);
    const isOwner = samePerson(owner, r);
    return !isSelf && !isOwner;
  });
}

export function formatReaderName(reader) {
  if (!reader?.name) return "";
  return `${reader.name}${reader.fingerprint ? "_" + reader.fingerprint : ""}`;
}

export function formatReaderNameWithTime(reader) {
  if (!reader?.read_at) return formatReaderName(reader);
  const timeStr = new Date(reader.read_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatReaderName(reader)} at ${timeStr}`;
}

/** Allowed tags/attrs aligned with WhatsAppEditor formatting output. */
export const TICKET_HTML_ALLOWED_TAGS = [
  "b",
  "strong",
  "i",
  "em",
  "s",
  "strike",
  "u",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "br",
  "p",
  "div",
  "span",
  "font",
];

export const TICKET_HTML_ALLOWED_ATTR = ["class", "style", "color"];

/** Sanitize ticket HTML for safe v-html rendering (keeps editor formatting). */
export function sanitizeTicketHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMPurify?.sanitize !== "function") {
    return String(html);
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TICKET_HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: TICKET_HTML_ALLOWED_ATTR,
  });
}
