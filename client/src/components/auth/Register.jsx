import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';
import { validateField, validateForm } from '../../utils/validation.js';
import { AGE_GROUPS, GENDERS } from '../../utils/constants.js';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

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

  // Загрузка капчи при монтировании
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

    // Валидация в реальном времени
    if (name !== 'agreed_to_terms' && name !== 'captcha_answer') {
      const error = validateField(name, fieldValue, formData);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
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
    
    // Валидация формы
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    // Проверка капчи
    if (!captcha || parseInt(formData.captcha_answer) !== parseInt(captcha.correct_answer)) {
      setErrors(prev => ({
        ...prev,
        captcha_answer: 'Неверный ответ'
      }));
      alert('Неверный ответ на вопрос безопасности');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, captcha_answer, ...submitData } = formData;
      const response = await authAPI.register({
        ...submitData,
        captcha_answer,
        captcha_correct_answer: captcha.correct_answer
      });
      
      if (response.success) {
        login(response.token, response.user);
        navigate('/profile', { replace: true });
      } else {
        alert(response.message || 'Ошибка регистрации');
        loadCaptcha(); // Обновляем капчу при ошибке
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
        'Ошибка при регистрации. Проверьте подключение к серверу.';
      alert(errorMessage);
      loadCaptcha(); // Обновляем капчу при ошибке
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           formData.agreed_to_terms &&
           formData.captcha_answer;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Регистрация</h1>

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {/* Имя и Фамилия */}
            <div className="form-row">
              <Input
                label="Имя *"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Иван"
                required
                disabled={loading}
                error={errors.first_name}
                autoComplete="given-name"
              />
              
              <Input
                label="Фамилия *"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Иванов"
                required
                disabled={loading}
                error={errors.last_name}
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <Input
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ivan@example.com"
              required
              disabled={loading}
              error={errors.email}
              autoComplete="email"
            />

            {/* Логин */}
            <Input
              label="Логин *"
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Не менее 6 символов"
              required
              disabled={loading}
              error={errors.login}
              autoComplete="username"
              helperText="Только латинские буквы, цифры и подчеркивания"
            />

            {/* Пароли */}
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
                    autoComplete="new-password"
                    className={`input ${errors.password ? 'input-error' : ''}`}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <span className="input-error-text">{errors.password}</span>
                )}
                <span className="input-helper">
                  Заглавные и строчные буквы, цифры, спецсимволы
                </span>
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
                    autoComplete="new-password"
                    className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="input-error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Возраст */}
            <div className="form-group">
              <label className="input-label">Возраст *</label>
              <select
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                required
                disabled={loading}
                className={`input ${errors.age_group ? 'input-error' : ''}`}
              >
                <option value="">Выберите вариант</option>
                <option value={AGE_GROUPS.OVER18}>Мне 18 лет или больше</option>
                <option value={AGE_GROUPS.UNDER18}>Мне меньше 18 лет</option>
              </select>
              {errors.age_group && (
                <span className="input-error-text">{errors.age_group}</span>
              )}
            </div>

            {/* Пол */}
            <div className="form-group">
              <label className="input-label">Пол *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value={GENDERS.MALE}
                    checked={formData.gender === GENDERS.MALE}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Мужской
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value={GENDERS.FEMALE}
                    checked={formData.gender === GENDERS.FEMALE}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Женский
                </label>
              </div>
              {errors.gender && (
                <span className="input-error-text">{errors.gender}</span>
              )}
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
                  <Input
                    type="number"
                    name="captcha_answer"
                    value={formData.captcha_answer}
                    onChange={handleChange}
                    placeholder="Введите ответ"
                    required
                    disabled={loading}
                    error={errors.captcha_answer}
                  />
                </div>
              </div>
            )}

            {/* Чекбокс */}
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
              {errors.agreed_to_terms && (
                <span className="input-error-text">{errors.agreed_to_terms}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading || !isFormValid()}
              className="auth-submit-btn"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
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