import axiosInstance from './axios.config';

const profileService = {
  /**
   * Recuperer le profil de l'utilisateur connecte
   * @returns {Promise} Donnees du profil
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  },

  /**
   * Mettre a jour le profil
   * @param {Object} profileData - Donnees du profil a mettre a jour
   * @returns {Promise} Profil mis a jour
   */
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/profile', profileData);
    return response.data;
  },

  /**
   * Uploader une photo de profil
   * @param {File} file - Fichier image
   * @returns {Promise} URL de la photo
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Supprimer la photo de profil
   * @returns {Promise}
   */
  deletePhoto: async () => {
    const response = await axiosInstance.delete('/profile/photo');
    return response.data;
  },

  /**
   * Recuperer les statistiques de l'utilisateur
   * @returns {Promise} Statistiques
   */
  getStatistics: async () => {
    const response = await axiosInstance.get('/profile/statistics');
    return response.data;
  },

  /**
   * Mettre a jour les preferences
   * @param {Object} preferences - Preferences a mettre a jour
   * @returns {Promise} Profil mis a jour
   */
  updatePreferences: async (preferences) => {
    const response = await axiosInstance.put('/profile/preferences', preferences);
    return response.data;
  },

  /**
   * Changer le mot de passe
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise}
   */
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/profile/change-password', passwordData);
    return response.data;
  },

  /**
   * Supprimer le compte
   * @param {string} password - Mot de passe pour confirmation
   * @returns {Promise}
   */
  deleteAccount: async (password) => {
    const response = await axiosInstance.delete('/profile/account', {
      data: { password }
    });
    return response.data;
  },
};

export default profileService;
