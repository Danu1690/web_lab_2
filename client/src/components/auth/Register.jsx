import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    login: '',
    password: '',
    confirmPassword: '',
    age_group: '',
    gender: '',
    agreed_to_terms: false,
    captcha_answer: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Загрузка капчи
  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const response = await authAPI.getCaptcha();
      if (response.success) {
        setCaptcha(response.captcha);
      }
    } catch (error) {
      console.error('Failed to load captcha:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Базовая валидация
    if (!formData.first_name || !formData.last_name || !formData.email || 
        !formData.login || !formData.password || !formData.confirmPassword ||
        !formData.age_group || !formData.gender || !formData.agreed_to_terms ||
        !formData.captcha_answer) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (!captcha) {
      alert('Пожалуйста, загрузите капчу');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await authAPI.register({
        ...submitData,
        captcha_correct_answer: captcha.correct_answer
      });
      
      if (response.success) {
        login(response.token, response.user);
        navigate('/profile', { replace: true });
      } else {
        alert(response.message || 'Ошибка регистрации');
        loadCaptcha();
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Ошибка при регистрации');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Регистрация</h1>

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {/* Форма остается без изменений - используем предыдущую версию */}
            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Имя *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Иван"
                  required
                  disabled={loading}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="input-label">Фамилия *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Иванов"
                  required
                  disabled={loading}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivan@example.com"
                required
                disabled={loading}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Логин *</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Не менее 6 символов"
                required
                disabled={loading}
                className="input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Пароль *</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Не менее 8 символов"
                    required
                    disabled={loading}
                    className="input"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="input-label">Подтверждение *</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль"
                    required
                    disabled={loading}
                    className="input"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Возраст *</label>
              <select
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                required
                disabled={loading}
                className="input"
              >
                <option value="">Выберите вариант</option>
                <option value="over18">Мне 18 лет или больше</option>
                <option value="under18">Мне меньше 18 лет</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Пол *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Мужской
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Женский
                </label>
              </div>
            </div>

            {/* Капча */}
            {captcha && (
              <div className="form-group">
                <label className="input-label">Подтвердите что вы не робот *</label>
                <div className="captcha-container">
                  <div className="captcha-question">
                    <strong>{captcha.question}</strong>
                    <button 
                      type="button" 
                      className="captcha-refresh"
                      onClick={loadCaptcha}
                      disabled={loading}
                    >
                      🔄
                    </button>
                  </div>
                  <input
                    type="number"
                    name="captcha_answer"
                    value={formData.captcha_answer}
                    onChange={handleChange}
                    placeholder="Введите ответ"
                    required
                    disabled={loading}
                    className="input"
                  />
                </div>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreed_to_terms"
                  checked={formData.agreed_to_terms}
                  onChange={handleChange}
                  disabled={loading}
                />
                Принимаю правила использования сервиса *
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="auth-link">
                Войдите
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;