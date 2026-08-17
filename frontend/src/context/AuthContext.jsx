import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCachedUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid token:', err?.message);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const data = await authService.register(formData);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed.';
      throw new Error(msg);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
