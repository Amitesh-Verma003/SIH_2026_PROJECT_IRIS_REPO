import { get, post } from './client.js';

/**
 * Fetch live discrete-event telemetry for 50 rural PHC nodes modeled in MATLAB/Simulink.
 * Supports bandwidth throttling simulation and 8.4:1 Wavelet compression toggle.
 */
export function getSimulinkTelemetry({ district = null, compression = true } = {}) {
  const params = new URLSearchParams();
  if (district) params.set('district', district);
  params.set('compression', compression ? 'true' : 'false');
  return get(`/telemetry/simulink-hub?${params.toString()}`);
}

/**
 * Fetch district-level telemedicine queue simulation and capacity planning solver.
 */
export function getDistrictCapacity(districtName) {
  return get(`/telemetry/district-capacity/${encodeURIComponent(districtName)}`);
}

/**
 * Save custom capacity simulation model run.
 */
export function createCapacitySimulation(data) {
  return post('/telemetry/capacity-planning', data);
}
