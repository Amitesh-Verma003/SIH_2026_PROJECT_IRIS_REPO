import { get } from './client.js';

export function listFacilities({ skip = 0, limit = 50, district_id, is_active } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (district_id) params.set('district_id', district_id);
  if (is_active !== undefined) params.set('is_active', is_active);
  return get(`/facilities/?${params}`);
}

export function getFacility(facilityId) {
  return get(`/facilities/${facilityId}`);
}
