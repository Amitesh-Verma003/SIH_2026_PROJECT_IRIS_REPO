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

export function getNearbyHealthcare({ lat, lng, district, state } = {}) {
  const params = new URLSearchParams();
  if (lat !== undefined && lat !== null) params.set('lat', lat);
  if (lng !== undefined && lng !== null) params.set('lng', lng);
  if (district) params.set('district', district);
  if (state) params.set('state', state);
  return get(`/referrals/nearby-healthcare?${params.toString()}`);
}

export function getNearestOphthalmologist({ district, lat, lng } = {}) {
  const params = new URLSearchParams();
  if (district) params.set('district', district);
  if (lat !== undefined && lat !== null) params.set('lat', lat);
  if (lng !== undefined && lng !== null) params.set('lng', lng);
  return get(`/referrals/nearest-ophthalmologist?${params.toString()}`);
}

export function notifyDoctorAndPatient(data) {
  return post('/referrals/notify-parties', data);
}

