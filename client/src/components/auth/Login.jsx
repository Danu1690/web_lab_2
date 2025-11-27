import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

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
    // Очищаем ошибку при изменении поля
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.success) {
        login(response.token, response.user);
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

  const testConnection = async () => {
    try {
      const response = await authAPI.getCaptcha();
      alert('✅ Сервер работает! Капча получена успешно.');
    } catch (error) {
      alert('❌ Ошибка подключения к серверу. Проверьте запущен ли бэкенд.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Вход в систему</h1>
          
          <div className="auth-actions">
            <Button
              variant="secondary"
              size="small"
              onClick={testConnection}
              className="test-connection-btn"
            >
              🔍 Проверить сервер
            </Button>
          </div>

          {error && (
            <div className="error-message">
              <strong>Ошибка:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            <Input
              label="Логин или Email"
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Введите ваш логин или email"
              required
              disabled={loading}
              autoComplete="username"
            />

            <Input
              label="Пароль"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите ваш пароль"
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Нет аккаунта?{' '}
              <Link to="/register" className="auth-link">
                Зарегистрируйтесь
              </Link>
            </p>
          </div>

          <div className="auth-test-credentials">
            <h3>Тестовые данные:</h3>
            <p><strong>Логин:</strong> testuser</p>
            <p><strong>Пароль:</strong> Test123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;