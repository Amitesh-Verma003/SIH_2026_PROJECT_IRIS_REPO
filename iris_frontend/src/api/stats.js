import { get } from './client.js';

export function getDashboardStats() {
  return get('/stats/dashboard');
}
