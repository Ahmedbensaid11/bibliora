import axiosInstance from './axios.config';

const authService = {
  /**
   * Connexion de l'utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Token et informations utilisateur
   */
  login: async (credentials) => {
    // Transform the credentials to match backend format
    const loginData = {
      usernameOrEmail: credentials.email,  // Backend expects 'usernameOrEmail'
      password: credentials.password
    };
    
    const response = await axiosInstance.post('/auth/login', loginData);
    
    // Backend returns: accessToken, refreshToken, userId, username, email, roles
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Create user object from response
      const user = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        roles: response.data.roles,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Déconnexion de l'utilisateur avec appel API
   * @returns {Promise} Réponse de l'API
   */
  logout: async () => {
    try {
      // Appel API de déconnexion
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      // Même en cas d'erreur, on nettoie le localStorage
      console.error('Logout API error:', error);
      throw error;
    } finally {
      // Toujours nettoyer le localStorage, même si l'API échoue
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Déconnexion silencieuse (sans appel API)
   * Pour les cas où le token est expiré ou invalide
   */
  silentLogout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },

  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;