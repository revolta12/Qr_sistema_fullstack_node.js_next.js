import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 [API] Adding token to request:', config.url);
    console.log('🔐 [API] Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 [API] Token added to headers');
    } else {
      console.log('❌ [API] No token found!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ [API] Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods - EXISTING
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'), 
  changePassword: (data) => api.put('/admin/change-password', data),
};

export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  generateQR: (id) => api.get(`/employees/${id}/qr-code`, { responseType: 'blob' }),
  toggleStatus: (id) => api.post(`/employees/${id}/toggle-status`),
};

export const attendanceAPI = {
  record: (data) => api.post('/attendance/record', data),
  getByDateRange: (startDate, endDate, employeeId = null, status = null) => 
    api.get('/attendance', { 
      params: { 
        startDate, 
        endDate, 
        employeeId, 
        status  
      } 
    }),
  getMonthlySummary: (month, year) => 
    api.get('/attendance/monthly-summary', { params: { month, year } }),
  manualEntry: (data) => api.post('/attendance/manual', data),
  createManualAttendance: (data) => api.post('/attendance/manual/special', data),
  createBulkManualAttendance: (data) => api.post('/attendance/manual/bulk', data),
  getById: (id) => api.get(`/attendance/${id}`),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const salaryAPI = {
  calculate: (data) => api.post('/salary/calculate', data),
  getAll: (month, year) => api.get('/salary', { params: { month, year } }),
  getById: (id) => api.get(`/salary/${id}`),
  updateStatus: (id, status) => api.post(`/salary/${id}/status`, { status }),
};

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard-stats'),
};

//CRUD METHODS  ADMIN
export const adminManagementAPI = {
  getAll: () => api.get('/admin-management'),
  getProfile: () => api.get('/admin-management/profile'),
  create: (data) => api.post('/admin-management', data),
  update: (id, data) => api.put(`/admin-management/${id}`, data),
  delete: (id) => api.delete(`/admin-management/${id}`),
};

export const emailConfigAPI = {
  get: () => api.get('/email-config'),
  update: (data) => api.put('/email-config', data),
  test: (data) => api.post('/email-config/test', data),
  
};


export const systemLogsAPI = {
  getAll: (params) => api.get('/system-logs', { params }),
  clearAll: () => api.delete('/system-logs'),
  delete: (id) => api.delete(`/system-logs/${id}`),
};

export default api;