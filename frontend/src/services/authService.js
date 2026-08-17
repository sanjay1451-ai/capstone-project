import api from './api';

const TOKEN_KEY = 'volttrade_jwt_token';
const USER_KEY = 'volttrade_user_data';

export const authService = {
  /**
   * Register a new user account
   * @param {{name: string, email: string, password: string, confirmPassword: string, phone?: string, address?: string}} data 
   * @returns {Promise<{token: string, user: Object}>}
   */
  async register(data) {
    try {
      const response = await api.post('/api/auth/register', data);
      const authData = response.data?.data;
      if (authData?.token) {
        localStorage.setItem(TOKEN_KEY, authData.token);
        localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
      }
      return authData;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, user: Object}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const authData = response.data?.data;
      if (authData?.token) {
        localStorage.setItem(TOKEN_KEY, authData.token);
        localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
      }
      return authData;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user profile
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      const user = response.data?.data;
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('[AuthService] Get current user error:', error);
      throw error;
    }
  },

  /**
   * Update current authenticated user profile
   * @param {{name: string, phone?: string, address?: string, profileImage?: string}} data
   * @returns {Promise<Object>}
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/api/auth/profile', data);
      const user = response.data?.data;
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('[AuthService] Update profile error:', error);
      throw error;
    }
  },

  /**
   * Get public profile for a user/seller by ID
   * @param {number|string} id 
   * @returns {Promise<Object>}
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/api/auth/user/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error('[AuthService] Get user by ID error:', error);
      throw error;
    }
  },

  /**
   * Logout user and clear stored tokens
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get stored JWT token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get cached user profile
   * @returns {Object|null}
   */
  getCachedUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if token exists
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

