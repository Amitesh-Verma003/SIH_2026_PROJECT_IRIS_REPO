import { get, post, patch, del } from './client.js';

export function createPatient(data) {
  return post('/patients/', data);
}

export function listPatients({ skip = 0, limit = 50, facility_id } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (facility_id) params.set('facility_id', facility_id);
  return get(`/patients/?${params}`);
}

export function getPatient(patientId) {
  return get(`/patients/${patientId}`);
}

export function updatePatient(patientId, data) {
  return patch(`/patients/${patientId}`, data);
}

export function deletePatient(patientId) {
  return del(`/patients/${patientId}`);
}
