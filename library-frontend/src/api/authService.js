import axiosInstance from './axios.config';

/**
 * Service pour gérer l'authentification
 */
const authService = {
  /**
   * Connexion de l'utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Token et informations utilisateur
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} Confirmation d'inscription
   */
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Récupération du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise} Confirmation d'envoi
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Réinitialisation du mot de passe
   * @param {Object} data - { token, newPassword }
   * @returns {Promise} Confirmation de réinitialisation
   */
  resetPassword: async (data) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Vérification de la validité du token
   * @returns {Promise<boolean>} True si le token est valide
   */
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  /**
   * Récupération de l'utilisateur courant depuis le localStorage
   * @returns {Object|null} Utilisateur ou null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Récupération du token depuis le localStorage
   * @returns {string|null} Token ou null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Vérification si l'utilisateur est connecté
   * @returns {boolean} True si connecté
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;