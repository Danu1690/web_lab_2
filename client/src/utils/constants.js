export const API_BASE_URL = '/api';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const VALIDATION_RULES = {
  FIRST_NAME: {
    min: 2,
    max: 15,
    pattern: /^[A-Za-zА-Яа-яЁё\s-]+$/
  },
  LAST_NAME: {
    min: 2,
    max: 15, 
    pattern: /^[A-Za-zА-Яа-яЁё\s-]+$/
  },
  LOGIN: {
    min: 6,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    min: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
  }
};

export const AGE_GROUPS = {
  OVER18: 'over18',
  UNDER18: 'under18'
};

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female'
};