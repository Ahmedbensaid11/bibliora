import axiosInstance from './axios.config';

const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await axiosInstance.get(`/admin/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },

  getTopBooks: async (limit = 5) => {
    const response = await axiosInstance.get(`/admin/dashboard/top-books?limit=${limit}`);
    return response.data;
  },

  getMonthlyStats: async (months = 12) => {
    const response = await axiosInstance.get(`/admin/dashboard/monthly-stats?months=${months}`);
    return response.data;
  },

  getComparativeStats: async (days = 30) => {
    const response = await axiosInstance.get(`/admin/dashboard/comparative-stats?days=${days}`);
    return response.data;
  },

  getUserActivity: async (days = 7) => {
    const response = await axiosInstance.get(`/admin/dashboard/user-activity?days=${days}`);
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  getUserStatistics: async () => {
    const response = await axiosInstance.get('/admin/users/statistics');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  toggleUserActivation: async (id) => {
    const response = await axiosInstance.put(`/admin/users/${id}/toggle-activation`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axiosInstance.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  resetUserPassword: async (id, newPassword) => {
    const response = await axiosInstance.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Loans
  getAllLoans: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/admin/loans${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getLoanStatistics: async () => {
    const response = await axiosInstance.get('/admin/loans/statistics');
    return response.data;
  },

  createLoan: async (loanData) => {
    const response = await axiosInstance.post('/admin/loans', loanData);
    return response.data;
  },

  returnLoan: async (id, returnData = {}) => {
    const response = await axiosInstance.put(`/admin/loans/${id}/return`, returnData);
    return response.data;
  },

  extendLoan: async (id, extendData) => {
    const response = await axiosInstance.put(`/admin/loans/${id}/extend`, extendData);
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await axiosInstance.delete(`/admin/loans/${id}`);
    return response.data;
  },

  getActiveUsersForLoan: async () => {
    const response = await axiosInstance.get('/admin/loans/users');
    return response.data;
  },

  getAvailableBooksForLoan: async () => {
    const response = await axiosInstance.get('/admin/loans/books/available');
    return response.data;
  },

  getLoanActivityTimeline: async (days = 30, groupBy = 'daily') => {
    const response = await axiosInstance.get(`/admin/loans/activity-timeline?days=${days}&groupBy=${groupBy}`);
    return response.data;
  },

  // Books
  getAllBooks: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/admin/books${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getBookStatistics: async () => {
    const response = await axiosInstance.get('/admin/books/statistics');
    return response.data;
  },

  createBook: async (bookData) => {
    const response = await axiosInstance.post('/admin/books', bookData);
    return response.data;
  },

  updateBook: async (id, bookData) => {
    const response = await axiosInstance.put(`/admin/books/${id}`, bookData);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await axiosInstance.delete(`/admin/books/${id}`);
    return response.data;
  },

  // Categories (admin)
  getAllCategories: async () => {
    const response = await axiosInstance.get('/admin/books/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/admin/books/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await axiosInstance.put(`/admin/books/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/admin/books/categories/${id}`);
    return response.data;
  }
};

export default adminService;
