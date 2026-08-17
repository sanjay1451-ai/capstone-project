import api from './api';

export const categoryService = {
  /**
   * Fetch all categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      return response.data?.data || [];
    } catch (error) {
      console.error('[CategoryService] Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Fetch single category by ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getCategoryById(id) {
    try {
      const response = await api.get(`/api/categories/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error(`[CategoryService] Error fetching category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new category
   * @param {{name: string, description: string}} data 
   * @returns {Promise<Object>}
   */
  async createCategory(data) {
    try {
      const response = await api.post('/api/categories', data);
      return response.data?.data;
    } catch (error) {
      console.error('[CategoryService] Error creating category:', error);
      throw error;
    }
  }
};
