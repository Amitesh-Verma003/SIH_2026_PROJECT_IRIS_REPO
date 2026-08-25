import { get, post, patch } from './client.js';

export function createReferral(data) {
  return post('/referrals/', data);
}

export function listReferrals({ skip = 0, limit = 50, patient_id, status_id, urgency_level } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (patient_id) params.set('patient_id', patient_id);
  if (status_id) params.set('status_id', status_id);
  if (urgency_level) params.set('urgency_level', urgency_level);
  return get(`/referrals/?${params}`);
}

export function getReferral(referralId) {
  return get(`/referrals/${referralId}`);
}

export function updateReferral(referralId, data) {
  return patch(`/referrals/${referralId}`, data);
}
