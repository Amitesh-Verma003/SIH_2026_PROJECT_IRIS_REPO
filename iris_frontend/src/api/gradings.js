import { get, post } from './client.js';

export function createGrading(data) {
  return post('/gradings/', data);
}

export function listGradings({ skip = 0, limit = 50, image_id, referable_only = false } = {}) {
  const params = new URLSearchParams({ skip, limit });
  if (image_id) params.set('image_id', image_id);
  if (referable_only) params.set('referable_only', 'true');
  return get(`/gradings/?${params}`);
}

export function getGrading(gradingId) {
  return get(`/gradings/${gradingId}`);
}
