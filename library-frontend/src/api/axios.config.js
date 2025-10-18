import axios from 'axios';
import { toast } from 'react-toastify';

// URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Instance Axios personnalisée
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête - Ajoute le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion des erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expiré ou invalide
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expirée. Veuillez vous reconnecter.');
          window.location.href = '/login';
          break;

        case 403:
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          break;

        case 404:
          toast.error('Ressource introuvable.');
          break;

        case 422:
          // Erreurs de validation
          if (data.errors) {
            Object.values(data.errors).forEach((err) => {
              toast.error(err);
            });
          } else {
            toast.error(data.message || 'Erreur de validation.');
          }
          break;

        case 500:
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;

        default:
          toast.error(data.message || 'Une erreur est survenue.');
      }
    } else if (error.request) {
      // Erreur réseau
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } else {
      toast.error('Une erreur inattendue est survenue.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL };