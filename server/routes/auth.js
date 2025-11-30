import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { 
  registerValidation, 
  loginValidation, 
  handleValidationErrors 
} from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Регистрация
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  authController.register
);

// Логин
router.post(
  '/login', 
  loginValidation,
  handleValidationErrors,
  authController.login
);

// Логаут
router.post('/logout', authController.logout);

// Получение капчи
router.get('/captcha', authController.getCaptcha);

// Проверка аутентификации
router.get('/verify', requireAuth, authController.verify);

// Проверка доступности email
router.get('/check-email', authController.checkEmail);

// Проверка доступности логина
router.get('/check-login', authController.checkLogin);

export default router;