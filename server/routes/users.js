import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// Получение профиля
router.get('/profile', userController.getProfile);

// Обновление темы
router.patch('/theme', userController.updateTheme);

export default router;