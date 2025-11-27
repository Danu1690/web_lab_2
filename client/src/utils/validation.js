import { VALIDATION_RULES } from './constants.js';

export const validateField = (name, value, formData = {}) => {
  switch (name) {
    case 'first_name':
    case 'last_name':
      if (!value.trim()) return 'Обязательное поле';
      if (value.length < VALIDATION_RULES.FIRST_NAME.min || 
          value.length > VALIDATION_RULES.FIRST_NAME.max) {
        return `Должно быть от ${VALIDATION_RULES.FIRST_NAME.min} до ${VALIDATION_RULES.FIRST_NAME.max} символов`;
      }
      if (!VALIDATION_RULES.FIRST_NAME.pattern.test(value)) {
        return 'Можно использовать только буквы, пробелы и дефисы';
      }
      return '';

    case 'email':
      if (!value.trim()) return 'Обязательное поле';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Неверный формат email';
      }
      return '';

    case 'login':
      if (!value.trim()) return 'Обязательное поле';
      if (value.length < VALIDATION_RULES.LOGIN.min) {
        return `Логин должен быть не менее ${VALIDATION_RULES.LOGIN.min} символов`;
      }
      if (!VALIDATION_RULES.LOGIN.pattern.test(value)) {
        return 'Логин может содержать только латинские буквы, цифры и подчеркивания';
      }
      return '';

    case 'password':
      if (!value) return 'Обязательное поле';
      if (value.length < VALIDATION_RULES.PASSWORD.min) {
        return `Пароль должен быть не менее ${VALIDATION_RULES.PASSWORD.min} символов`;
      }
      if (!VALIDATION_RULES.PASSWORD.pattern.test(value)) {
        return 'Пароль должен содержать заглавные и строчные буквы, цифры и спецсимволы';
      }
      return '';

    case 'confirmPassword':
      if (!value) return 'Обязательное поле';
      if (value !== formData.password) {
        return 'Пароли не совпадают';
      }
      return '';

    case 'captcha_answer':
      if (!value.trim()) return 'Введите ответ';
      return '';

    default:
      return '';
  }
};

export const validateForm = (formData) => {
  const errors = {};
  
  Object.keys(formData).forEach(field => {
    if (field !== 'agreed_to_terms') {
      const error = validateField(field, formData[field], formData);
      if (error) errors[field] = error;
    }
  });

  if (!formData.agreed_to_terms) {
    errors.agreed_to_terms = 'Необходимо принять правила';
  }

  return errors;
};