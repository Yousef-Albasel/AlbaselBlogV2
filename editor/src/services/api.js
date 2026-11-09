export const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

export function jsonRequest(endpoint, method, body) {
  return request(endpoint, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}
