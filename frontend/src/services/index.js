const API_BASE = import.meta.env.VITE_API_URL || '';

const token = () => localStorage.getItem('findit_token');

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Unable to complete this request.');
  return body;
}

async function uploadImage(image) {
  if (!image || !image.startsWith('data:')) return image || undefined;
  const blob = await (await fetch(image)).blob();
  const form = new FormData();
  form.append('file', new File([blob], 'item-photo', { type: blob.type || 'image/png' }));
  return (await request('/api/uploads/image', { method: 'POST', body: form })).imageUrl;
}

export const itemService = {
  async getAll({ type, category, location, status, search, sort = 'recent' } = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ type, category, location, status, search })) {
      if (value && value !== 'all') params.set(key, value);
    }
    const items = await request(`/api/items${params.size ? `?${params}` : ''}`);
    if (sort === 'oldest') return items.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sort === 'location') return items.sort((a, b) => a.location.localeCompare(b.location));
    return items;
  },
  getById: (id) => request(`/api/items/${id}`).catch((error) => error.message === 'Item not found' ? null : Promise.reject(error)),
  getRecent: (limit = 4) => request(`/api/items?limit=${limit}`),
  async getPossibleMatches(itemId) { return (await request(`/api/items/${itemId}/matches`)).matches; },
  async reportItem(payload) {
    const imageUrl = await uploadImage(payload.image);
    return request('/api/items', { method: 'POST', body: JSON.stringify({ ...payload, imageUrl, image: undefined, matchScore: undefined }) });
  },
  updateStatus: (id, status) => request(`/api/admin/items/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: status.replace('-', '_') }) }),
  markReceived: (id, message) => request(`/api/items/${id}/received`, { method: 'PUT', body: JSON.stringify({ message }) }),
  remove: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
  getMyReports: () => request('/api/users/me/items'),
  async getStats() {
    const stats = await request('/api/admin/stats');
    return { total: stats.totalItems, lost: stats.lostItems, found: stats.foundItems, pendingClaims: stats.pendingClaims, returned: stats.returnedItems };
  },
};

export const claimService = {
  getAll: () => request('/api/claims/my'),
  getReceived: () => request('/api/claims/received'),
  updateReceived: (id, status) => request(`/api/claims/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  submitThankYou: (id, message) => request(`/api/claims/${id}/thank-you`, { method: 'PUT', body: JSON.stringify({ message }) }),
  submit: (itemId, description) => request('/api/claims', { method: 'POST', body: JSON.stringify({ itemId, message: description || 'I can provide identifying details.' }) }),
  updateStatus: (id, status) => request(`/api/admin/claims/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  remove: (id) => request(`/api/claims/${id}`, { method: 'DELETE' }),
};

export const adminService = {
  getItems: () => request('/api/admin/items'),
  getClaims: () => request('/api/admin/claims'),
  getStats: () => request('/api/admin/stats'),
  getUsers: () => request('/api/admin/users'),
  updateClaim: (id, status) => request(`/api/admin/claims/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateItemStatus: (id, status) => request(`/api/admin/items/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: status.replace('-', '_') }) }),
  removeItem: (id) => request(`/api/admin/items/${id}`, { method: 'DELETE' }),
};

export const authService = {
  async login({ email, password }) {
    const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('findit_token', result.access_token);
    return { token: result.access_token, user: result.user };
  },
  async register({ name, email, password, confirmPassword, department = 'Not specified', year = 'Not specified' }) {
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
    const result = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, department, year }) });
    localStorage.setItem('findit_token', result.access_token);
    return { token: result.access_token, user: result.user };
  },
  getCurrentUser: () => request('/api/auth/me'),
  async logout() { localStorage.removeItem('findit_token'); },
};

export const matchService = { findPossibleMatches: (itemId) => itemService.getPossibleMatches(itemId) };

export const chatService = {
  list: () => request('/api/chats'),
  unreadCount: () => request('/api/chats/unread-count'),
  openForItem: (itemId) => request('/api/chats', { method: 'POST', body: JSON.stringify({ itemId }) }),
  contacts: () => request('/api/chats/contacts'),
  start: (participantId) => request('/api/chats', { method: 'POST', body: JSON.stringify({ participantId }) }),
  get: (chatId) => request(`/api/chats/${chatId}`),
  messages: (chatId) => request(`/api/chats/${chatId}/messages`),
  send: (chatId, message) => request(`/api/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  markRead: (chatId) => request(`/api/chats/${chatId}/read`, { method: 'PUT' }),
};
