import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clinicApi = {
  search:  (params) => api.get('/api/clinics/search', { params }),
  getById: (id, params) => api.get(`/api/clinics/${id}`, { params }),
  urgency: (params) => api.get('/api/clinics/urgency', { params }),
};

export const bookingApi = {
  guestBook:  (data) => api.post('/api/bookings/guest', data),
  userBook:   (data) => api.post('/api/bookings', data),
  myBookings: ()     => api.get('/api/bookings/my'),
  getByRef:   (ref)  => api.get(`/api/bookings/ref/${ref}`),
  cancel:     (id)   => api.patch(`/api/bookings/${id}/cancel`),
};

export const reviewApi = {
  getForClinic: (clinicId) => api.get(`/api/reviews/clinic/${clinicId}`),
  add:          (data)     => api.post('/api/reviews', data),
};

export const authApi = {
  sendOtp:       (data) => api.post('/api/auth/send-otp', data),
  register:      (data) => api.post('/api/auth/register', data),
  login:         (data) => api.post('/api/auth/login', data),
  forgotPassword:(data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// Clinic dashboard API
export const clinicDashApi = {
  getInfo:      ()           => api.get('/api/clinic-dashboard/info'),
  updateInfo:   (data)       => api.put('/api/clinic-dashboard/info', data),
  dashboard:    ()           => api.get('/api/clinic-dashboard/dashboard'),
  getBookings:  (params)     => api.get('/api/clinic-dashboard/bookings', { params }),
  updateStatus: (id, status) => api.patch(`/api/clinic-dashboard/bookings/${id}/status`, { status }),
  getServices:  ()           => api.get('/api/clinic-dashboard/services'),
  addService:   (data)       => api.post('/api/clinic-dashboard/services', data),
  updateService:(id, data)   => api.put(`/api/clinic-dashboard/services/${id}`, data),
  getSlots:            (date)  => api.get('/api/clinic-dashboard/slots', { params: { date } }),
  getSlotAvailability: (date)  => api.get('/api/clinic-dashboard/slots/availability', { params: { date } }),
  addSlot:      (data)       => api.post('/api/clinic-dashboard/slots', data),
  deleteSlot:   (id)         => api.delete(`/api/clinic-dashboard/slots/${id}`),
  getPatients:  ()           => api.get('/api/clinic-dashboard/patients'),
};

export default api;
