/**
 * Compare scholarship calc APIs and price_setting_ids payloads.
 *
 * Usage:
 *   BEARER_TOKEN="..." SCHOLARSHIP_ID=108 GRADE=Good RESERVATION_ID=123 node scripts/test-scholarship-calc-apis.mjs
 *
 * Optional:
 *   PAYMENT_METHOD="2 Months"
 *   BASE_URL=https://shark-app-s8ndy.ondigitalocean.app/api/
 */

import {
  buildActivePriceSettings,
  flattenPriceSettings,
  enrichPriceSettingsFromRawResponse,
  getGradeSettingFromResponse,
  resolveSubPaymentMethods,
} from "../src/utils/scholarshipPlanResponse.js";

const BASE_URL =
  process.env.BASE_URL || "https://shark-app-s8ndy.ondigitalocean.app/api/";
const TOKEN = process.env.BEARER_TOKEN || "";
const SCHOLARSHIP_ID = process.env.SCHOLARSHIP_ID || "108";
const GRADE = process.env.GRADE || "Good";
const RESERVATION_ID = process.env.RESERVATION_ID || "";
const PAYMENT_METHOD = process.env.PAYMENT_METHOD || "2 Months";

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return json.data ?? json;
}

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return json.data ?? json;
}

function summarizeSettings(data, label) {
  const flat = flattenPriceSettings(data);
  const enriched = enrichPriceSettingsFromRawResponse(data, flat);
  const types = [...new Set(enriched.map((p) => p.type))];
  const subPayments = enriched.filter((p) => p.type === "Sub Payment Method");
  console.log(`\n--- ${label} ---`);
  console.log("types:", types.join(", "));
  console.log(
    "items:",
    enriched.map((p) => `${p.id}:${p.name} (${p.type})`).join(", ")
  );
  console.log(
    "Sub Payment Method:",
    subPayments.length
      ? subPayments.map((p) => `${p.id}:${p.name} parents=${JSON.stringify(p.parent_ids || p.parent_id || p.parents?.map((x) => x.id))}`).join("; ")
      : "(none)"
  );
  return enriched;
}

function buildPayload(flattened, gradeFromApi) {
  const selections = {
    Grade: gradeFromApi?.name || GRADE,
    "Payment Method": PAYMENT_METHOD,
    Fees: flattened.filter((p) => p.type === "Fees").map((p) => p.name),
  };
  const active = buildActivePriceSettings(flattened, selections, gradeFromApi);
  const ids = active.map((p) => p.id).sort((a, b) => a - b);
  const subResolved = resolveSubPaymentMethods(flattened, selections);
  console.log("\n--- Built payload (Calculator logic) ---");
  console.log("selections:", JSON.stringify(selections));
  console.log("price_setting_ids:", ids);
  console.log(
    "includes Sub Payment Method:",
    active.some((p) => p.type === "Sub Payment Method"),
    subResolved.map((p) => p.id)
  );
  return ids;
}

function printSchedule(label, data) {
  const schedule = data?.payment_plan?.schedule || data?.schedule || [];
  console.log(`\n--- ${label} schedule (${schedule.length} items) ---`);
  if (!schedule.length) {
    console.log("(empty schedule → UI shows equal avgAmount fallback)");
    return;
  }
  schedule.slice(0, 6).forEach((item, i) => {
    console.log(`  [${i}] amount=${item.amount} due=${item.due_date}`);
  });
  const amounts = schedule.map((s) => s.amount);
  const allEqual = amounts.length > 1 && amounts.every((a) => a === amounts[0]);
  console.log("all equal?", allEqual, "| first amount:", amounts[0]);
}

function runLocalFixture() {
  console.log("\n========== LOCAL FIXTURE (no token) ==========");
  const apiData = [
    { id: 11, name: "Good", type: "Grade", is_active: true },
    {
      id: 8,
      name: "2 Months",
      type: "Payment Method",
      is_active: true,
      children: [{ id: 10, name: "First in class installment", type: "Sub Payment Method", is_active: true }],
    },
    { id: 16, name: "Administration Fees", type: "Fees", is_active: true },
    { id: 23, name: "Insurance", type: "Fees", is_active: true },
  ];
  const flat = summarizeSettings(apiData, "Fixture scholarship-price-settings");
  buildPayload(flat, getGradeSettingFromResponse(flat));
}

async function runLiveTests() {
  if (!TOKEN) {
    console.log("\nNo BEARER_TOKEN — skipping live API calls.");
    return;
  }

  console.log("\n========== LIVE API TESTS ==========");

  const psData = await apiPost("reservations/scholarship-price-settings", {
    scholarship_id: Number(SCHOLARSHIP_ID) || SCHOLARSHIP_ID,
    grade: GRADE || null,
  });
  const flat = summarizeSettings(psData, "scholarship-price-settings");
  const grade = getGradeSettingFromResponse(flat);
  const ids = buildPayload(flat, grade);

  const subIds = flat.filter((p) => p.type === "Sub Payment Method").map((p) => p.id);
  const idsWithoutSub = ids.filter((id) => !subIds.includes(id));

  const calcWith = await apiPost("reservations/calculator", {
    scholarship_id: Number(SCHOLARSHIP_ID) || SCHOLARSHIP_ID,
    price_setting_ids: ids,
  });
  printSchedule("calculator WITH sub", calcWith);

  if (idsWithoutSub.length !== ids.length) {
    const calcWithout = await apiPost("reservations/calculator", {
      scholarship_id: Number(SCHOLARSHIP_ID) || SCHOLARSHIP_ID,
      price_setting_ids: idsWithoutSub,
    });
    printSchedule("calculator WITHOUT sub", calcWithout);
  }

  const deadlines = await apiPost("reservations/calculateDeadlines", {
    scholarship_id: Number(SCHOLARSHIP_ID) || SCHOLARSHIP_ID,
    price_setting_ids: ids,
  });
  printSchedule("calculateDeadlines (Scholarship tab)", deadlines);

  if (RESERVATION_ID) {
    const reservation = await apiGet(`reservations/${RESERVATION_ID}`);
    const resFlat = summarizeSettings(reservation.price_settings || [], "reservation price_settings");
    console.log(
      "reservation price_setting_ids:",
      resFlat.map((p) => p.id).sort((a, b) => a - b)
    );
  }
}

runLocalFixture();
runLiveTests().catch((err) => {
  console.error("\nLive test error:", err.message);
  process.exitCode = 1;
});
