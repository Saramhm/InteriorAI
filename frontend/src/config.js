const ENV_URL = process.env.REACT_APP_API_URL || "http://localhost:7860";
// A saved connection only counts if it was saved while THIS build's default (ENV_URL) was
// active -- otherwise it's a leftover from a previous deploy (e.g. an old Kaggle/ngrok URL
// from before we had a dedicated GPU server) and would silently win over the new default
// forever. Bumping the default (a new deploy with a different REACT_APP_API_URL) makes any
// older saved connection stale automatically; a fresh manual "Connect" still sticks normally.
const VERSION_KEY = "interiorai_config_for_env";
export function saveApiUrl(url, key) {
  localStorage.setItem("interiorai_api_url", url);
  localStorage.setItem(VERSION_KEY, ENV_URL);
  if (key !== undefined) localStorage.setItem("interiorai_connection_key", key);
}
export function getApiUrl() {
  const local = ['localhost','127.0.0.1'].includes(window.location.hostname);
  const saved = localStorage.getItem(VERSION_KEY) === ENV_URL ? localStorage.getItem("interiorai_api_url") : null;
  const url = saved || ENV_URL;
  if (!local && /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)) return '';
  return url.replace(/\/+$/, '');
}
export function getConnectionKey() {
  const saved = localStorage.getItem(VERSION_KEY) === ENV_URL ? localStorage.getItem("interiorai_connection_key") : null;
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
