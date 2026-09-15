import { get, post, postFormData } from './client.js';

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

/**
 * Live inference using the trained PyTorch EfficientNet-B0 model.
 * Supports File object, Blob, or base64 string.
 */
export function predictDrGrading({
  file = null,
  imageBase64 = null,
  patientId = null,
  facilityId = null,
  screeningSessionId = null,
  saveToDb = false,
  eye = 'right',
  notes = null,
} = {}) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (imageBase64) {
    formData.append('image_base64', imageBase64);
  }
  if (patientId) formData.append('patient_id', patientId);
  if (facilityId) formData.append('facility_id', facilityId);
  if (screeningSessionId) formData.append('screening_session_id', screeningSessionId);
  if (saveToDb) formData.append('save_to_db', 'true');
  if (eye) formData.append('eye', eye);
  if (notes) formData.append('notes', notes);

  return postFormData('/gradings/predict', formData);
}

/**
 * Fetch trained model metadata, architecture details, and validation benchmarks.
 */
export function getModelInfo() {
  return get('/gradings/model-info');
}

/**
 * Dedicated Glaucoma inference using the trained REFUGE UNet segmentation model.
 */
export function predictGlaucoma({ file = null, imageBase64 = null } = {}) {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (imageBase64) formData.append('image_base64', imageBase64);
  return postFormData('/gradings/glaucoma/predict', formData);
}

/**
 * Fetch trained Glaucoma UNet metadata, REFUGE challenge specs, and clinical benchmarks.
 */
export function getGlaucomaModelInfo() {
  return get('/gradings/glaucoma/model-info');
}

