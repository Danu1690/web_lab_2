import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { authAPI } from '../services/auth.js';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Загрузка темы при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (isAuthenticated && user?.theme) {
      // Приоритет у темы из БД
      setIsDarkTheme(user.theme === 'dark');
      document.documentElement.setAttribute('data-theme', user.theme);
    } else if (savedTheme) {
      // Иначе берем из localStorage
      setIsDarkTheme(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [user, isAuthenticated]);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme ? 'dark' : 'light';
    const newIsDarkTheme = !isDarkTheme;
    
    setIsDarkTheme(newIsDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Сохраняем в БД если пользователь авторизован
    if (isAuthenticated) {
      try {
        await authAPI.updateTheme(newTheme);
        console.log('✅ Theme saved to database');
      } catch (error) {
        console.error('❌ Failed to save theme to database:', error);
      }
    }
  };

  const value = {
    isDarkTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};