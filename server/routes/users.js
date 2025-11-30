import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Все роуты требуют аутентификации
router.use(requireAuth);

// Получение профиля
router.get('/profile', userController.getProfile);

// Получение всех пользователей
router.get('/all', userController.getAllUsers);

// Обновление темы
router.patch('/theme', userController.updateTheme);

export default router;