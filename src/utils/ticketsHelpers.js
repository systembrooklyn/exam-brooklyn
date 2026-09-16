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

/**
 * Tickets list URL query contract (UI persistence only):
 * - tab: omit when open; else closed|tasks|insights
 * - type, category, start_date, end_date: omit when empty
 * - unread_only: '1' when true (never for insights)
 */
const TICKETS_LIST_TABS = new Set(["open", "closed", "tasks", "insights"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function queryParam(value) {
  if (Array.isArray(value)) value = value[0];
  if (value == null) return "";
  return String(value).trim();
}

function parseDateParam(value) {
  const raw = queryParam(value);
  return DATE_RE.test(raw) ? raw : "";
}

export function parseTicketsListQuery(query = {}) {
  const rawTab = queryParam(query.tab).toLowerCase() || "open";
  const tab = TICKETS_LIST_TABS.has(rawTab) ? rawTab : "open";
  const unreadRaw = queryParam(query.unread_only).toLowerCase();

  return {
    tab,
    type: queryParam(query.type),
    category: queryParam(query.category),
    start_date: parseDateParam(query.start_date),
    end_date: parseDateParam(query.end_date),
    unread_only: unreadRaw === "1" || unreadRaw === "true",
  };
}

export function resolveAllowedTab(tab, { canTasks = false, canInsights = false } = {}) {
  if (!TICKETS_LIST_TABS.has(tab)) return "open";
  if (tab === "tasks" && !canTasks) return "open";
  if (tab === "insights" && !canInsights) return "open";
  return tab;
}

export function buildTicketsListQuery({
  tab = "open",
  type = "",
  category = "",
  start_date = "",
  end_date = "",
  unread_only = false,
} = {}) {
  const query = {};
  const safeTab = TICKETS_LIST_TABS.has(tab) ? tab : "open";

  if (safeTab !== "open") query.tab = safeTab;
  if (type) query.type = String(type);
  if (category) query.category = String(category);
  if (start_date && DATE_RE.test(start_date)) query.start_date = start_date;
  if (end_date && DATE_RE.test(end_date)) query.end_date = end_date;
  if (unread_only && safeTab !== "insights") query.unread_only = "1";

  return query;
}

export function ticketsListQueryEquals(a = {}, b = {}) {
  const keys = ["tab", "type", "category", "start_date", "end_date", "unread_only"];
  return keys.every((key) => queryParam(a[key]) === queryParam(b[key]));
}
