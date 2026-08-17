import api from './api';

export const messageService = {
  /**
   * Send a message or start a conversation
   * @param {{receiverId: number, productId?: number, content: string}} data 
   * @returns {Promise<Object>}
   */
  async sendMessage(data) {
    try {
      const response = await api.post('/api/messages', data);
      return response.data?.data;
    } catch (error) {
      console.error('[MessageService] Send message error:', error);
      throw error;
    }
  },

  /**
   * Get all active conversations for current user
   * @returns {Promise<Array>}
   */
  async getConversations() {
    try {
      const response = await api.get('/api/messages/conversations');
      return response.data?.data || [];
    } catch (error) {
      console.error('[MessageService] Get conversations error:', error);
      throw error;
    }
  },

  /**
   * Get chat history between current user and other user
   * @param {number} otherUserId 
   * @returns {Promise<Array>}
   */
  async getConversationMessages(otherUserId) {
    try {
      const response = await api.get(`/api/messages/${otherUserId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`[MessageService] Get messages for user ${otherUserId} error:`, error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {number} otherUserId 
   * @returns {Promise<void>}
   */
  async markAsRead(otherUserId) {
    try {
      await api.put(`/api/messages/${otherUserId}/read`);
    } catch (error) {
      console.error(`[MessageService] Mark read for user ${otherUserId} error:`, error);
    }
  }
};
