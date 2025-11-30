import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.login || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.success) {
        login(response.user);
        navigate('/profile', { replace: true });
      } else {
        setError(response.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'Ошибка при входе. Проверьте подключение к серверу.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Вход в систему</h1>
          
          {error && (
            <div className="error-message">
              <strong>Ошибка:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="input-label">Логин или Email</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите ваш логин или email"
                required
                disabled={loading}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите ваш пароль"
                required
                disabled={loading}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Нет аккаунта?{' '}
              <Link to="/register" className="auth-link">
                Зарегистрируйтесь
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;