import { get, post, patch } from './client.js';

export function createScreeningSession(data) {
  return post('/screenings/', data);
}

export function listScreeningSessions({ skip = 0, limit = 50, patient_id, facility_id, status } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (patient_id) params.set('patient_id', patient_id);
  if (facility_id) params.set('facility_id', facility_id);
  if (status) params.set('status', status);
  return get(`/screenings/?${params}`);
}

export function getScreeningSession(sessionId) {
  return get(`/screenings/${sessionId}`);
}

export function updateScreeningSession(sessionId, data) {
  return patch(`/screenings/${sessionId}`, data);
}

export function addFundusImage(sessionId, data) {
  return post(`/screenings/${sessionId}/images`, data);
}

export function listImagesForSession(sessionId) {
  return get(`/screenings/${sessionId}/images`);
}
