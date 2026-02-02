import axiosInstance from './axios.config';

const loanService = {
  /**
   * Créer une demande d'emprunt avec informations de livraison
   * @param {number} bookId - ID du livre à emprunter
   * @param {Object} deliveryInfo - Informations de livraison
   * @param {string} deliveryInfo.phone - Numéro de téléphone
   * @param {string} deliveryInfo.deliveryAddress - Adresse de livraison
   * @param {string} deliveryInfo.deliveryNotes - Notes de livraison (optionnel)
   * @param {string} deliveryInfo.preferredPickupDate - Date de retrait souhaitée (optionnel)
   * @returns {Promise} Données de l'emprunt créé
   */
  borrowBook: async (bookId, deliveryInfo = {}) => {
    const response = await axiosInstance.post('/loans', {
      bookId,
      phone: deliveryInfo.phone,
      deliveryAddress: deliveryInfo.deliveryAddress,
      deliveryNotes: deliveryInfo.deliveryNotes,
      preferredPickupDate: deliveryInfo.preferredPickupDate
    });
    return response.data;
  },

  /**
   * Retourner un livre
   * @param {number} loanId - ID de l'emprunt
   * @param {string} notes - Notes optionnelles
   * @returns {Promise} Données de l'emprunt mis à jour
   */
  returnBook: async (loanId, notes = null) => {
    const response = await axiosInstance.put(`/loans/${loanId}/return`, { notes });
    return response.data;
  },

  /**
   * Prolonger un emprunt
   * @param {number} loanId - ID de l'emprunt
   * @param {number} days - Nombre de jours à ajouter (défaut: 7)
   * @returns {Promise} Données de l'emprunt mis à jour
   */
  extendLoan: async (loanId, days = 7) => {
    const response = await axiosInstance.put(`/loans/${loanId}/extend?days=${days}`);
    return response.data;
  },

  /**
   * Récupérer tous mes emprunts
   * @returns {Promise} Liste de tous mes emprunts
   */
  getMyLoans: async () => {
    const response = await axiosInstance.get('/loans/my-loans');
    return response.data;
  },

  /**
   * Récupérer mes emprunts actifs
   * @returns {Promise} Liste des emprunts en cours
   */
  getMyActiveLoans: async () => {
    const response = await axiosInstance.get('/loans/me');
    return response.data;
  },

  /**
   * Récupérer mes emprunts actifs (paginé)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise} Page d'emprunts
   */
  getMyActiveLoansPage: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/loans/me/paged?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Récupérer mon historique d'emprunts
   * @returns {Promise} Liste de l'historique
   */
  getMyLoanHistory: async () => {
    const response = await axiosInstance.get('/loans/history');
    return response.data;
  },

  /**
   * Récupérer mon historique (paginé)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise} Page d'historique
   */
  getMyLoanHistoryPage: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/loans/history/paged?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Récupérer mes emprunts en retard
   * @returns {Promise} Liste des emprunts en retard
   */
  getMyOverdueLoans: async () => {
    const response = await axiosInstance.get('/loans/overdue');
    return response.data;
  },

  /**
   * Récupérer mes statistiques d'emprunts
   * @returns {Promise} Statistiques utilisateur
   */
  getMyLoanStats: async () => {
    const response = await axiosInstance.get('/loans/stats');
    return response.data;
  },

  // ============ Admin Methods ============

  /**
   * Récupérer tous les emprunts (admin)
   * @returns {Promise} Liste de tous les emprunts
   */
  getAllLoans: async () => {
    const response = await axiosInstance.get('/loans/admin/all');
    return response.data;
  },

  /**
   * Récupérer les emprunts par statut (admin)
   * @param {string} status - Statut (ACTIVE, OVERDUE, RETURNED, LOST, CANCELLED)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise} Page d'emprunts
   */
  getLoansByStatus: async (status, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/loans/admin/status/${status}?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Récupérer tous les emprunts en retard (admin)
   * @returns {Promise} Liste des emprunts en retard
   */
  getAllOverdueLoans: async () => {
    const response = await axiosInstance.get('/loans/admin/overdue');
    return response.data;
  },

  /**
   * Récupérer les emprunts à échéance proche (admin)
   * @param {number} daysAhead - Nombre de jours
   * @returns {Promise} Liste des emprunts
   */
  getLoansDueSoon: async (daysAhead = 3) => {
    const response = await axiosInstance.get(`/loans/admin/due-soon?daysAhead=${daysAhead}`);
    return response.data;
  },

  /**
   * Récupérer les statistiques globales (admin)
   * @returns {Promise} Statistiques globales
   */
  getGlobalStats: async () => {
    const response = await axiosInstance.get('/loans/admin/stats');
    return response.data;
  },

  /**
   * Créer un emprunt pour un utilisateur (admin)
   * @param {number} userId - ID de l'utilisateur
   * @param {number} bookId - ID du livre
   * @returns {Promise} Données de l'emprunt créé
   */
  adminBorrowBook: async (userId, bookId) => {
    const response = await axiosInstance.post('/loans/admin', { userId, bookId });
    return response.data;
  },

  /**
   * Marquer un emprunt comme perdu (admin)
   * @param {number} loanId - ID de l'emprunt
   * @returns {Promise} Données de l'emprunt mis à jour
   */
  markAsLost: async (loanId) => {
    const response = await axiosInstance.put(`/loans/admin/${loanId}/lost`);
    return response.data;
  },

  /**
   * Forcer le retour d'un livre (admin)
   * @param {number} loanId - ID de l'emprunt
   * @param {string} notes - Notes optionnelles
   * @returns {Promise} Données de l'emprunt mis à jour
   */
  adminReturnBook: async (loanId, notes = null) => {
    const response = await axiosInstance.put(`/loans/admin/${loanId}/return`, { notes });
    return response.data;
  },

  /**
   * Activer un emprunt en attente de livraison (admin)
   * @param {number} loanId - ID de l'emprunt
   * @returns {Promise} Données de l'emprunt activé
   */
  activateLoan: async (loanId) => {
    const response = await axiosInstance.put(`/admin/loans/${loanId}/activate`);
    return response.data;
  },
};

export default loanService;
