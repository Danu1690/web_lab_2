import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import testRoutes from './test.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/test', testRoutes); // Добавляем тестовые роуты

export default router;