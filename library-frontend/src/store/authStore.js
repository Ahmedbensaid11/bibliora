import { create } from 'zustand';
import authService from '../api/authService';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      
      // Extract user info from response
      const user = {
        id: data.userId,
        username: data.username,
        email: data.email,
        roles: data.roles,
      };
      
      set({
        user: user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Bienvenue ${data.username} !`);
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Erreur de connexion',
        isLoading: false 
      });
      throw error;
    }
  },

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
   * Déconnexion avec appel API
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      const data = await authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      toast.success(data?.message || 'Déconnexion réussie');
      return data;
    } catch (error) {
      // Même en cas d'erreur API, on nettoie l'état local
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      toast.info('Déconnecté de l\'application');
      throw error;
    }
  },

  /**
   * Déconnexion silencieuse (pour les tokens expirés)
   */
  silentLogout: () => {
    authService.silentLogout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

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

  verifyToken: async () => {
    try {
      const isValid = await authService.verifyToken();
      if (!isValid) {
        get().silentLogout();
      }
      return isValid;
    } catch (error) {
      get().silentLogout();
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;