/**
 * IRIS AI — Centralized API client
 *
 * All backend calls go through this module.  During development the
 * Vite dev-proxy rewrites `/api/*` → `http://localhost:8000/api/*`,
 * so we never hard-code a full URL here.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
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
    throw new Error(`API ${res.status}: ${detail}`);
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

