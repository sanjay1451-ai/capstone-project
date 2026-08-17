import api from './api';

export const favoriteService = {
  /**
   * Add a product to user's favorites
   * @param {number} productId 
   * @returns {Promise<Object>}
   */
  async addFavorite(productId) {
    try {
      const response = await api.post('/api/favorites', { productId });
      return response.data?.data;
    } catch (error) {
      console.error('[FavoriteService] Add favorite error:', error);
      throw error;
    }
  },

  /**
   * Remove a product from user's favorites
   * @param {number} productId 
   * @returns {Promise<Object>}
   */
  async removeFavorite(productId) {
    try {
      const response = await api.delete(`/api/favorites/${productId}`);
      return response.data?.data;
    } catch (error) {
      console.error('[FavoriteService] Remove favorite error:', error);
      throw error;
    }
  },

  /**
   * Toggle a product in user's favorites
   * @param {number} productId 
   * @returns {Promise<{productId: number, isFavorite: boolean, message: string}>}
   */
  async toggleFavorite(productId) {
    try {
      const response = await api.post(`/api/favorites/${productId}`);
      return response.data?.data;
    } catch (error) {
      console.error('[FavoriteService] Toggle favorite error:', error);
      throw error;
    }
  },

  /**
   * Get user's saved wishlist products
   * @returns {Promise<Array>}
   */
  async getMyFavorites() {
    try {
      const response = await api.get('/api/favorites');
      return response.data?.data || [];
    } catch (error) {
      console.error('[FavoriteService] Get favorites error:', error);
      throw error;
    }
  },

  /**
   * Check if a product is in wishlist
   * @param {number} productId 
   * @returns {Promise<boolean>}
   */
  async checkIsFavorite(productId) {
    try {
      const response = await api.get(`/api/favorites/check/${productId}`);
      return response.data?.data?.isFavorite || false;
    } catch {
      return false;
    }
  }
};
