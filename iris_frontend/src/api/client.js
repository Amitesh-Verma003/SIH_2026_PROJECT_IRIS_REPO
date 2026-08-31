/**
 * IRIS AI — Centralized API client
 *
 * All backend calls go through this module.  During development the
 * Vite dev-proxy rewrites `/api/*` → `http://localhost:8000/api/*`,
 * so we never hard-code a full URL here.
 */

export function getBaseUrl() {
  if (typeof window !== 'undefined' && localStorage.getItem('iris_backend_url')) {
    return `${localStorage.getItem('iris_backend_url').replace(/\/$/, '')}/api`;
  }
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  // When hosted on Railway, automatically route to the active Railway backend service
  if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
    return 'https://astonishing-dedication-production-433d.up.railway.app/api';
  }
  return '/api';
}

async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch { /* ignore parse errors */ }
    const error = new Error(detail || `API ${res.status}: ${detail}`);
    error.status = res.status;
    error.detail = detail;
    throw error;
  }

  // 204 No Content (e.g. DELETE)
  if (res.status === 204) return null;
  return res.json();
}

export function get(path) {
  return request(path);
}

export function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function postFormData(path, formData) {
  return request(path, { method: 'POST', body: formData });
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}

