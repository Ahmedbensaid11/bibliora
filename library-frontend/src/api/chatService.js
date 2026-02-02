import axiosInstance from './axios.config';

const chatService = {
  /**
   * Send a chat message
   * @param {string} message - User's message
   * @returns {Promise} Chat response
   */
  sendMessage: async (message) => {
    const response = await axiosInstance.post('/chatbot/chat', { message });
    return response.data;
  },

  /**
   * Check chatbot service health
   * @returns {Promise} Health status
   */
  checkHealth: async () => {
    const response = await axiosInstance.get('/chatbot/health');
    return response.data;
  }
};

export default chatService;
