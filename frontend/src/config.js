const ENV_URL = process.env.REACT_APP_API_URL || "http://localhost:7860";
// A saved connection only counts if it was saved under the CURRENT config generation --
// otherwise it's a leftover (an old Kaggle/ngrok URL, or a stale/mistyped manual entry from
// before a fix) and would silently win over the current default forever. Bump CONFIG_GEN to
// force every saved browser connection to reset to the current default; a fresh manual
// "Connect" made after that still sticks normally until the next bump.
const CONFIG_GEN = "3";
const VERSION_KEY = "interiorai_config_gen";
export function saveApiUrl(url, key) {
  localStorage.setItem("interiorai_api_url", url);
  localStorage.setItem(VERSION_KEY, CONFIG_GEN);
  if (key !== undefined) localStorage.setItem("interiorai_connection_key", key);
}
export function getApiUrl() {
  const local = ['localhost','127.0.0.1'].includes(window.location.hostname);
  const saved = localStorage.getItem(VERSION_KEY) === CONFIG_GEN ? localStorage.getItem("interiorai_api_url") : null;
  const url = saved || ENV_URL;
  if (!local && /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)) return '';
  return url.replace(/\/+$/, '');
}
export function getConnectionKey() {
  const saved = localStorage.getItem(VERSION_KEY) === CONFIG_GEN ? localStorage.getItem("interiorai_connection_key") : null;
  return saved || process.env.REACT_APP_CONNECTION_KEY || "";
}
export function apiHeaders(extra = {}) {
  const key = getConnectionKey();
  return {
    "ngrok-skip-browser-warning": "true",
    ...(key ? { Authorization: "Bearer " + key } : {}),
    ...extra,
  };
}
export const API_URL = ENV_URL;
