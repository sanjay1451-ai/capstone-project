import api from './api';

export const healthService = {
  /**
   * Fetches backend health status
   * @returns {Promise<{status: string, environment?: string, timestamp?: string, version?: string}>}
   */
  async checkBackendHealth() {
    const startTime = performance.now();
    try {
      const response = await api.get('/api/health');
      const endTime = performance.now();
      return {
        success: true,
        data: response.data,
        latencyMs: Math.round(endTime - startTime),
        error: null
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        data: null,
        latencyMs: Math.round(endTime - startTime),
        error: error.response?.data?.message || error.message || 'Unable to reach backend'
      };
    }
  }
};
