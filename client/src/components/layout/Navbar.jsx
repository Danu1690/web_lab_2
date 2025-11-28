import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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