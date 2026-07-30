import { getDeviceToken } from '../utils/deviceToken';

const BASE_URL = 'http://localhost:8080/api/v1';

async function request(path, options = {}) {
  const deviceToken = getDeviceToken();
  const headers = {
    'X-Device-Token': deviceToken,
    ...options.headers,
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  getReports: (params = {}) => {
    const query = new URLSearchParams();
    if (params.sort) query.set('sort', params.sort);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    return request(`/reports?${query.toString()}`);
  },

  getReport: (id) => request(`/reports/${id}`),

  createReport: (formData) =>
    request('/reports', { method: 'POST', body: formData }),

  upvoteReport: (id) =>
    request(`/reports/${id}/upvote`, { method: 'POST' }),

  updateStatus: (id, status) =>
    request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getStats: () => request('/stats'),

  getComments: (reportId) => request(`/reports/${reportId}/comments`),

  createComment: (reportId, content) =>
    request(`/reports/${reportId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

export const UPLOADS_URL = 'http://localhost:8080';
