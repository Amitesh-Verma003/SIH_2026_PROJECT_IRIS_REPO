import { get } from './client.js';

export function getFacilityTypes() {
  return get('/lookups/facility-types');
}

export function getUserRoles() {
  return get('/lookups/user-roles');
}

export function getLesionTypes() {
  return get('/lookups/lesion-types');
}

export function getReferralStatuses() {
  return get('/lookups/referral-statuses');
}
