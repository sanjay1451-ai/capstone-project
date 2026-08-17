import api from './api';

export const reviewService = {
  /**
   * Post a rating and review for a product
   * @param {number} productId 
   * @param {{rating: number, comment: string}} data 
   * @returns {Promise<Object>}
   */
  async addReview(productId, data) {
    try {
      const response = await api.post(`/api/products/${productId}/reviews`, data);
      return response.data?.data;
    } catch (error) {
      console.error('[ReviewService] Add review error:', error);
      throw error;
    }
  },

  /**
   * Get all reviews for a product
   * @param {number} productId 
   * @returns {Promise<Array>}
   */
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`);
      return response.data?.data || [];
    } catch (error) {
      console.error('[ReviewService] Get reviews error:', error);
      throw error;
    }
  },

  /**
   * Get rating summary for a product
   * @param {number} productId 
   * @returns {Promise<{productId: number, averageRating: number, totalReviews: number}>}
   */
  async getRatingSummary(productId) {
    try {
      const response = await api.get(`/api/products/${productId}/rating-summary`);
      return response.data?.data || { productId, averageRating: 5.0, totalReviews: 0 };
    } catch {
      return { productId, averageRating: 5.0, totalReviews: 0 };
    }
  }
};
