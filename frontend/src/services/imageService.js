import api from './api';

export const imageService = {
  /**
   * Fetch all images for a product
   * @param {number} productId 
   * @returns {Promise<Array>}
   */
  async getProductImages(productId) {
    try {
      const response = await api.get(`/api/products/${productId}/images`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`[ImageService] Error fetching images for product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Attach an image URL to a product
   * @param {number} productId 
   * @param {string} imageUrl 
   * @returns {Promise<Object>}
   */
  async uploadProductImage(productId, imageUrl) {
    try {
      const response = await api.post(`/api/products/${productId}/images`, { imageUrl });
      return response.data?.data;
    } catch (error) {
      console.error(`[ImageService] Error attaching image to product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product image by ID
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async deleteProductImage(id) {
    try {
      await api.delete(`/api/images/${id}`);
      return true;
    } catch (error) {
      console.error(`[ImageService] Error deleting image ${id}:`, error);
      throw error;
    }
  }
};
