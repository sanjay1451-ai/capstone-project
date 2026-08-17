import api from './api';

export const orderService = {
  /**
   * Place a new order for a product
   * @param {{productId: number, quantity?: number, shippingAddress?: string, notes?: string}} data 
   * @returns {Promise<Object>}
   */
  async createOrder(data) {
    try {
      const response = await api.post('/api/orders', data);
      return response.data?.data;
    } catch (error) {
      console.error('[OrderService] Create order error:', error);
      throw error;
    }
  },

  /**
   * Get orders placed by current user
   * @returns {Promise<Array>}
   */
  async getMyOrders() {
    try {
      const response = await api.get('/api/orders/my-orders');
      return response.data?.data || [];
    } catch (error) {
      console.error('[OrderService] Get my orders error:', error);
      throw error;
    }
  },

  /**
   * Get orders for products listed by current user
   * @returns {Promise<Array>}
   */
  async getSellerOrders() {
    try {
      const response = await api.get('/api/orders/seller-orders');
      return response.data?.data || [];
    } catch (error) {
      console.error('[OrderService] Get seller orders error:', error);
      throw error;
    }
  },

  /**
   * Update order status (CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
   * @param {number} orderId 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status });
      return response.data?.data;
    } catch (error) {
      console.error('[OrderService] Update status error:', error);
      throw error;
    }
  }
};
