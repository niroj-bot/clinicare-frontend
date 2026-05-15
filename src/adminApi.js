import api from './api';

export const adminApi = {
  triggerSlots: () => api.post('/api/admin/slots/generate'),
  // Clinics
  getClinics:    ()           => api.get('/api/admin/clinics'),
  createClinic:  (data)       => api.post('/api/admin/clinics', data),
  updateClinic:  (id, data)   => api.put(`/api/admin/clinics/${id}`, data),

  // Services
  addService:    (clinicId, data) => api.post(`/api/admin/clinics/${clinicId}/services`, data),
  updateService: (id, data)       => api.put(`/api/admin/services/${id}`, data),

  // Slots
  addSlot:       (clinicId, data) => api.post(`/api/admin/clinics/${clinicId}/slots`, data),

  // Bookings
  getBookings:      (clinicId)        => api.get(`/api/admin/clinics/${clinicId}/bookings`),
  updateBookingStatus: (id, status)   => api.patch(`/api/admin/bookings/${id}/status`, { status }),
  getAllBookings: () => api.get('/api/admin/bookings'),
};
