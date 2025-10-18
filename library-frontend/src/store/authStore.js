import { create } from 'zustand';
import authService from '../api/authService';
import { toast } from 'react-toastify';

/**
 * Store Zustand pour gérer l'état d'authentification
 */
const useAuthStore = create((set, get) => ({
  // État
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  /**
   * Connexion de l'utilisateur
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success(`Bienvenue ${data.user.firstName} !`);
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Erreur de connexion',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ isLoading: false });
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de l\'inscription',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    toast.info('Vous êtes déconnecté');
  },

  /**
   * Récupération du mot de passe
   */
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.forgotPassword(email);
      set({ isLoading: false });
      toast.success('Un email de récupération a été envoyé');
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de l\'envoi',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Réinitialisation du mot de passe
   */
  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.resetPassword(data);
      set({ isLoading: false });
      toast.success('Mot de passe réinitialisé avec succès');
      return result;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Erreur lors de la réinitialisation',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Vérification du token
   */
  verifyToken: async () => {
    const isValid = await authService.verifyToken();
    if (!isValid) {
      get().logout();
    }
    return isValid;
  },

  /**
   * Réinitialisation des erreurs
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;