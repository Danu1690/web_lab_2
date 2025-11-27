import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { 
  registerValidation, 
  loginValidation, 
  handleValidationErrors 
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

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

// Получение капчи
router.get('/captcha', authController.getCaptcha);

// Проверка токена
router.get('/verify', authenticateToken, authController.verify);

export default router;