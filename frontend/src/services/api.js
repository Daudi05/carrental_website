import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Endpoints that use optional JWT — don't retry or redirect on auth errors
const OPTIONAL_AUTH_ENDPOINTS = [
  '/public/notifications',
];

const api = axios.create({ baseURL: BASE, timeout: 15000 });

const SKIP_AUTH_ENDPOINTS = [
  '/public/notifications',
];

api.interceptors.request.use(cfg => {
  const skip = SKIP_AUTH_ENDPOINTS.some(e => cfg.url?.includes(e));
  if (!skip) {
    const token = localStorage.getItem('cr_token');
    if (token && token !== 'null' && token !== 'undefined') {
      cfg.headers.Authorization = `Bearer ${token}`;
    } else {
      delete cfg.headers.Authorization;
    }
  } else {
    delete cfg.headers.Authorization;  // force no token for optional routes
  }
  return cfg;
});

api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;

    // For optional-auth endpoints, never retry or redirect — just resolve empty
    if (OPTIONAL_AUTH_ENDPOINTS.some(e => orig.url?.includes(e))) {
      return Promise.reject(err.response?.data?.message || err.message || 'Request failed');
    }

    // For protected endpoints, attempt token refresh on 401
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = localStorage.getItem('cr_refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE}/auth/refresh`, {},
            { headers: { Authorization: `Bearer ${refresh}` } });
          const tok = res.data.data.access_token;
          localStorage.setItem('cr_token', tok);
          orig.headers.Authorization = `Bearer ${tok}`;
          return api(orig);
        } catch {
          localStorage.removeItem('cr_token');
          localStorage.removeItem('cr_refresh');
          localStorage.removeItem('cr_user');
          window.location.href = '/login';
        }
      } else {
        // No refresh token at all — clear and redirect
        localStorage.removeItem('cr_token');
        localStorage.removeItem('cr_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(err.response?.data?.message || err.message || 'Request failed');
  }
);

export default api;

// ── Service modules ───────────────────────────────────────────────────────────

export const authApi = {
  register:       d  => api.post('/auth/register', d),
  login:          d  => api.post('/auth/login', d),
  me:             () => api.get('/auth/me'),
  updateProfile:  d  => api.put('/auth/profile', d),
  changePassword: d  => api.post('/auth/change-password', d),
};

export const vehiclesApi = {
  list:         p      => api.get('/vehicles', { params: p }),
  get:          id     => api.get(`/vehicles/${id}`),
  categories:   ()     => api.get('/vehicles/categories'),
  brands:       ()     => api.get('/vehicles/brands'),
  availability: (id,p) => api.get(`/vehicles/${id}/availability`, { params: p }),
  create:       d      => api.post('/vehicles', d),
  update:       (id,d) => api.put(`/vehicles/${id}`, d),
  delete:       id     => api.delete(`/vehicles/${id}`),
};

export const bookingsApi = {
  quote:        d      => api.post('/bookings/quote', d),
  create:       d      => api.post('/bookings', d),
  my:           p      => api.get('/bookings/my', { params: p }),
  myDetail:     id     => api.get(`/bookings/my/${id}`),
  cancel:       (id,d) => api.post(`/bookings/my/${id}/cancel`, d),
  all:          p      => api.get('/bookings', { params: p }),
  get:          id     => api.get(`/bookings/${id}`),
  updateStatus: (id,d) => api.patch(`/bookings/${id}/status`, d),
};

export const paymentsApi = {
  process: d  => api.post('/payments/process', d),
  my:      () => api.get('/payments/my'),
  all:     p  => api.get('/payments', { params: p }),
};

export const reviewsApi = {
  vehicle: (id,p) => api.get(`/reviews/vehicle/${id}`, { params: p }),
  create:  d      => api.post('/reviews', d),
};

export const adminApi = {
  dashboard:        ()  => api.get('/admin/dashboard'),
  users:            p   => api.get('/admin/users', { params: p }),
  createStaff:      d   => api.post('/admin/users', d),
  toggleUser:       id  => api.patch(`/admin/users/${id}/toggle`),
  branches:         ()  => api.get('/admin/branches'),
  createBranch:     d   => api.post('/admin/branches', d),
  maintenance:      ()  => api.get('/admin/maintenance'),
  createMaintenance:d   => api.post('/admin/maintenance', d),
  coupons:          ()  => api.get('/admin/coupons'),
  createCoupon:     d   => api.post('/admin/coupons', d),
  auditLogs:        p   => api.get('/admin/audit-logs', { params: p }),
};

export const publicApi = {
  stats:         () => api.get('/public/stats'),
  locations:     () => api.get('/public/locations'),
  notifications: () => api.get('/public/notifications'),
  markRead:      id => api.patch(`/public/notifications/${id}/read`),
};