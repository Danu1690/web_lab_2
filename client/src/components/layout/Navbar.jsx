import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { authAPI } from '../../services/auth.js';


const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const currentTheme = isDarkTheme ? 'dark' : 'light';
    
    try {
      // Обновляем тему в БД
      if (isAuthenticated) {
        await authAPI.updateTheme(currentTheme);
      }
      
      // Выполняем выход
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Не показываем навбар пока идет первоначальная загрузка
  if (loading) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🔐 AuthApp
          </Link>
          
          <div className="navbar-links">
            {isAuthenticated ? (
              <>
                <span className="navbar-welcome">
                  👋 Привет, {user?.first_name}!
                </span>
                <Link to="/profile" className="navbar-link">
                  Профиль
                </Link>
                <button
                  onClick={toggleTheme}
                  className="navbar-theme-toggle"
                >
                  {isDarkTheme ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">
                  Вход
                </Link>
                <Link to="/register" className="navbar-link">
                  Регистрация
                </Link>
                <button
                  onClick={toggleTheme}
                  className="navbar-theme-toggle"
                >
                  {isDarkTheme ? '☀️' : '🌙'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;