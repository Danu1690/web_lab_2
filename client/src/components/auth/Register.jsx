import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';
import api from '../../services/api.js';

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
  const [fieldValidity, setFieldValidity] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState({});
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

  // Проверка доступности логина/email на сервере
  const checkAvailability = useCallback(async (field, value) => {
    if (!value || value.length < (field === 'email' ? 5 : 6)) return;

    setCheckingAvailability(prev => ({ ...prev, [field]: true }));

    try {
      const response = await api.get(`/auth/check-${field}?value=${encodeURIComponent(value)}`);
      
      if (!response.data.available) {
        setErrors(prev => ({
          ...prev,
          [field]: `Пользователь с таким ${field === 'email' ? 'email' : 'логином'} уже существует`
        }));
        setFieldValidity(prev => ({ ...prev, [field]: false }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        setFieldValidity(prev => ({ ...prev, [field]: true }));
      }
    } catch (error) {
      console.error(`Check ${field} error:`, error);
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  // Валидация полей в реальном времени
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    const newValidity = { ...fieldValidity };

    switch (name) {
      case 'first_name':
        if (!value) {
          newErrors.first_name = 'Имя обязательно';
          newValidity.first_name = false;
        } else if (value.length < 2 || value.length > 15) {
          newErrors.first_name = 'Имя должно быть от 2 до 15 символов';
          newValidity.first_name = false;
        } else if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(value)) {
          newErrors.first_name = 'Имя может содержать только буквы, пробелы и дефисы';
          newValidity.first_name = false;
        } else {
          delete newErrors.first_name;
          newValidity.first_name = true;
        }
        break;

      case 'last_name':
        if (!value) {
          newErrors.last_name = 'Фамилия обязательна';
          newValidity.last_name = false;
        } else if (value.length < 2 || value.length > 15) {
          newErrors.last_name = 'Фамилия должна быть от 2 до 15 символов';
          newValidity.last_name = false;
        } else if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(value)) {
          newErrors.last_name = 'Фамилия может содержать только буквы, пробелы и дефисы';
          newValidity.last_name = false;
        } else {
          delete newErrors.last_name;
          newValidity.last_name = true;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email обязателен';
          newValidity.email = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Введите корректный email';
          newValidity.email = false;
        } else {
          // Email валиден, проверяем доступность
          delete newErrors.email;
          newValidity.email = 'checking';
          checkAvailability('email', value);
        }
        break;

      case 'login':
        if (!value) {
          newErrors.login = 'Логин обязателен';
          newValidity.login = false;
        } else if (value.length < 6) {
          newErrors.login = 'Логин должен быть не менее 6 символов';
          newValidity.login = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.login = 'Логин может содержать только буквы, цифры и подчеркивания';
          newValidity.login = false;
        } else {
          // Логин валиден, проверяем доступность
          delete newErrors.login;
          newValidity.login = 'checking';
          checkAvailability('login', value);
        }
        break;

      case 'password':
      if (!value) {
        newErrors.password = 'Пароль обязателен';
        newValidity.password = false;
      } else if (value.length < 8) {
        newErrors.password = 'Пароль должен быть не менее 8 символов';
        newValidity.password = false;
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
        newErrors.password = 'Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы';
        newValidity.password = false;
      } else {
        delete newErrors.password;
        newValidity.password = true;
      }
      
      // Проверяем подтверждение пароля если оно уже введено
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Пароли не совпадают';
          newValidity.confirmPassword = false;
        } else {
          delete newErrors.confirmPassword;
          newValidity.confirmPassword = true;
        }
      }
      break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Подтверждение пароля обязательно';
          newValidity.confirmPassword = false;
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Пароли не совпадают';
          newValidity.confirmPassword = false;
        } else {
          delete newErrors.confirmPassword;
          newValidity.confirmPassword = true;
        }
        break;

      case 'age_group':
        if (!value) {
          newErrors.age_group = 'Выберите возрастную группу';
          newValidity.age_group = false;
        } else {
          delete newErrors.age_group;
          newValidity.age_group = true;
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = 'Выберите пол';
          newValidity.gender = false;
        } else {
          delete newErrors.gender;
          newValidity.gender = true;
        }
        break;

      case 'captcha_answer':
        if (!value) {
          newErrors.captcha_answer = 'Ответ на капчу обязателен';
          newValidity.captcha_answer = false;
        } else {
          delete newErrors.captcha_answer;
          newValidity.captcha_answer = true;
        }
        break;
    }

    setErrors(newErrors);
    setFieldValidity(newValidity);
  }, [errors, fieldValidity, formData.password, formData.confirmPassword, checkAvailability]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Валидируем поле при изменении
    validateField(name, fieldValue);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Для логина и email делаем дополнительную проверку при потере фокуса
    if ((name === 'login' || name === 'email') && value && !errors[name]) {
      checkAvailability(name, value);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Проверка готовности формы к отправке
  const isFormValid = () => {
    const requiredFields = ['first_name', 'last_name', 'email', 'login', 'password', 'confirmPassword', 'age_group', 'gender', 'captcha_answer'];
    
    // Проверяем что все обязательные поля заполнены
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    ) && formData.agreed_to_terms;

    // Проверяем что нет ошибок валидации
    const noValidationErrors = Object.keys(errors).length === 0;

    // Проверяем что все поля прошли валидацию
    const allFieldsValid = requiredFields.every(field => 
      fieldValidity[field] === true
    );

    return allFieldsFilled && noValidationErrors && allFieldsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидируем все поля перед отправкой
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword' && key !== 'agreed_to_terms') {
        validateField(key, formData[key]);
      }
    });

    if (!isFormValid()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    if (!captcha) {
      alert('Пожалуйста, загрузите капчу');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await authAPI.register(submitData);
      
      if (response.success) {
        login(response.user);
        navigate('/profile', { replace: true });
      } else {
        alert(response.message || 'Ошибка регистрации');
        loadCaptcha();
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
      alert(errorMessage);
      
      // Если ошибка связана с существующим пользователем, обновляем капчу
      if (errorMessage.includes('уже существует')) {
        loadCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

   const getFieldStatusIcon = (fieldName) => {
    const status = fieldValidity[fieldName];
    
    if (status === 'checking') return '⏳';
    if (status === true) return '✅';
    if (status === false) return '❌';
    
    return null;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Регистрация</h1>

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Имя *</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Иван"
                    required
                    disabled={loading}
                    className="input"
                  />
                  {getFieldStatusIcon('first_name') && (
                    <span className="status-icon">{getFieldStatusIcon('first_name')}</span>
                  )}
                </div>
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>
              
              <div className="form-group">
                <label className="input-label">Фамилия *</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Иванов"
                    required
                    disabled={loading}
                    className="input"
                  />
                  {getFieldStatusIcon('last_name') && (
                    <span className="status-icon">{getFieldStatusIcon('last_name')}</span>
                  )}
                </div>
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Email *</label>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ivan@example.com"
                  required
                  disabled={loading}
                  className="input"
                />
                {getFieldStatusIcon('email') && (
                  <span className="status-icon">{getFieldStatusIcon('email')}</span>
                )}
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
              {checkingAvailability.email && (
                <span className="checking-text">Проверяем доступность email...</span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Логин *</label>
              <div className="input-container">
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Не менее 6 символов"
                  required
                  disabled={loading}
                  className="input"
                />
                {getFieldStatusIcon('login') && (
                  <span className="status-icon">{getFieldStatusIcon('login')}</span>
                )}
              </div>
              {errors.login && <span className="error-text">{errors.login}</span>}
              {checkingAvailability.login && (
                <span className="checking-text">Проверяем доступность логина...</span>
              )}
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
                    onBlur={handleBlur}
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
                {errors.password && <span className="error-text">{errors.password}</span>}
                <div className="password-requirements">
                  Пароль должен содержать: заглавные и строчные буквы, цифры, спецсимволы
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
                    onBlur={handleBlur}
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
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Возраст *</label>
              <select
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                className="input"
              >
                <option value="">Выберите вариант</option>
                <option value="over18">Мне 18 лет или больше</option>
                <option value="under18">Мне меньше 18 лет</option>
              </select>
              {errors.age_group && <span className="error-text">{errors.age_group}</span>}
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
                    disabled={loading}
                  />
                  Женский
                </label>
              </div>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
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
                  <div className="input-container">
                    <input
                      type="number"
                      name="captcha_answer"
                      value={formData.captcha_answer}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Введите ответ"
                      required
                      disabled={loading}
                      className="input"
                    />
                    {getFieldStatusIcon('captcha_answer') && (
                      <span className="status-icon">{getFieldStatusIcon('captcha_answer')}</span>
                    )}
                  </div>
                  {errors.captcha_answer && <span className="error-text">{errors.captcha_answer}</span>}
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
              disabled={loading || !isFormValid()}
              className={`auth-button ${!isFormValid() ? 'auth-button-disabled' : ''}`}
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