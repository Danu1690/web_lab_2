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
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      padding: '1rem',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          textDecoration: 'none'
        }}>
          🔐 AuthApp
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>
                👋 Привет, {user?.first_name}!
              </span>
              <Link to="/profile" style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px'
              }}>
                Профиль
              </Link>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'var(--color-danger)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.5rem 1rem'
              }}>
                Вход
              </Link>
              <Link to="/register" style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.5rem 1rem'
              }}>
                Регистрация
              </Link>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;