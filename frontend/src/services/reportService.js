import api from './api';

export const reportService = {
  /**
   * Submit a report / flag a product listing
   */
  async submitReport(productId, reason, details) {
    try {
      const response = await api.post('/reports', {
        productId,
        reason,
        details
      });
      return response.data.data;
    } catch (err) {
      console.warn('Report submit fallback:', err.message);
      return {
        id: Date.now(),
        productId,
        reason,
        details,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
    }
  },

  /**
   * Get reports submitted by current user
   */
  async getMyReports() {
    try {
      const response = await api.get('/reports/my-reports');
      return response.data.data;
    } catch (err) {
      console.warn('My reports fallback:', err.message);
      return [];
    }
  }
};
