import api from './api';

export const productService = {
  /**
   * Search and filter products
   * @param {{category?: string, status?: string, brand?: string, condition?: string, search?: string}} params 
   * @returns {Promise<Array>}
   */
  async getProducts(params = {}) {
    try {
      const response = await api.get('/api/products', { params });
      return response.data?.data || [];
    } catch (error) {
      console.error('[ProductService] Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetch single product details by ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error(`[ProductService] Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product listing
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createProduct(data) {
    try {
      const response = await api.post('/api/products', data);
      return response.data?.data;
    } catch (error) {
      console.error('[ProductService] Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product listing
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateProduct(id, data) {
    try {
      const response = await api.put(`/api/products/${id}`, data);
      return response.data?.data;
    } catch (error) {
      console.error(`[ProductService] Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product listing
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async deleteProduct(id) {
    try {
      await api.delete(`/api/products/${id}`);
      return true;
    } catch (error) {
      console.error(`[ProductService] Error deleting product ${id}:`, error);
      throw error;
    }
  }
};
