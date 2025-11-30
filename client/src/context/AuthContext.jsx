import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/auth.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Инициализация аутентификации
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('User not authenticated or session expired');
        // Не аутентифицирован - это нормально
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    if (userData.theme) {
    document.documentElement.setAttribute('data-theme', userData.theme);
    localStorage.setItem('theme', userData.theme);
  }
};

  const logout = async () => {
    try {
      if (user) {
      await authAPI.updateTheme(user.theme || 'light');
    }
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    loading: loading && !authChecked,
    authChecked,
    login,
    logout,
    updateUser
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};