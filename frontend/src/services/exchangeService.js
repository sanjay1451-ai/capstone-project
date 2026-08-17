import api from './api';

export const exchangeService = {
  /**
   * Submit a device trade / exchange proposal
   * @param {{productId: number, offeredProductId: number, message?: string}} data 
   * @returns {Promise<Object>}
   */
  async createExchange(data) {
    try {
      const response = await api.post('/api/exchanges', data);
      return response.data?.data;
    } catch (error) {
      console.error('[ExchangeService] Create exchange error:', error);
      throw error;
    }
  },

  /**
   * Get trade proposals sent by current user
   * @returns {Promise<Array>}
   */
  async getSentExchanges() {
    try {
      const response = await api.get('/api/exchanges/sent');
      return response.data?.data || [];
    } catch (error) {
      console.error('[ExchangeService] Get sent exchanges error:', error);
      throw error;
    }
  },

  /**
   * Get trade proposals received for current user's products
   * @returns {Promise<Array>}
   */
  async getReceivedExchanges() {
    try {
      const response = await api.get('/api/exchanges/received');
      return response.data?.data || [];
    } catch (error) {
      console.error('[ExchangeService] Get received exchanges error:', error);
      throw error;
    }
  },

  /**
   * Update exchange status (ACCEPTED, REJECTED, CANCELLED)
   * @param {number} exchangeId 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async updateStatus(exchangeId, status) {
    try {
      const response = await api.put(`/api/exchanges/${exchangeId}/status`, { status });
      return response.data?.data;
    } catch (error) {
      console.error('[ExchangeService] Update exchange status error:', error);
      throw error;
    }
  }
};
