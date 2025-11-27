import { body, validationResult } from 'express-validator';

// Валидация регистрации
export const registerValidation = [
  body('first_name')
    .isLength({ min: 2, max: 15 })
    .withMessage('Имя должно быть от 2 до 15 символов')
    .matches(/^[A-Za-zА-Яа-яЁё\s-]+$/)
    .withMessage('Имя может содержать только буквы, пробелы и дефисы'),
  
  body('last_name')
    .isLength({ min: 2, max: 15 })
    .withMessage('Фамилия должна быть от 2 до 15 символов')
    .matches(/^[A-Za-zА-Яа-яЁё\s-]+$/)
    .withMessage('Фамилия может содержать только буквы, пробелы и дефисы'),
  
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  
  body('login')
    .isLength({ min: 6 })
    .withMessage('Логин должен быть не менее 6 символов')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Логин может содержать только буквы, цифры и подчеркивания'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль должен быть не менее 8 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы'),
  
  body('age_group')
    .isIn(['over18', 'under18'])
    .withMessage('Выберите корректную возрастную группу'),
  
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Выберите корректный пол'),
  
  body('agreed_to_terms')
    .equals('true')
    .withMessage('Необходимо принять правила использования')
];

// Валидация логина
export const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('Логин обязателен'),
  
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// Обработчик ошибок валидации
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибки валидации',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};