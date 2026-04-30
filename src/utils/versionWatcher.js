import notyf from "@/components/global/notyf";

const VERSION_URL = "/version.json";
const CHECK_INTERVAL_MS = 60_000;
const RELOAD_DELAY_MS = 4_000;


let knownVersion = null;
let timerId = null;
let inFlight = false;
let reloadScheduled = false;
let freezeOverlayEl = null;

async function fetchVersion() {
  const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`version fetch failed: ${res.status}`);
  }
  const json = await res.json();
  return String(json?.version ?? "").trim();
}

async function checkForNewVersion() {
  if (inFlight) return;
  inFlight = true;
  try {
    const next = await fetchVersion();
    if (!next) return;
    if (knownVersion == null) {
      knownVersion = next;
      return;
    }
    if (knownVersion !== next) {
      scheduleReloadForNewVersion();
    }
  } catch {
    // Ignore transient network or cache errors.
  } finally {
    inFlight = false;
  }
}

function scheduleReloadForNewVersion() {
  if (reloadScheduled) return;
  reloadScheduled = true;
  showFreezeOverlay();
  notyf.success("تم تحديث النظام. سيتم إعادة تحميل الصفحة تلقائيا خلال ثانيتين.");
  window.setTimeout(() => {
    forceReloadWithCacheBuster();
  }, RELOAD_DELAY_MS);
}

function forceReloadWithCacheBuster() {
  const url = new URL(window.location.href);
  url.searchParams.set("v", String(Date.now()));
  window.location.replace(url.toString());
}

function showFreezeOverlay() {
  if (freezeOverlayEl) return;
  const overlay = document.createElement("div");
  overlay.setAttribute("id", "app-version-freeze-overlay");
  overlay.innerHTML = `
    <div class="version-freeze-card" role="status" aria-live="assertive">
      <div class="version-freeze-spinner" aria-hidden="true"></div>
      <h2>تم تحديث النظام الآن</h2>
      <p>سيتم إعادة تحميل الصفحة تلقائيا خلال ثانيتين لضمان عرض أحدث البيانات.</p>
      <small>من فضلك انتظر... لا تغلق الصفحة.</small>
    </div>
  `;

  const style = document.createElement("style");
  style.setAttribute("data-version-freeze-style", "true");
  style.textContent = `
    #app-version-freeze-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 23, 42, 0.82);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(2px);
    }
    #app-version-freeze-overlay .version-freeze-card {
      width: min(560px, 100%);
      background: #ffffff;
      border-radius: 14px;
      padding: 22px 20px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    }
    #app-version-freeze-overlay .version-freeze-spinner {
      width: 42px;
      height: 42px;
      border: 4px solid #e5e7eb;
      border-top-color: #4f46e5;
      border-radius: 999px;
      margin: 0 auto 14px;
      animation: versionFreezeSpin 0.8s linear infinite;
    }
    #app-version-freeze-overlay h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 800;
      color: #111827;
    }
    #app-version-freeze-overlay p {
      margin: 0 0 8px;
      font-size: 15px;
      color: #374151;
      line-height: 1.6;
    }
    #app-version-freeze-overlay small {
      font-size: 13px;
      color: #6b7280;
      display: block;
    }
    @keyframes versionFreezeSpin {
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  freezeOverlayEl = overlay;
}

export function startVersionWatcher() {
  if (timerId != null) return;

  void checkForNewVersion();
  timerId = window.setInterval(() => {
    void checkForNewVersion();
  }, CHECK_INTERVAL_MS);

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("focus", onWindowFocus);
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    void checkForNewVersion();
  }
}

function onWindowFocus() {
  void checkForNewVersion();
}

